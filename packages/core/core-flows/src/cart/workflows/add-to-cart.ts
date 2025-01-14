import { AddToCartWorkflowInputDTO } from "@medusajs/framework/types"
import { CartWorkflowEvents, isDefined } from "@medusajs/framework/utils"
import {
  createWorkflow,
  parallelize,
  transform,
  when,
  WorkflowData,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "../../common"
import { emitEventStep } from "../../common/steps/emit-event"
import { useRemoteQueryStep } from "../../common/steps/use-remote-query"
import {
  createLineItemsStep,
  getLineItemActionsStep,
  updateLineItemsStep,
} from "../steps"
import { validateCartStep } from "../steps/validate-cart"
import { validateLineItemPricesStep } from "../steps/validate-line-item-prices"
import { validateVariantPricesStep } from "../steps/validate-variant-prices"
import {
  cartFieldsForPricingContext,
  productVariantsFields,
} from "../utils/fields"
import {
  prepareLineItemData,
  PrepareLineItemDataInput,
} from "../utils/prepare-line-item-data"
import { confirmVariantInventoryWorkflow } from "./confirm-variant-inventory"
import { refreshCartItemsWorkflow } from "./refresh-cart-items"

const cartFields = ["completed_at"].concat(cartFieldsForPricingContext)

export const addToCartWorkflowId = "add-to-cart"
/**
 * This workflow adds items to a cart.
 */
export const addToCartWorkflow = createWorkflow(
  addToCartWorkflowId,
  (input: WorkflowData<AddToCartWorkflowInputDTO>) => {
    const cartQuery = useQueryGraphStep({
      entity: "cart",
      filters: { id: input.cart_id },
      fields: cartFields,
      options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" })

    const cart = transform({ cartQuery }, ({ cartQuery }) => {
      return cartQuery.data[0]
    })

    validateCartStep({ cart })

    const variantIds = transform({ input }, (data) => {
      return (data.input.items ?? []).map((i) => i.variant_id).filter(Boolean)
    })

    const variants = when({ variantIds }, ({ variantIds }) => {
      return !!variantIds.length
    }).then(() => {
      return useRemoteQueryStep({
        entry_point: "variants",
        fields: productVariantsFields,
        variables: {
          id: variantIds,
          calculated_price: {
            context: cart,
          },
        },
      })
    })

    validateVariantPricesStep({ variants })

    const lineItems = transform({ input, variants }, (data) => {
      const items = (data.input.items ?? []).map((item) => {
        const variant = (data.variants ?? []).find(
          (v) => v.id === item.variant_id
        )!

        const input: PrepareLineItemDataInput = {
          item,
          variant: variant,
          cartId: data.input.cart_id,
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

    const { itemsToCreate = [], itemsToUpdate = [] } = getLineItemActionsStep({
      id: cart.id,
      items: lineItems,
    })

    confirmVariantInventoryWorkflow.runAsStep({
      input: {
        sales_channel_id: cart.sales_channel_id,
        variants,
        items: input.items,
        itemsToUpdate,
      },
    })

    parallelize(
      createLineItemsStep({
        id: cart.id,
        items: itemsToCreate,
      }),
      updateLineItemsStep({
        id: cart.id,
        items: itemsToUpdate,
      })
    )

    refreshCartItemsWorkflow.runAsStep({
      input: { cart_id: cart.id },
    })

    emitEventStep({
      eventName: CartWorkflowEvents.UPDATED,
      data: { id: cart.id },
    })
  }
)
