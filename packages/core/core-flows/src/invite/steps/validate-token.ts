import { IUserModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The token to validate.
 */
export type ValidateTokenStepInput = string

export const validateTokenStepId = "validate-invite-token-step"
/**
 * This step validates a specified token and returns its associated invite.
 * If not valid, the step throws an error.
 */
export const validateTokenStep = createStep(
  validateTokenStepId,
  async (input: ValidateTokenStepInput, { container }) => {
    const userModuleService: IUserModuleService = container.resolve(
      Modules.USER
    )

    const invite = await userModuleService.validateInviteToken(input)

    return new StepResponse(invite)
  }
)
