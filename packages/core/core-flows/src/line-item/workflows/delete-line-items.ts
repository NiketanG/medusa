import { WorkflowData, createWorkflow } from "@medusajs/framework/workflows-sdk"
import { refreshCartItemsWorkflow } from "../../cart/workflows/refresh-cart-items"
import { deleteLineItemsStep } from "../steps/delete-line-items"

export type DeleteLineItemsWorkflowInput = { cart_id: string; ids: string[] }

export const deleteLineItemsWorkflowId = "delete-line-items"
/**
 * This workflow deletes line items from a cart.
 */
export const deleteLineItemsWorkflow = createWorkflow(
  deleteLineItemsWorkflowId,
  (input: WorkflowData<DeleteLineItemsWorkflowInput>) => {
    deleteLineItemsStep(input.ids)

    refreshCartItemsWorkflow.runAsStep({
      input: { cart_id: input.cart_id },
    })
  }
)
