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
import { declineOrderChangeStep } from "../../steps"
import {
  throwIfIsCancelled,
  throwIfOrderChangeIsNotActive,
} from "../../utils/order-validation"

/**
 * This step validates that a requested order transfer can be declineed.
 */
export const declineTransferOrderRequestValidationStep = createStep(
  "validate-decline-transfer-order-request",
  async function ({
    order,
    orderChange,
    input,
  }: {
    order: OrderDTO
    orderChange: OrderChangeDTO
    input: OrderWorkflow.DeclineTransferOrderRequestWorkflowInput
  }) {
    throwIfIsCancelled(order, "Order")
    throwIfOrderChangeIsNotActive({ orderChange })

    const token = orderChange.actions?.find(
      (a) => a.action === ChangeActionType.TRANSFER_CUSTOMER
    )?.details!.token

    if (!input.token?.length || token !== input.token) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Invalid token.")
    }
  }
)

export const declineTransferOrderRequestWorkflowId =
  "decline-transfer-order-request"
/**
 * This workflow declines a requested order transfer.
 *
 * Only the original customer (who has the token) is allowed to decline the transfer.
 */
export const declineOrderTransferRequestWorkflow = createWorkflow(
  declineTransferOrderRequestWorkflowId,
  function (
    input: WorkflowData<OrderWorkflow.DeclineTransferOrderRequestWorkflowInput>
  ): WorkflowData<void> {
    const orderQuery = useQueryGraphStep({
      entity: "order",
      fields: ["id", "version", "declineed_at"],
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

    declineTransferOrderRequestValidationStep({ order, orderChange, input })

    declineOrderChangeStep({ id: orderChange.id })
  }
)
