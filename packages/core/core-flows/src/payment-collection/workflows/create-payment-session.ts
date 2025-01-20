import {
  PaymentProviderContext,
  PaymentSessionDTO,
} from "@medusajs/framework/types"
import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../common"
import { createPaymentSessionStep } from "../steps"
import { deletePaymentSessionsWorkflow } from "./delete-payment-sessions"

/**
 * The data to create payment sessions.
 */
export interface CreatePaymentSessionsWorkflowInput {
  /**
   * The ID of the payment collection to create payment sessions for.
   */
  payment_collection_id: string
  /**
   * The ID of the payment provider that the payment sessions are associated with.
   * This provider is used to later process the payment sessions and their payments.
   */
  provider_id: string
  /**
   * Custom data relevant for the payment provider to process the payment session.
   * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/payment/payment-session#data-property).
   */
  data?: Record<string, unknown>
  /**
   * Additional context that's useful for the payment provider to process the payment session.
   */
  context?: PaymentProviderContext
}

export const createPaymentSessionsWorkflowId = "create-payment-sessions"
/**
 * This workflow creates payment sessions. It's used by the
 * [Initialize Payment Session Store API Route](https://docs.medusajs.com/api/store#payment-collections_postpaymentcollectionsidpaymentsessions).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create payment sessions in your custom flows.
 * 
 * @example
 * const { result } = await createPaymentSessionsWorkflow(container)
 * .run({
 *   input: {
 *     payment_collection_id: "paycol_123",
 *     provider_id: "pp_system"
 *   }
 * })
 * 
 * @summary
 * 
 * Create payment sessions.
 */
export const createPaymentSessionsWorkflow = createWorkflow(
  createPaymentSessionsWorkflowId,
  (
    input: WorkflowData<CreatePaymentSessionsWorkflowInput>
  ): WorkflowResponse<PaymentSessionDTO> => {
    const paymentCollection = useRemoteQueryStep({
      entry_point: "payment_collection",
      fields: ["id", "amount", "currency_code", "payment_sessions.*"],
      variables: { id: input.payment_collection_id },
      list: false,
    })

    const paymentSessionInput = transform(
      { paymentCollection, input },
      (data) => {
        return {
          payment_collection_id: data.input.payment_collection_id,
          provider_id: data.input.provider_id,
          data: data.input.data,
          context: data.input.context,
          amount: data.paymentCollection.amount,
          currency_code: data.paymentCollection.currency_code,
        }
      }
    )

    const deletePaymentSessionInput = transform(
      { paymentCollection },
      (data) => {
        return {
          ids:
            data.paymentCollection?.payment_sessions?.map((ps) => ps.id) || [],
        }
      }
    )

    // Note: We are deleting an existing active session before creating a new one
    // for a payment collection as we don't support split payments at the moment.
    // When we are ready to accept split payments, this along with other workflows
    // need to be handled correctly
    const [created] = parallelize(
      createPaymentSessionStep(paymentSessionInput),
      deletePaymentSessionsWorkflow.runAsStep({
        input: deletePaymentSessionInput,
      })
    )

    return new WorkflowResponse(created)
  }
)
