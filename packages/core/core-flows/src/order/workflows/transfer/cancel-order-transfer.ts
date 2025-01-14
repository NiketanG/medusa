import {
  OrderChangeDTO,
  OrderDTO,
  OrderWorkflow,
} from "@medusajs/framework/types"
import {
  ChangeActionType,
  MedusaError,
  OrderChangeStatus,
} from "@medusajs/framework/utils"
import {
  WorkflowData,
  createStep,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "../../../common"
import { deleteOrderChangesStep } from "../../steps"
import {
  throwIfIsCancelled,
  throwIfOrderChangeIsNotActive,
} from "../../utils/order-validation"

/**
 * This step validates that a requested order transfer can be canceled.
 */
export const cancelTransferOrderRequestValidationStep = createStep(
  "validate-cancel-transfer-order-request",
  async function ({
    order,
    orderChange,
    input,
  }: {
    order: OrderDTO
    orderChange: OrderChangeDTO
    input: OrderWorkflow.CancelTransferOrderRequestWorkflowInput
  }) {
    throwIfIsCancelled(order, "Order")
    throwIfOrderChangeIsNotActive({ orderChange })

    if (input.actor_type === "user") {
      return
    }

    const action = orderChange.actions?.find(
      (a) => a.action === ChangeActionType.TRANSFER_CUSTOMER
    )

    if (action?.reference_id !== input.logged_in_user_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This customer is not allowed to cancel the transfer."
      )
    }
  }
)

export const cancelTransferOrderRequestWorkflowId =
  "cancel-transfer-order-request"
/**
 * This workflow cancels a requested order transfer.
 *
 * Customer that requested the transfer or a store admin are allowed to cancel the order transfer request.
 */
export const cancelOrderTransferRequestWorkflow = createWorkflow(
  cancelTransferOrderRequestWorkflowId,
  function (
    input: WorkflowData<OrderWorkflow.CancelTransferOrderRequestWorkflowInput>
  ): WorkflowData<void> {
    const orderQuery = useQueryGraphStep({
      entity: "order",
      fields: ["id", "version", "canceled_at"],
      filters: { id: input.order_id },
      options: { throwIfKeyNotFound: true },
    }).config({ name: "order-query" })

    const order = transform(
      { orderQuery },
      ({ orderQuery }) => orderQuery.data[0]
    )

    const orderChangeQuery = useQueryGraphStep({
      entity: "order_change",
      fields: ["id", "status", "version", "actions.*"],
      filters: {
        order_id: input.order_id,
        status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
      },
      options: { throwIfKeyNotFound: true },
    }).config({ name: "order-change-query" })

    const orderChange = transform(
      { orderChangeQuery },
      ({ orderChangeQuery }) => orderChangeQuery.data[0]
    )

    cancelTransferOrderRequestValidationStep({ order, orderChange, input })

    deleteOrderChangesStep({ ids: [orderChange.id] })
  }
)
