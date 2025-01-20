import { IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

/**
 * The details of archiving the orders.
 */
export type ArchiveOrdersStepInput = {
  /**
   * The IDs of the orders to archive.
   */
  orderIds: string[]
}

export const archiveOrdersStepId = "archive-orders"
/**
 * This step archives one or more orders.
 */
export const archiveOrdersStep = createStep(
  archiveOrdersStepId,
  async (data: ArchiveOrdersStepInput, { container }) => {
    const service = container.resolve<IOrderModuleService>(Modules.ORDER)

    const archived = await service.archive(data.orderIds)
    return new StepResponse(
      archived,
      archived.map((store) => {
        return {
          id: store.id,
          status: store.status,
        }
      })
    )
  },
  async (archived, { container }) => {
    if (!archived?.length) {
      return
    }

    const service = container.resolve<IOrderModuleService>(Modules.ORDER)

    await service.updateOrders(archived)
  }
)
