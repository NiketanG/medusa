import {
  BigNumberInput,
  IPaymentModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The data to capture a payment.
 */
export type CapturePaymentStepInput = {
  /**
   * The ID of the payment to capture.
   */
  payment_id: string
  /**
   * The ID of the user that captured the payment.
   */
  captured_by?: string
  /**
   * The amount to capture. If not provided, the full payment amount will be captured.
   */
  amount?: BigNumberInput
}

export const capturePaymentStepId = "capture-payment-step"
/**
 * This step captures a payment.
 */
export const capturePaymentStep = createStep(
  capturePaymentStepId,
  async (input: CapturePaymentStepInput, { container }) => {
    const paymentModule = container.resolve<IPaymentModuleService>(
      Modules.PAYMENT
    )

    const payment = await paymentModule.capturePayment(input)

    return new StepResponse(payment)
  }
)
