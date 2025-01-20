import { CartDTO, IFulfillmentModuleService } from "@medusajs/framework/types"
import {
  MedusaError,
  Modules,
  arrayDifference,
} from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The details of the cart and its shipping options context.
 */
export interface ValidateCartShippingOptionsStepInput {
  /**
   * The cart to validate shipping options for.
   */
  cart: CartDTO
  /**
   * The context to validate the shipping options.
   */
  shippingOptionsContext: {
    /**
     * Validate whether the shipping options are enabled in the store.
     */
    enabled_in_store?: "true" | "false"
    /**
     * Validate whether the shipping options are used for returns.
     */
    is_return?: "true" | "false"
  }
  /**
   * The IDs of the shipping options to validate.
   */
  option_ids: string[]
}

export const validateCartShippingOptionsStepId =
  "validate-cart-shipping-options"
/**
 * This step validates shipping options to ensure they can be applied on a cart.
 * If not valid, the step throws an error.
 * 
 * @example
 * const data = validateCartShippingOptionsStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart,
 *   option_ids: ["so_123"],
 *   shippingOptionsContext: {}
 * })
 */
export const validateCartShippingOptionsStep = createStep(
  validateCartShippingOptionsStepId,
  async (data: ValidateCartShippingOptionsStepInput, { container }) => {
    const { option_ids: optionIds = [], cart, shippingOptionsContext } = data

    if (!optionIds.length) {
      return new StepResponse(void 0)
    }

    const fulfillmentModule = container.resolve<IFulfillmentModuleService>(
      Modules.FULFILLMENT
    )

    const validShippingOptions =
      await fulfillmentModule.listShippingOptionsForContext(
        {
          id: optionIds,
          context: shippingOptionsContext,
          address: {
            country_code: cart.shipping_address?.country_code,
            province_code: cart.shipping_address?.province,
            city: cart.shipping_address?.city,
            postal_expression: cart.shipping_address?.postal_code,
          },
        },
        { relations: ["rules"] }
      )

    const validShippingOptionIds = validShippingOptions.map((o) => o.id)
    const invalidOptionIds = arrayDifference(optionIds, validShippingOptionIds)

    if (invalidOptionIds.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Shipping Options are invalid for cart.`
      )
    }

    return new StepResponse(void 0)
  }
)
