import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { MedusaError, Modules } from "@medusajs/framework/utils"
export const canDeleteSalesChannelsOrThrowStepId =
  "can-delete-sales-channels-or-throw-step"

export const canDeleteSalesChannelsOrThrowStep = createStep(
  canDeleteSalesChannelsOrThrowStepId,
  async ({ ids }: { ids: string | string[] }, { container }) => {
    const salesChannelIdsToDelete = Array.isArray(ids) ? ids : [ids]

    const storeModule = await container.resolve(Modules.STORE)

    const stores = await storeModule.listStores(
      {
        default_sales_channel_id: salesChannelIdsToDelete,
      },
      {
        select: ["default_sales_channel_id"],
      }
    )

    const defaultSalesChannelIds = stores.map((s) => s.default_sales_channel_id)

    if (defaultSalesChannelIds.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot delete default sales channels: ${defaultSalesChannelIds.join(
          ", "
        )}`
      )
    }

    return new StepResponse(true)
  }
)
