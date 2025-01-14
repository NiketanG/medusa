import { Modules, promiseAll } from "@medusajs/framework/utils"
import {
  IFulfillmentModuleService,
  ValidateFulfillmentDataContext,
} from "@medusajs/types"
import { createStep, StepResponse } from "@medusajs/workflows-sdk"

export type ValidateShippingMethodsDataInput = {
  id: string
  provider_id: string
  option_data: Record<string, unknown>
  method_data: Record<string, unknown>
  context: ValidateFulfillmentDataContext
}[]

export const validateAndReturnShippingMethodsDataStepId =
  "validate-and-return-shipping-methods-data"
/**
 * This step validates shipping options to ensure they can be applied on a cart.
 */
export const validateAndReturnShippingMethodsDataStep = createStep(
  validateAndReturnShippingMethodsDataStepId,
  async (data: ValidateShippingMethodsDataInput, { container }) => {
    const optionsToValidate = data ?? []

    if (!optionsToValidate.length) {
      return new StepResponse(void 0)
    }

    const fulfillmentModule = container.resolve<IFulfillmentModuleService>(
      Modules.FULFILLMENT
    )

    const validatedData = await promiseAll(
      optionsToValidate.map(async (option) => {
        const validated = await fulfillmentModule.validateFulfillmentData(
          option.provider_id,
          option.option_data,
          option.method_data,
          option.context as ValidateFulfillmentDataContext
        )

        return {
          [option.id]: validated,
        }
      })
    )

    return new StepResponse(validatedData)
  }
)
