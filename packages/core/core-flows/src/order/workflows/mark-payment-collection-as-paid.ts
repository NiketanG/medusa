import { PaymentCollectionDTO } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import {
  WorkflowData,
  WorkflowResponse,
  createStep,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../common"
import {
  authorizePaymentSessionStep,
  capturePaymentWorkflow,
} from "../../payment"
import { createPaymentSessionsWorkflow } from "../../payment-collection"

/**
 * The details of the payment collection to validate.
 */
export type ThrowUnlessPaymentCollectionNotePaidInput = {
  /**
   * The payment collection to validate.
   */
  paymentCollection: PaymentCollectionDTO
}

/**
 * This step validates that the payment collection is not paid. If not valid,
 * the step will throw an error.
 * 
 * :::note
 * 
 * You can retrieve a payment collection's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = throwUnlessPaymentCollectionNotPaid({
 *   paymentCollection: {
 *     id: "paycol_123",
 *     // other payment details...
 *   }
 * })
 */
export const throwUnlessPaymentCollectionNotPaid = createStep(
  "validate-existing-payment-collection",
  ({ paymentCollection }: ThrowUnlessPaymentCollectionNotePaidInput) => {
    if (paymentCollection.status !== "not_paid") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Can only mark 'not_paid' payment collection as paid`
      )
    }
  }
)

/**
 * The data to mark a payment collection as paid.
 */
export type MarkPaymentCollectionAsPaidInput = {
  /**
   * The ID of the payment collection to mark as paid.
   */
  payment_collection_id: string
  /**
   * The ID of the order that the payment collection belongs to.
   */
  order_id: string
  /**
   * The ID of the user marking the payment collection as completed.
   */
  captured_by?: string
}

const systemPaymentProviderId = "pp_system_default"
export const markPaymentCollectionAsPaidId = "mark-payment-collection-as-paid"
/**
 * This workflow marks a payment collection for an order as paid. It's used by the
 * [Mark Payment Collection as Paid Admin API Route](https://docs.medusajs.com/api/admin#payment-collections_postpaymentcollectionsidmarkaspaid).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * marking a payment collection for an order as paid.
 * 
 * @example
 * const { result } = await markPaymentCollectionAsPaid(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     payment_collection_id: "paycol_123",
 *   }
 * })
 * 
 * @summary
 * 
 * Mark a payment collection for an order as paid.
 */
export const markPaymentCollectionAsPaid = createWorkflow(
  markPaymentCollectionAsPaidId,
  (
    input: WorkflowData<MarkPaymentCollectionAsPaidInput>
  ) => {
    const paymentCollection = useRemoteQueryStep({
      entry_point: "payment_collection",
      fields: ["id", "status", "amount"],
      variables: { id: input.payment_collection_id },
      throw_if_key_not_found: true,
      list: false,
    })

    throwUnlessPaymentCollectionNotPaid({ paymentCollection })

    const paymentSession = createPaymentSessionsWorkflow.runAsStep({
      input: {
        payment_collection_id: paymentCollection.id,
        provider_id: systemPaymentProviderId,
        data: {},
        context: {},
      },
    })

    const payment = authorizePaymentSessionStep({
      id: paymentSession.id,
      context: { order_id: input.order_id },
    })

    capturePaymentWorkflow.runAsStep({
      input: {
        payment_id: payment.id,
        captured_by: input.captured_by,
        amount: paymentCollection.amount,
      },
    })

    return new WorkflowResponse(payment)
  }
)
