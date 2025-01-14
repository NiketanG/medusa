import { WebhookActionResult } from "@medusajs/types"
import { PaymentActions } from "@medusajs/utils"
import { createWorkflow, when } from "@medusajs/workflows-sdk"
import { completeCartWorkflow } from "../../cart/workflows/complete-cart"
import { authorizePaymentSessionStep } from "../steps"
import { capturePaymentWorkflow } from "./capture-payment"
import { useQueryGraphStep } from "../../common"

interface ProcessPaymentWorkflowInput extends WebhookActionResult {}

export const processPaymentWorkflowId = "process-payment-workflow"
export const processPaymentWorkflow = createWorkflow(
  processPaymentWorkflowId,
  (input: ProcessPaymentWorkflowInput) => {
    const paymentData = useQueryGraphStep({
      entity: "payment",
      fields: ["id"],
      filters: { payment_session_id: input.data?.session_id },
    }).config({
      name: "payment-query",
    })

    const paymentSessionResult = useQueryGraphStep({
      entity: "payment_session",
      fields: ["payment_collection_id"],
      filters: { id: input.data?.session_id },
    }).config({
      name: "payment-session-query",
    })

    const cartPaymentCollection = useQueryGraphStep({
      entity: "cart_payment_collection",
      fields: ["cart_id"],
      filters: {
        payment_collection_id:
          paymentSessionResult.data[0].payment_collection_id,
      },
    }).config({
      name: "cart-payment-query",
    })

    when({ cartPaymentCollection }, ({ cartPaymentCollection }) => {
      return !!cartPaymentCollection.data.length
    }).then(() => {
      completeCartWorkflow
        .runAsStep({
          input: {
            id: cartPaymentCollection.data[0].cart_id,
          },
        })
        .config({
          continueOnPermanentFailure: true, // Continue payment processing even if cart completion fails
        })
    })

    when({ input }, ({ input }) => {
      return (
        input.action === PaymentActions.SUCCESSFUL && !!paymentData.data.length
      )
    }).then(() => {
      capturePaymentWorkflow.runAsStep({
        input: {
          payment_id: paymentData.data[0].id,
          amount: input.data?.amount,
        },
      })
    })

    when({ input }, ({ input }) => {
      // Authorize payment session if no Cart is linked to the payment
      // When associated with a Cart, the complete cart workflow will handle the authorization
      return (
        !cartPaymentCollection.data.length &&
        input.action === PaymentActions.AUTHORIZED &&
        !!input.data?.session_id
      )
    }).then(() => {
      authorizePaymentSessionStep({
        id: input.data!.session_id,
        context: {},
      })
    })
  }
)
