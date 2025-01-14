import { isDefined, MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export const validateCartShippingOptionsStepId =
  "validate-cart-shipping-options"
/**
 * This step validates shipping options to ensure they have a price.
 */
export const validateCartShippingOptionsPriceStep = createStep(
  "validate-cart-shipping-options-price",
  async (data: { shippingOptions: any[] }, { container }) => {
    const { shippingOptions = [] } = data
    const optionsMissingPrices: string[] = []

    for (const shippingOption of shippingOptions) {
      const { calculated_price, ...options } = shippingOption

      if (
        shippingOption?.id &&
        !isDefined(calculated_price?.calculated_amount)
      ) {
        optionsMissingPrices.push(options.id)
      }
    }

    if (optionsMissingPrices.length) {
      const ids = optionsMissingPrices.join(", ")

      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Shipping options with IDs ${ids} do not have a price`
      )
    }

    return new StepResponse(void 0)
  }
)
