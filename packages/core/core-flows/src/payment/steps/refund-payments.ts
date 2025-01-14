import {
  BigNumberInput,
  IPaymentModuleService,
  Logger,
  PaymentDTO,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  isObject,
  Modules,
  promiseAll,
} from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export const refundPaymentsStepId = "refund-payments-step"
/**
 * This step refunds one or more payments.
 */
export const refundPaymentsStep = createStep(
  refundPaymentsStepId,
  async (
    input: {
      payment_id: string
      amount: BigNumberInput
      created_by?: string
    }[],
    { container }
  ) => {
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
    const paymentModule = container.resolve<IPaymentModuleService>(
      Modules.PAYMENT
    )

    const promises: Promise<PaymentDTO | void>[] = []

    for (const refundInput of input) {
      promises.push(
        paymentModule.refundPayment(refundInput).catch((e) => {
          logger.error(
            `Error was thrown trying to cancel payment - ${refundInput.payment_id} - ${e}`
          )
        })
      )
    }

    const successfulRefunds = (await promiseAll(promises)).filter((payment) =>
      isObject(payment)
    )

    return new StepResponse(successfulRefunds)
  }
)
