import {
  FilterableApiKeyProps,
  IApiKeyModuleService,
  RevokeApiKeyDTO,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The data to revoke API keys.
 */
export type RevokeApiKeysStepInput = {
  /**
   * The filters to select the API keys to revoke.
   */
  selector: FilterableApiKeyProps
  /**
   * The data to revoke the API keys.
   */
  revoke: RevokeApiKeyDTO
}

export const revokeApiKeysStepId = "revoke-api-keys"
/**
 * This step revokes one or more API keys.
 * 
 * @example
 * const data = revokeApiKeysStep({
 *   selector: {
 *     id: "apk_123"
 *   },
 *   revoke: {
 *     revoked_by: "user_123"
 *   }
 * })
 */
export const revokeApiKeysStep = createStep(
  { name: revokeApiKeysStepId, noCompensation: true },
  async (data: RevokeApiKeysStepInput, { container }) => {
    const service = container.resolve<IApiKeyModuleService>(Modules.API_KEY)

    const apiKeys = await service.revoke(data.selector, data.revoke)
    return new StepResponse(apiKeys)
  },
  async () => {}
)
