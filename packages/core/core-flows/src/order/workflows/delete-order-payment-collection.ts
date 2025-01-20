import { PaymentCollectionDTO } from "@medusajs/framework/types"
import {
  MedusaError,
  Modules,
  PaymentCollectionStatus,
} from "@medusajs/framework/utils"
import {
  WorkflowData,
  createStep,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { removeRemoteLinkStep, useRemoteQueryStep } from "../../common"

/**
 * This step validates that the order doesn't have an active payment collection.
 */
export const throwUnlessStatusIsNotPaid = createStep(
  "validate-payment-collection",
  ({ paymentCollection }: { paymentCollection: PaymentCollectionDTO }) => {
    if (paymentCollection.status !== PaymentCollectionStatus.NOT_PAID) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Can only delete payment collections where status is not_paid`
      )
    }
  }
)

/**
 * The details of the payment collection to delete.
 */
export type DeleteOrderPaymentCollectionsInput = {
  /**
   * The ID of the payment collection to delete.
   */
  id: string
}

export const deleteOrderPaymentCollectionsId =
  "delete-order-payment-collectionworkflow"
/**
 * This workflow deletes one or more payment collections of an order. It's used by the 
 * [Delete Payment Collection API Route](https://docs.medusajs.com/api/admin#payment-collections_deletepaymentcollectionsid).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * deleting a payment collection of an order.
 * 
 * @example
 * const { result } = await deleteOrderPaymentCollections(container)
 * .run({
 *   input: {
 *     id: "order_123"
 *   }
 * })
 * 
 * @summary
 * 
 * Delete a payment collection of an order.
 */
export const deleteOrderPaymentCollections = createWorkflow(
  deleteOrderPaymentCollectionsId,
  (input: WorkflowData<DeleteOrderPaymentCollectionsInput>): WorkflowData<void> => {
    const paymentCollection = useRemoteQueryStep({
      entry_point: "payment_collection",
      fields: ["id", "status"],
      variables: { id: input.id },
      throw_if_key_not_found: true,
      list: false,
    }).config({ name: "payment-collection-query" })

    throwUnlessStatusIsNotPaid({ paymentCollection })

    removeRemoteLinkStep({
      [Modules.PAYMENT]: { payment_collection_id: input.id },
    })
  }
)
