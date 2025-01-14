import { OrderDTO, OrderWorkflow } from "@medusajs/framework/types"
import {
  WorkflowData,
  WorkflowResponse,
  createStep,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { CustomerDTO, OrderPreviewDTO } from "@medusajs/types"
import { v4 as uid } from "uuid"

import { emitEventStep, useRemoteQueryStep } from "../../../common"
import { createOrderChangeStep } from "../../steps/create-order-change"
import { throwIfOrderIsCancelled } from "../../utils/order-validation"
import { createOrderChangeActionsWorkflow } from "../create-order-change-actions"
import {
  ChangeActionType,
  MedusaError,
  OrderChangeStatus,
  OrderWorkflowEvents,
} from "@medusajs/utils"
import { previewOrderChangeStep, updateOrderChangesStep } from "../../steps"

/**
 * This step validates that an order transfer can be requested.
 */
export const requestOrderTransferValidationStep = createStep(
  "request-order-transfer-validation",
  async function ({
    order,
    customer,
  }: {
    order: OrderDTO
    customer: CustomerDTO
  }) {
    throwIfOrderIsCancelled({ order })

    if (!customer.has_account) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot transfer order: ${order.id} to a guest customer account: ${customer.email}`
      )
    }

    if (order.customer_id === customer.id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Order: ${order.id} already belongs to customer: ${customer.id}`
      )
    }
  }
)

export const requestOrderTransferWorkflowId = "request-order-transfer-workflow"
/**
 * This workflow requests an order transfer.
 *
 * Can be initiated by a store admin or the customer.
 * If customer requested the transfer `input.logged_in_user === input.customer_id`.
 */
export const requestOrderTransferWorkflow = createWorkflow(
  requestOrderTransferWorkflowId,
  function (
    input: WorkflowData<OrderWorkflow.RequestOrderTransferWorkflowInput>
  ): WorkflowResponse<OrderPreviewDTO> {
    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: ["id", "email", "status", "customer_id"],
      variables: { id: input.order_id },
      list: false,
      throw_if_key_not_found: true,
    })

    const customer: CustomerDTO = useRemoteQueryStep({
      entry_point: "customers",
      fields: ["id", "email", "has_account"],
      variables: { id: input.customer_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "customer-query" })

    requestOrderTransferValidationStep({ order, customer })

    const orderChangeInput = transform({ input }, ({ input }) => {
      return {
        change_type: "transfer" as const,
        order_id: input.order_id,
        created_by: input.logged_in_user,
        description: input.description,
        internal_note: input.internal_note,
      }
    })

    const change = createOrderChangeStep(orderChangeInput)

    const actionInput = transform(
      { order, input, change },
      ({ order, input, change }) => [
        {
          order_change_id: change.id,
          order_id: input.order_id,
          action: ChangeActionType.TRANSFER_CUSTOMER,
          version: change.version,
          reference: "customer",
          reference_id: input.customer_id,
          details: {
            token: uid(),
            original_email: order.email,
          },
        },
      ]
    )

    createOrderChangeActionsWorkflow.runAsStep({
      input: actionInput,
    })

    const updateOrderChangeInput = transform(
      { input, change },
      ({ input, change }) => [
        {
          id: change.id,
          status: OrderChangeStatus.REQUESTED,
          requested_by: input.logged_in_user,
          requested_at: new Date(),
        },
      ]
    )

    updateOrderChangesStep(updateOrderChangeInput)

    emitEventStep({
      eventName: OrderWorkflowEvents.TRANSFER_REQUESTED,
      data: { id: input.order_id, order_change_id: change.id },
    })

    return new WorkflowResponse(previewOrderChangeStep(input.order_id))
  }
)
