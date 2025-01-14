import { MedusaError, isPresent } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"

export interface ValidateLineItemPricesStepInput {
  items: {
    unit_price?: number | null
    title: string
  }[]
}

export const validateLineItemPricesStepId = "validate-line-item-prices"
/**
 * This step validates the specified line item objects to ensure they have prices.
 */
export const validateLineItemPricesStep = createStep(
  validateLineItemPricesStepId,
  async (data: ValidateLineItemPricesStepInput, { container }) => {
    if (!data.items?.length) {
      return
    }

    const priceNotFound: string[] = []
    for (const item of data.items) {
      if (!isPresent(item?.unit_price)) {
        priceNotFound.push(item.title)
      }
    }

    if (priceNotFound.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Items ${priceNotFound.join(", ")} do not have a price`
      )
    }
  }
)
