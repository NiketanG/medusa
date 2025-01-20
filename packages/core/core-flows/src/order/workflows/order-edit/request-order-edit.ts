import {
  OrderChangeDTO,
  OrderDTO,
  OrderPreviewDTO,
} from "@medusajs/framework/types"
import { OrderChangeStatus } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createStep,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../../common"
import { previewOrderChangeStep } from "../../steps"
import { updateOrderChangesStep } from "../../steps/update-order-changes"
import {
  throwIfIsCancelled,
  throwIfOrderChangeIsNotActive,
} from "../../utils/order-validation"
import { createOrUpdateOrderPaymentCollectionWorkflow } from "../create-or-update-order-payment-collection"

function getOrderChangesData({
  input,
  orderChange,
}: {
  input: { requested_by?: string }
  orderChange: { id: string }
}) {
  return transform({ input, orderChange }, ({ input, orderChange }) => {
    return [
      {
        id: orderChange.id,
        status: OrderChangeStatus.REQUESTED,
        requested_at: new Date(),
        requested_by: input.requested_by,
      },
    ]
  })
}

/**
 * The data to validate that an order edit can be requested.
 */
export type RequestOrderEditRequestValidationStepInput = {
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
 * This step validates that a order edit can be requested.
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
 * const data = requestOrderEditRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 * })
 */
export const requestOrderEditRequestValidationStep = createStep(
  "validate-order-edit-request",
  async function ({
    order,
    orderChange,
  }: RequestOrderEditRequestValidationStepInput) {
    throwIfIsCancelled(order, "Order")
    throwIfOrderChangeIsNotActive({ orderChange })
  }
)

/**
 * The data to request an order edit.
 */
export type OrderEditRequestWorkflowInput = {
  /**
   * The ID of the order to request the edit for.
   */
  order_id: string
  /**
   * The ID of the user requesting the edit.
   */
  requested_by?: string
}

export const requestOrderEditRequestWorkflowId = "order-edit-request"
/**
 * This workflow requests a previously created order edit request by {@link beginOrderEditOrderWorkflow}. This workflow is used by
 * the [Request Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsidrequest).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to request an order edit
 * in your custom flows.
 * 
 * @example
 * const { result } = await requestOrderEditRequestWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 * 
 * @summary
 * 
 * Request an order edit.
 */
export const requestOrderEditRequestWorkflow = createWorkflow(
  requestOrderEditRequestWorkflowId,
  function (
    input: OrderEditRequestWorkflowInput
  ): WorkflowResponse<OrderPreviewDTO> {
    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: ["id", "version", "canceled_at"],
      variables: { id: input.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "canceled_at"],
      variables: {
        filters: {
          order_id: input.order_id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    requestOrderEditRequestValidationStep({
      order,
      orderChange,
    })

    const updateOrderChangesData = getOrderChangesData({ input, orderChange })
    updateOrderChangesStep(updateOrderChangesData)

    createOrUpdateOrderPaymentCollectionWorkflow.runAsStep({
      input: {
        order_id: order.id,
      },
    })

    return new WorkflowResponse(previewOrderChangeStep(order.id))
  }
)
