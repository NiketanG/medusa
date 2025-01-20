import {
  OrderChangeDTO,
  OrderDTO,
  OrderPreviewDTO,
  OrderWorkflow,
} from "@medusajs/framework/types"
import {
  BigNumber,
  ChangeActionType,
  MathBN,
  OrderChangeStatus,
} from "@medusajs/framework/utils"
import {
  WorkflowData,
  WorkflowResponse,
  createStep,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../../common"
import { previewOrderChangeStep } from "../../steps/preview-order-change"
import {
  throwIfIsCancelled,
  throwIfOrderChangeIsNotActive,
} from "../../utils/order-validation"
import { createOrderChangeActionsWorkflow } from "../create-order-change-actions"

/**
 * The data to validate that the quantity of an existing item in an order can be updated in an order edit.
 */
export type OrderEditUpdateItemQuantityValidationStepInput = {
  /**
   * The order's details.
   */
  order: OrderDTO
  /**
   * The order change's details.
   */
  orderChange: OrderChangeDTO
}

/**
 * This step validates that the quantity of an existing item in an order can be updated in an order edit.
 * If the order is canceled or the order change is not active, the step will throw an error.
 * 
 * :::note
 * 
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = orderEditUpdateItemQuantityValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
export const orderEditUpdateItemQuantityValidationStep = createStep(
  "order-edit-update-item-quantity-validation",
  async function ({
    order,
    orderChange,
  }: OrderEditUpdateItemQuantityValidationStepInput) {
    throwIfIsCancelled(order, "Order")
    throwIfOrderChangeIsNotActive({ orderChange })
  }
)

export const orderEditUpdateItemQuantityWorkflowId =
  "order-edit-update-item-quantity"
/**
 * This workflow updates the quantity of an existing item in an order's edit. It's used by the
 * [Update Order Item Quantity Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditemsitemitem_id).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update the quantity of an existing 
 * item in an order's edit in your custom flow.
 * 
 * @example
 * const { result } = await orderEditUpdateItemQuantityWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 2,
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Update the quantity of an existing order item in the order's edit.
 */
export const orderEditUpdateItemQuantityWorkflow = createWorkflow(
  orderEditUpdateItemQuantityWorkflowId,
  function (
    input: WorkflowData<OrderWorkflow.OrderEditUpdateItemQuantityWorkflowInput>
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
      fields: ["id", "status"],
      variables: {
        filters: {
          order_id: input.order_id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    orderEditUpdateItemQuantityValidationStep({
      order,
      orderChange,
    })

    const orderChangeActionInput = transform(
      { order, orderChange, items: input.items },
      ({ order, orderChange, items }) => {
        return items.map((item) => {
          const existing = order?.items?.find(
            (exItem) => exItem.id === item.id
          )!

          const quantityDiff = new BigNumber(
            MathBN.sub(item.quantity, existing.quantity)
          )

          return {
            order_change_id: orderChange.id,
            order_id: order.id,
            version: orderChange.version,
            action: ChangeActionType.ITEM_UPDATE,
            internal_note: item.internal_note,
            details: {
              reference_id: item.id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              compare_at_unit_price: item.compare_at_unit_price,
              quantity_diff: quantityDiff,
            },
          }
        })
      }
    )

    createOrderChangeActionsWorkflow.runAsStep({
      input: orderChangeActionInput,
    })

    return new WorkflowResponse(previewOrderChangeStep(input.order_id))
  }
)
