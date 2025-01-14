import {
  AdditionalData,
  CreateCartWorkflowInputDTO,
} from "@medusajs/framework/types"
import {
  CartWorkflowEvents,
  isDefined,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  createHook,
  createWorkflow,
  parallelize,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { useRemoteQueryStep } from "../../common/steps/use-remote-query"
import {
  createCartsStep,
  findOneOrAnyRegionStep,
  findOrCreateCustomerStep,
  findSalesChannelStep,
} from "../steps"
import { validateLineItemPricesStep } from "../steps/validate-line-item-prices"
import { validateVariantPricesStep } from "../steps/validate-variant-prices"
import { productVariantsFields } from "../utils/fields"
import {
  prepareLineItemData,
  PrepareLineItemDataInput,
} from "../utils/prepare-line-item-data"
import { confirmVariantInventoryWorkflow } from "./confirm-variant-inventory"
import { refreshPaymentCollectionForCartWorkflow } from "./refresh-payment-collection"
import { updateCartPromotionsWorkflow } from "./update-cart-promotions"
import { updateTaxLinesWorkflow } from "./update-tax-lines"

/**
 * The data to create the cart, along with custom data that's passed to the workflow's hooks.
 */
export type CreateCartWorkflowInput = CreateCartWorkflowInputDTO & AdditionalData

export const createCartWorkflowId = "create-cart"
/**
 * This workflow creates and returns a cart. You can set the cart's items, region, customer, and other details. This workflow is executed by the 
 * [Create Cart Store API Route](https://docs.medusajs.com/api/store#carts_postcarts).
 * 
 * This workflow has a hook that allows you to perform custom actions on the created cart. You can see an example in [this guide](https://docs.medusajs.com/resources/commerce-modules/cart/extend#step-4-consume-cartcreated-workflow-hook).
 * 
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around cart creation.
 * 
 * @example
 * const { result } = await createCartWorkflow(container)
 *   .run({
 *     input: {
 *       region_id: "reg_123",
 *       items: [
 *         {
 *           variant_id: "var_123",
 *           quantity: 1,
 *         }
 *       ],
 *       customer_id: "cus_123",
 *       additional_data: {
 *         external_id: "123"
 *       }
 *     }
 *   })
 * 
 * @summary
 * 
 * Create a cart specifying region, items, and more.
 * 
 * @property hooks.cartCreated - This hook is executed after a cart is created. You can consume this hook to perform custom actions on the created cart.
 */
export const createCartWorkflow = createWorkflow(
  createCartWorkflowId,
  (input: WorkflowData<CreateCartWorkflowInput>) => {
    const variantIds = transform({ input }, (data) => {
      return (data.input.items ?? []).map((i) => i.variant_id).filter(Boolean)
    })

    const [salesChannel, region, customerData] = parallelize(
      findSalesChannelStep({
        salesChannelId: input.sales_channel_id,
      }),
      findOneOrAnyRegionStep({
        regionId: input.region_id,
      }),
      findOrCreateCustomerStep({
        customerId: input.customer_id,
        email: input.email,
      })
    )

    // TODO: This is on par with the context used in v1.*, but we can be more flexible.
    const pricingContext = transform(
      { input, region, customerData },
      (data) => {
        if (!data.region) {
          throw new MedusaError(MedusaError.Types.NOT_FOUND, "No regions found")
        }

        return {
          currency_code: data.input.currency_code ?? data.region.currency_code,
          region_id: data.region.id,
          customer_id: data.customerData.customer?.id,
        }
      }
    )

    const variants = when({ variantIds }, ({ variantIds }) => {
      return !!variantIds.length
    }).then(() => {
      return useRemoteQueryStep({
        entry_point: "variants",
        fields: productVariantsFields,
        variables: {
          id: variantIds,
          calculated_price: {
            context: pricingContext,
          },
        },
      })
    })

    validateVariantPricesStep({ variants })

    confirmVariantInventoryWorkflow.runAsStep({
      input: {
        sales_channel_id: salesChannel.id,
        variants,
        items: input.items!,
      },
    })

    const cartInput = transform(
      { input, region, customerData, salesChannel },
      (data) => {
        if (!data.region) {
          throw new MedusaError(MedusaError.Types.NOT_FOUND, "No regions found")
        }

        const data_ = {
          ...data.input,
          currency_code: data.input.currency_code ?? data.region.currency_code,
          region_id: data.region.id,
        }

        if (data.customerData.customer?.id) {
          data_.customer_id = data.customerData.customer.id
          data_.email = data.input?.email ?? data.customerData.customer.email
        }

        if (data.salesChannel?.id) {
          data_.sales_channel_id = data.salesChannel.id
        }

        // If there is only one country in the region, we prepare a shipping address with that country's code.
        if (
          !data.input.shipping_address &&
          data.region.countries.length === 1
        ) {
          data_.shipping_address = {
            country_code: data.region.countries[0].iso_2,
          }
        }

        return data_
      }
    )

    const lineItems = transform({ input, variants }, (data) => {
      const items = (data.input.items ?? []).map((item) => {
        const variant = (data.variants ?? []).find(
          (v) => v.id === item.variant_id
        )!

        const input: PrepareLineItemDataInput = {
          item,
          variant: variant,
          unitPrice: item.unit_price,
          isTaxInclusive:
            item.is_tax_inclusive ??
            variant?.calculated_price?.is_calculated_price_tax_inclusive,
          isCustomPrice: isDefined(item?.unit_price),
        }

        if (variant && !input.unitPrice) {
          input.unitPrice = variant.calculated_price?.calculated_amount
        }

        return prepareLineItemData(input)
      })

      return items
    })

    validateLineItemPricesStep({ items: lineItems })

    const cartToCreate = transform({ lineItems, cartInput }, (data) => {
      return {
        ...data.cartInput,
        items: data.lineItems,
      }
    })

    const carts = createCartsStep([cartToCreate])
    const cart = transform({ carts }, (data) => data.carts?.[0])

    updateTaxLinesWorkflow.runAsStep({
      input: {
        cart_id: cart.id,
      },
    })

    updateCartPromotionsWorkflow.runAsStep({
      input: {
        cart_id: cart.id,
        promo_codes: input.promo_codes,
      },
    })

    parallelize(
      refreshPaymentCollectionForCartWorkflow.runAsStep({
        input: {
          cart_id: cart.id,
        },
      }),
      emitEventStep({
        eventName: CartWorkflowEvents.CREATED,
        data: { id: cart.id },
      })
    )

    const cartCreated = createHook("cartCreated", {
      cart,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(cart, {
      hooks: [cartCreated],
    })
  }
)
