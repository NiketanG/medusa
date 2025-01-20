import {
  CreateFulfillmentSetDTO,
  IFulfillmentModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The data to create one or more fulfillment sets.
 */
export type CreateFulfillmentSetsStepInput = CreateFulfillmentSetDTO[]

export const createFulfillmentSetsId = "create-fulfillment-sets"
/**
 * This step creates one or more fulfillment sets.
 */
export const createFulfillmentSets = createStep(
  createFulfillmentSetsId,
  async (data: CreateFulfillmentSetsStepInput, { container }) => {
    const service = container.resolve<IFulfillmentModuleService>(
      Modules.FULFILLMENT
    )

    const createSets = await service.createFulfillmentSets(data)

    return new StepResponse(
      createSets,
      createSets.map((createdSet) => createdSet.id)
    )
  },
  async (createSetIds, { container }) => {
    if (!createSetIds?.length) {
      return
    }

    const service = container.resolve<IFulfillmentModuleService>(
      Modules.FULFILLMENT
    )

    await service.deleteFulfillmentSets(createSetIds)
  }
)
