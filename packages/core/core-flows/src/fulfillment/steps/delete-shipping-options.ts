import { DeleteEntityInput } from "@medusajs/framework/modules-sdk"
import { IFulfillmentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The IDs of the shipping options to delete.
 */
export type DeleteShippingOptionsStepInput = string[]

export const deleteShippingOptionsStepId = "delete-shipping-options-step"
/**
 * This step deletes one or more shipping options.
 */
export const deleteShippingOptionsStep = createStep(
  deleteShippingOptionsStepId,
  async (ids: DeleteShippingOptionsStepInput, { container }) => {
    if (!ids?.length) {
      return
    }

    const service = container.resolve<IFulfillmentModuleService>(
      Modules.FULFILLMENT
    )

    const softDeletedEntities = await service.softDeleteShippingOptions(ids)

    return new StepResponse(
      {
        [Modules.FULFILLMENT]: softDeletedEntities,
      } as DeleteEntityInput,
      ids
    )
  },
  async (prevIds, { container }) => {
    if (!prevIds?.length) {
      return
    }

    const service = container.resolve<IFulfillmentModuleService>(
      Modules.FULFILLMENT
    )

    await service.restoreShippingOptions(prevIds)
  }
)
