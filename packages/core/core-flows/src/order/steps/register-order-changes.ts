import {
  IOrderModuleService,
  RegisterOrderChangeDTO,
} from "@medusajs/framework/types"
import { ModuleRegistrationName } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

export const registerOrderChangeStepId = "register-order-change"

/**
 * This step registers an order changes.
 */
export const registerOrderChangesStep = createStep(
  registerOrderChangeStepId,
  async (data: RegisterOrderChangeDTO[], { container }) => {
    const service = container.resolve<IOrderModuleService>(
      ModuleRegistrationName.ORDER
    )

    const orderChanges = await service.registerOrderChange(data)

    return new StepResponse(
      void 0,
      orderChanges.map((c) => c.id)
    )
  },
  async (orderChangeIds, { container }) => {
    if (!orderChangeIds?.length) {
      return
    }

    const service = container.resolve<IOrderModuleService>(
      ModuleRegistrationName.ORDER
    )

    await service.deleteOrderChanges(orderChangeIds)
  }
)
