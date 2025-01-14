import { CartWorkflowEvents, MedusaError } from "@medusajs/framework/utils"
import {
  createWorkflow,
  parallelize,
  transform,
  WorkflowData,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common/steps/emit-event"
import { useRemoteQueryStep } from "../../common/steps/use-remote-query"
import {
  addShippingMethodToCartStep,
  removeShippingMethodFromCartStep,
  validateCartShippingOptionsStep,
} from "../steps"
import { validateCartStep } from "../steps/validate-cart"
import { validateAndReturnShippingMethodsDataStep } from "../steps/validate-shipping-methods-data"
import { validateCartShippingOptionsPriceStep } from "../steps/validate-shipping-options-price"
import { cartFieldsForRefreshSteps } from "../utils/fields"
import { listShippingOptionsForCartWithPricingWorkflow } from "./list-shipping-options-for-cart-with-pricing"
import { refreshCartItemsWorkflow } from "./refresh-cart-items"

export interface AddShippingMethodToCartWorkflowInput {
  cart_id: string
  options: {
    id: string
    data?: Record<string, unknown>
  }[]
}

export const addShippingMethodToCartWorkflowId = "add-shipping-method-to-cart"
/**
 * This workflow adds shipping methods to a cart.
 */
export const addShippingMethodToCartWorkflow = createWorkflow(
  addShippingMethodToCartWorkflowId,
  (
    input: WorkflowData<AddShippingMethodToCartWorkflowInput>
  ): WorkflowData<void> => {
    const cart = useRemoteQueryStep({
      entry_point: "cart",
      fields: cartFieldsForRefreshSteps,
      variables: { id: input.cart_id },
      list: false,
    })

    validateCartStep({ cart })

    const optionIds = transform({ input }, (data) => {
      return (data.input.options ?? []).map((i) => i.id)
    })

    validateCartShippingOptionsStep({
      option_ids: optionIds,
      cart,
      shippingOptionsContext: { is_return: "false", enabled_in_store: "true" },
    })

    const shippingOptions =
      listShippingOptionsForCartWithPricingWorkflow.runAsStep({
        input: {
          options: input.options,
          cart_id: cart.id,
          is_return: false,
        },
      })

    validateCartShippingOptionsPriceStep({ shippingOptions })

    const validateShippingMethodsDataInput = transform(
      { input, shippingOptions, cart },
      ({ input, shippingOptions, cart }) => {
        return input.options.map((inputOption) => {
          const shippingOption = shippingOptions.find(
            (so) => so.id === inputOption.id
          )

          return {
            id: inputOption.id,
            provider_id: shippingOption?.provider_id,
            option_data: shippingOption?.data ?? {},
            method_data: inputOption.data ?? {},
            context: {
              ...cart,
              from_location: shippingOption?.stock_location ?? {},
            },
          }
        })
      }
    )

    const validatedMethodData = validateAndReturnShippingMethodsDataStep(
      validateShippingMethodsDataInput
    )

    const shippingMethodInput = transform(
      {
        input,
        shippingOptions,
        validatedMethodData,
      },
      (data) => {
        const options = (data.input.options ?? []).map((option) => {
          const shippingOption = data.shippingOptions.find(
            (so) => so.id === option.id
          )!

          if (!shippingOption?.calculated_price) {
            throw new MedusaError(
              MedusaError.Types.INVALID_DATA,
              `Shipping option with ID ${shippingOption.id} do not have a price`
            )
          }

          const methodData = data.validatedMethodData?.find((methodData) => {
            return methodData?.[option.id]
          })

          return {
            shipping_option_id: shippingOption.id,
            amount: shippingOption.calculated_price.calculated_amount,
            is_tax_inclusive:
              !!shippingOption.calculated_price
                .is_calculated_price_tax_inclusive,
            data: methodData?.[option.id] ?? {},
            name: shippingOption.name,
            cart_id: data.input.cart_id,
          }
        })

        return options
      }
    )

    const currentShippingMethods = transform({ cart }, ({ cart }) =>
      cart.shipping_methods.map((sm) => sm.id)
    )

    parallelize(
      removeShippingMethodFromCartStep({
        shipping_method_ids: currentShippingMethods,
      }),
      addShippingMethodToCartStep({
        shipping_methods: shippingMethodInput,
      }),
      emitEventStep({
        eventName: CartWorkflowEvents.UPDATED,
        data: { id: input.cart_id },
      })
    )

    refreshCartItemsWorkflow.runAsStep({
      input: { cart_id: cart.id },
    })
  }
)
