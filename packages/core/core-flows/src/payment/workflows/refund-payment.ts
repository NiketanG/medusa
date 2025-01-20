import { BigNumberInput, OrderDTO, PaymentDTO } from "@medusajs/framework/types"
import { MathBN, MedusaError, PaymentEvents } from "@medusajs/framework/utils"
import {
  WorkflowData,
  WorkflowResponse,
  createStep,
  createWorkflow,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep, useRemoteQueryStep } from "../../common"
import { addOrderTransactionStep } from "../../order/steps/add-order-transaction"
import { refundPaymentStep } from "../steps/refund-payment"

/**
 * The data to validate whether the refund is valid for the order.
 */
export type ValidateRefundStepInput = {
  /**
   * The order's details.
   */
  order: OrderDTO
  /**
   * The order's payment details.
   */
  payment: PaymentDTO
  /**
   * The amound to refund.
   */
  amount?: BigNumberInput
}

/**
 * This step validates that the refund is valid for the order.
 * If the order does not have an outstanding balance to refund, the step throws an error.
 * 
 * :::note
 * 
 * You can retrieve an order or payment's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = validateRefundStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   payment: {
 *     id: "payment_123",
 *     // other payment details...
 *   },
 *   amount: 10
 * })
 */
export const validateRefundStep = createStep(
  "validate-refund-step",
  async function ({
    order,
    payment,
    amount,
  }: ValidateRefundStepInput) {
    const pendingDifference = order.summary?.raw_pending_difference!

    if (MathBN.gte(pendingDifference, 0)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Order does not have an outstanding balance to refund`
      )
    }

    const amountPending = MathBN.mult(pendingDifference, -1)
    const amountToRefund = amount ?? payment.raw_amount ?? payment.amount

    if (MathBN.gt(amountToRefund, amountPending)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot refund more than pending difference - ${amountPending}`
      )
    }
  }
)

/**
 * The data to refund a payment.
 */
export type RefundPaymentWorkflowInput = {
  /**
   * The ID of the payment to refund.
   */
  payment_id: string
  /**
   * The ID of the user that refunded the payment.
   */
  created_by?: string
  /**
   * The amount to refund. If not provided, the full payment amount will be refunded.
   */
  amount?: BigNumberInput
}

export const refundPaymentWorkflowId = "refund-payment-workflow"
/**
 * This workflow refunds a payment. It's used by the 
 * [Refund Payment Admin API Route](https://docs.medusajs.com/api/admin#payments_postpaymentsidrefund).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to refund a payment in your custom flows.
 * 
 * @example
 * const { result } = await refundPaymentWorkflow(container)
 * .run({
 *   input: {
 *     payment_id: "payment_123",
 *   }
 * })
 * 
 * @summary
 * 
 * Refund a payment.
 */
export const refundPaymentWorkflow = createWorkflow(
  refundPaymentWorkflowId,
  (
    input: WorkflowData<RefundPaymentWorkflowInput>
  ) => {
    const payment = useRemoteQueryStep({
      entry_point: "payment",
      fields: [
        "id",
        "payment_collection_id",
        "currency_code",
        "amount",
        "raw_amount",
      ],
      variables: { id: input.payment_id },
      list: false,
      throw_if_key_not_found: true,
    })

    const orderPaymentCollection = useRemoteQueryStep({
      entry_point: "order_payment_collection",
      fields: ["order.id"],
      variables: { payment_collection_id: payment.payment_collection_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-payment-collection" })

    const order = useRemoteQueryStep({
      entry_point: "order",
      fields: ["id", "summary", "currency_code", "region_id"],
      variables: { id: orderPaymentCollection.order.id },
      throw_if_key_not_found: true,
      list: false,
    }).config({ name: "order" })

    validateRefundStep({ order, payment, amount: input.amount })
    refundPaymentStep(input)

    when({ orderPaymentCollection }, ({ orderPaymentCollection }) => {
      return !!orderPaymentCollection?.order?.id
    }).then(() => {
      const orderTransactionData = transform(
        { input, payment, orderPaymentCollection },
        ({ input, payment, orderPaymentCollection }) => {
          return {
            order_id: orderPaymentCollection.order.id,
            amount: MathBN.mult(
              input.amount ?? payment.raw_amount ?? payment.amount,
              -1
            ),
            currency_code: payment.currency_code ?? order.currency_code,
            reference_id: payment.id,
            reference: "refund",
          }
        }
      )

      addOrderTransactionStep(orderTransactionData)
    })

    emitEventStep({
      eventName: PaymentEvents.REFUNDED,
      data: { id: payment.id },
    })

    return new WorkflowResponse(payment)
  }
)
