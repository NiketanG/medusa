import {
  OrderChangeActionDTO,
  OrderChangeDTO,
  OrderDTO,
  OrderPreviewDTO,
  OrderWorkflow,
} from "@medusajs/framework/types"
import { ChangeActionType, OrderChangeStatus } from "@medusajs/framework/utils"
import {
  WorkflowData,
  WorkflowResponse,
  createStep,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../../common"
import {
  deleteOrderChangeActionsStep,
  previewOrderChangeStep,
} from "../../steps"
import {
  throwIfIsCancelled,
  throwIfOrderChangeIsNotActive,
} from "../../utils/order-validation"

/**
 * The data to validate that an item that was added in an order edit can be removed.
 */
export type RemoveOrderEditItemActionValidationStepInput = {
  /**
   * The order's details.
   */
  order: OrderDTO
  /**
   * The order change's details.
   */
  orderChange: OrderChangeDTO
  /**
   * The details of the item to be removed.
   */
  input: OrderWorkflow.DeleteOrderEditItemActionWorkflowInput
}

/**
 * This step validates that an item that was added in the order edit can be removed 
 * from the order edit. If the order is canceled or the order change is not active,
 * the step will throw an error.
 * 
 * :::note
 * 
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = removeOrderEditItemActionValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 */
export const removeOrderEditItemActionValidationStep = createStep(
  "remove-item-order-edit-action-validation",
  async function ({
    order,
    orderChange,
    input,
  }: RemoveOrderEditItemActionValidationStepInput) {
    throwIfIsCancelled(order, "Order")
    throwIfOrderChangeIsNotActive({ orderChange })

    const associatedAction = (orderChange.actions ?? []).find(
      (a) => a.id === input.action_id
    ) as OrderChangeActionDTO

    if (!associatedAction) {
      throw new Error(
        `No item found for order ${input.order_id} in order change ${orderChange.id}`
      )
    } else if (
      ![ChangeActionType.ITEM_ADD, ChangeActionType.ITEM_UPDATE].includes(
        associatedAction.action as ChangeActionType
      )
    ) {
      throw new Error(
        `Action ${associatedAction.id} is not adding or updating an item`
      )
    }
  }
)

export const removeItemOrderEditActionWorkflowId =
  "remove-item-order edit-action"
/**
 * This workflow removes an item that was added to an order edit. It's used by the
 * [Remove Item from Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_deleteordereditsiditemsaction_id).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove an item that was 
 * added to an order edit in your custom flow.
 * 
 * @example
 * const { result } = await removeItemOrderEditActionWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 * 
 * @summary
 * 
 * Remove an item that was added to an order edit.
 */
export const removeItemOrderEditActionWorkflow = createWorkflow(
  removeItemOrderEditActionWorkflowId,
  function (
    input: WorkflowData<OrderWorkflow.DeleteOrderEditItemActionWorkflowInput>
  ): WorkflowResponse<OrderPreviewDTO> {
    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: ["id", "status", "canceled_at", "items.*"],
      variables: { id: input.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status", "version", "actions.*"],
      variables: {
        filters: {
          order_id: input.order_id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    removeOrderEditItemActionValidationStep({
      order,
      input,
      orderChange,
    })

    deleteOrderChangeActionsStep({ ids: [input.action_id] })

    return new WorkflowResponse(previewOrderChangeStep(order.id))
  }
)
