import { UpdateLineItemInCartWorkflowInputDTO } from "@medusajs/framework/types"
import { isDefined, MedusaError } from "@medusajs/framework/utils"
import {
  createHook,
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "../../common"
import { useRemoteQueryStep } from "../../common/steps/use-remote-query"
import { updateLineItemsStepWithSelector } from "../../line-item/steps"
import { validateCartStep } from "../steps/validate-cart"
import { validateVariantPricesStep } from "../steps/validate-variant-prices"
import {
  cartFieldsForPricingContext,
  productVariantsFields,
} from "../utils/fields"
import { confirmVariantInventoryWorkflow } from "./confirm-variant-inventory"
import { refreshCartItemsWorkflow } from "./refresh-cart-items"

const cartFields = cartFieldsForPricingContext.concat(["items.*"])

export const updateLineItemInCartWorkflowId = "update-line-item-in-cart"
/**
 * This workflow updates a line item's details in a cart. You can update the line item's quantity, unit price, and more. This workflow is executed
 * by the [Update Line Item Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidlineitemsline_id).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you to update a line item's details in your custom flows.
 * 
 * @example
 * const { result } = await updateLineItemInCartWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     item_id: "item_123",
 *     update: {
 *       quantity: 2
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update a cart's line item.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 */
export const updateLineItemInCartWorkflow = createWorkflow(
  updateLineItemInCartWorkflowId,
  (input: WorkflowData<UpdateLineItemInCartWorkflowInputDTO>) => {
    const cartQuery = useQueryGraphStep({
      entity: "cart",
      filters: { id: input.cart_id },
      fields: cartFields,
      options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" })

    const cart = transform({ cartQuery }, ({ cartQuery }) => cartQuery.data[0])
    const item = transform({ cart, input }, ({ cart, input }) => {
      return cart.items.find((i) => i.id === input.item_id)
    })

    validateCartStep({ cart })

    const validate = createHook("validate", {
      input,
      cart,
    })

    const variantIds = transform({ item }, ({ item }) => {
      return [item.variant_id].filter(Boolean)
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
      }).config({ name: "fetch-variants" })
    })

    validateVariantPricesStep({ variants })

    const items = transform({ input, item }, (data) => {
      return [
        Object.assign(data.item, { quantity: data.input.update.quantity }),
      ]
    })

    confirmVariantInventoryWorkflow.runAsStep({
      input: {
        sales_channel_id: cart.sales_channel_id,
        variants,
        items,
      },
    })

    const lineItemUpdate = transform({ input, variants, item }, (data) => {
      const variant = data.variants?.[0] ?? undefined
      const item = data.item

      const updateData = {
        ...data.input.update,
        unit_price: isDefined(data.input.update.unit_price)
          ? data.input.update.unit_price
          : item.unit_price,
        is_custom_price: isDefined(data.input.update.unit_price)
          ? true
          : item.is_custom_price,
        is_tax_inclusive:
          item.is_tax_inclusive ||
          variant?.calculated_price?.is_calculated_price_tax_inclusive,
      }

      if (variant && !updateData.is_custom_price) {
        updateData.unit_price = variant.calculated_price.calculated_amount
      }

      if (!isDefined(updateData.unit_price)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Line item ${item.title} has no unit price`
        )
      }

      return {
        data: updateData,
        selector: {
          id: data.input.item_id,
        },
      }
    })

    updateLineItemsStepWithSelector(lineItemUpdate)

    refreshCartItemsWorkflow.runAsStep({
      input: { cart_id: input.cart_id },
    })

    return new WorkflowResponse(void 0, {
      hooks: [validate],
    })
  }
)
