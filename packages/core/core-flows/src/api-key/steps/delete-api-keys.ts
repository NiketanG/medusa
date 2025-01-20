import { IApiKeyModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The IDs of the API keys to delete.
 */
export type DeleteApiKeysStepInput = string[]

export const deleteApiKeysStepId = "delete-api-keys"
/**
 * This step deletes one or more API keys.
 */
export const deleteApiKeysStep = createStep(
  { name: deleteApiKeysStepId, noCompensation: true },
  async (ids: DeleteApiKeysStepInput, { container }) => {
    const service = container.resolve<IApiKeyModuleService>(Modules.API_KEY)

    await service.deleteApiKeys(ids)
    return new StepResponse(void 0)
  },
  async () => {}
)
