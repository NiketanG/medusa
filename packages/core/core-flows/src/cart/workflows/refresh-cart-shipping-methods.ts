import { isDefined, isPresent } from "@medusajs/framework/utils"
import {
  createHook,
  createWorkflow,
  parallelize,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "../../common"
import { removeShippingMethodFromCartStep } from "../steps"
import { updateShippingMethodsStep } from "../steps/update-shipping-methods"
import { listShippingOptionsForCartWithPricingWorkflow } from "./list-shipping-options-for-cart-with-pricing"

/**
 * The details of the cart to refresh.
 */
export type RefreshCartShippingMethodsWorkflowInput = { 
  /**
   * The cart's ID.
   */
  cart_id: string
}

export const refreshCartShippingMethodsWorkflowId =
  "refresh-cart-shipping-methods"
/**
 * This workflow refreshes a cart's shipping methods, ensuring that their associated shipping options can still be used on the cart,
 * and retrieve their correct pricing after a cart update. This workflow is used by the {@link refreshCartItemsWorkflow}.
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you to refresh the cart's shipping method after making updates to the cart.
 * 
 * @example
 * const { result } = await refreshCartShippingMethodsWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *   }
 * })
 * 
 * @summary
 * 
 * Refresh a cart's shipping methods after an update.
 * 
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 */
export const refreshCartShippingMethodsWorkflow = createWorkflow(
  refreshCartShippingMethodsWorkflowId,
  (input: WorkflowData<RefreshCartShippingMethodsWorkflowInput>) => {
    const cartQuery = useQueryGraphStep({
      entity: "cart",
      filters: { id: input.cart_id },
      fields: [
        "id",
        "sales_channel_id",
        "currency_code",
        "region_id",
        "shipping_methods.*",
        "shipping_address.city",
        "shipping_address.country_code",
        "shipping_address.province",
        "shipping_methods.shipping_option_id",
        "shipping_methods.data",
        "total",
      ],
      options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" })

    const cart = transform({ cartQuery }, ({ cartQuery }) => cartQuery.data[0])
    const listShippingOptionsInput = transform({ cart }, ({ cart }) =>
      (cart.shipping_methods || [])
        .map((shippingMethod) => ({
          id: shippingMethod.shipping_option_id,
          data: shippingMethod.data,
        }))
        .filter(Boolean)
    )

    const validate = createHook("validate", {
      input,
      cart,
    })

    when({ listShippingOptionsInput }, ({ listShippingOptionsInput }) => {
      return !!listShippingOptionsInput?.length
    }).then(() => {
      const shippingOptions =
        listShippingOptionsForCartWithPricingWorkflow.runAsStep({
          input: {
            options: listShippingOptionsInput,
            cart_id: cart.id,
            is_return: false,
          },
        })

      // Creates an object on which shipping methods to remove or update depending
      // on the validity of the shipping options for the cart
      const shippingMethodsData = transform(
        { cart, shippingOptions },
        ({ cart, shippingOptions }) => {
          const { shipping_methods: shippingMethods = [] } = cart

          const validShippingMethods = shippingMethods.filter(
            (shippingMethod) => {
              // Fetch  the available shipping options for the cart context and find the one associated
              // with the current shipping method
              const shippingOption = shippingOptions.find(
                (shippingOption) =>
                  shippingOption.id === shippingMethod.shipping_option_id
              )

              const shippingOptionPrice =
                shippingOption?.calculated_price?.calculated_amount

              // The shipping method is only valid if both the shipping option and the price is found
              // for the context of the cart. The invalid options will lead to a deleted shipping method
              if (isPresent(shippingOption) && isDefined(shippingOptionPrice)) {
                return true
              }

              return false
            }
          )

          const shippingMethodIds = shippingMethods.map((sm) => sm.id)
          const validShippingMethodIds = validShippingMethods.map((sm) => sm.id)
          const invalidShippingMethodIds = shippingMethodIds.filter(
            (id) => !validShippingMethodIds.includes(id)
          )

          const shippingMethodsToUpdate = validShippingMethods.map(
            (shippingMethod) => {
              const shippingOption = shippingOptions.find(
                (s) => s.id === shippingMethod.shipping_option_id
              )!

              return {
                id: shippingMethod.id,
                shipping_option_id: shippingOption.id,
                amount: shippingOption.calculated_price.calculated_amount,
                is_tax_inclusive:
                  shippingOption.calculated_price
                    .is_calculated_price_tax_inclusive,
              }
            }
          )

          return {
            shippingMethodsToRemove: invalidShippingMethodIds,
            shippingMethodsToUpdate,
          }
        }
      )

      parallelize(
        removeShippingMethodFromCartStep({
          shipping_method_ids: shippingMethodsData.shippingMethodsToRemove,
        }),
        updateShippingMethodsStep(shippingMethodsData.shippingMethodsToUpdate)
      )
    })

    return new WorkflowResponse(void 0, {
      hooks: [validate],
    })
  }
)
