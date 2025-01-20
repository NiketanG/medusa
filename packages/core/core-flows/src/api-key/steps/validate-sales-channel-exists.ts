import { ISalesChannelModuleService } from "@medusajs/framework/types"
import {
  MedusaError,
  Modules,
  arrayDifference,
} from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The data to validate that the sales channels exist.
 */
export interface ValidateSalesChannelsExistStepInput {
  /**
   * The IDs of the sales channels to validate.
   */
  sales_channel_ids: string[]
}

export const validateSalesChannelsExistStepId = "validate-sales-channels-exist"
/**
 * This step validates that a sales channel exists before linking it to an API key.
 * If the sales channel does not exist, the step throws an error.
 */
export const validateSalesChannelsExistStep = createStep(
  validateSalesChannelsExistStepId,
  async (data: ValidateSalesChannelsExistStepInput, { container }) => {
    const salesChannelModuleService =
      container.resolve<ISalesChannelModuleService>(Modules.SALES_CHANNEL)

    const salesChannels = await salesChannelModuleService.listSalesChannels(
      { id: data.sales_channel_ids },
      { select: ["id"] }
    )

    const salesChannelIds = salesChannels.map((v) => v.id)

    const notFound = arrayDifference(data.sales_channel_ids, salesChannelIds)

    if (notFound.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Sales channels with IDs ${notFound.join(", ")} do not exist`
      )
    }

    return new StepResponse(salesChannelIds)
  }
)
