import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  getVariantAvailability,
} from "@medusajs/framework/utils"

export type GetVariantAvailabilityStepInput = {
  variant_ids: string[]
  sales_channel_id: string
}

export const getVariantAvailabilityId = "get-variant-availability"
/**
 * Computes the varaint availability for a list of variants in a given sales channel
 */
export const getVariantAvailabilityStep = createStep(
  getVariantAvailabilityId,
  async (data: GetVariantAvailabilityStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const availability = await getVariantAvailability(query, data)
    return new StepResponse(availability)
  }
)
