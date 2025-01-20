import {
  OrderChangeDTO,
  OrderClaimDTO,
  OrderDTO,
  OrderPreviewDTO,
  OrderWorkflow,
  ReturnDTO,
} from "@medusajs/framework/types"
import { ChangeActionType, OrderChangeStatus } from "@medusajs/framework/utils"
import {
  WorkflowData,
  WorkflowResponse,
  createStep,
  createWorkflow,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../../common"
import { updateOrderClaimsStep } from "../../steps/claim/update-order-claims"
import { previewOrderChangeStep } from "../../steps/preview-order-change"
import { createReturnsStep } from "../../steps/return/create-returns"
import { updateOrderChangesStep } from "../../steps/update-order-changes"
import {
  throwIfIsCancelled,
  throwIfItemsDoesNotExistsInOrder,
  throwIfOrderChangeIsNotActive,
} from "../../utils/order-validation"
import { createOrderChangeActionsWorkflow } from "../create-order-change-actions"

/**
 * The data to validate that items can be requested to return as part of a claim.
 */
export type OrderClaimRequestItemReturnValidationStepInput = {
  /**
   * The order's details.
   */
  order: OrderDTO
  /**
   * The order return's details.
   */
  orderReturn: ReturnDTO
  /**
   * The order claim's details.
   */
  orderClaim: OrderClaimDTO
  /**
   * The order change's details.
   */
  orderChange: OrderChangeDTO
  /**
   * The items requested to return.
   */
  items: OrderWorkflow.OrderClaimRequestItemReturnWorkflowInput["items"]
}

/**
 * This step validates that items can be requested to return as part of a claim.
 * If the order, claim, or return is canceled, or the order change is not active, the step will throw an error.
 * 
 * :::note
 * 
 * You can retrieve an order, order claim, order return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = orderClaimRequestItemReturnValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderClaim: {
 *     id: "claim_123",
 *     // other order claim details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   },
 *   items: [
 *     {
 *       id: "orli_123",
 *       quantity: 1
 *     }
 *   ]
 * })
 */
export const orderClaimRequestItemReturnValidationStep = createStep(
  "claim-request-item-return-validation",
  async function ({
    order,
    orderChange,
    orderReturn,
    orderClaim,
    items,
  }: OrderClaimRequestItemReturnValidationStepInput) {
    throwIfIsCancelled(order, "Order")
    throwIfIsCancelled(orderClaim, "Claim")
    throwIfIsCancelled(orderReturn, "Return")
    throwIfOrderChangeIsNotActive({ orderChange })
    throwIfItemsDoesNotExistsInOrder({ order, inputItems: items })
  }
)

export const orderClaimRequestItemReturnWorkflowId = "claim-request-item-return"
/**
 * This workflow requests one or more items to be returned as part of a claim. The
 * items are added to the claim as inbound items. The workflow is used by the
 * [Add Inbound Items to Claim Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidinbounditems).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to request items to be returned
 * as part of a claim in your custom flows.
 * 
 * @example
 * const { result } = await orderClaimRequestItemReturnWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     return_id: "return_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Request one or more items to be returned as part of a claim.
 */
export const orderClaimRequestItemReturnWorkflow = createWorkflow(
  orderClaimRequestItemReturnWorkflowId,
  function (
    input: WorkflowData<OrderWorkflow.OrderClaimRequestItemReturnWorkflowInput>
  ): WorkflowResponse<OrderPreviewDTO> {
    const orderClaim = useRemoteQueryStep({
      entry_point: "order_claim",
      fields: ["id", "order_id", "return_id", "canceled_at"],
      variables: { id: input.claim_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "claim-query" })

    const existingOrderReturn = when({ orderClaim }, ({ orderClaim }) => {
      return orderClaim.return_id
    }).then(() => {
      return useRemoteQueryStep({
        entry_point: "return",
        fields: ["id", "status", "order_id", "canceled_at"],
        variables: { id: orderClaim.return_id },
        list: false,
        throw_if_key_not_found: true,
      }).config({ name: "return-query" }) as ReturnDTO
    })

    const createdReturn = when({ orderClaim }, ({ orderClaim }) => {
      return !orderClaim.return_id
    }).then(() => {
      return createReturnsStep([
        {
          order_id: orderClaim.order_id,
          claim_id: orderClaim.id,
        },
      ])
    })

    const orderReturn: ReturnDTO = transform(
      { createdReturn, existingOrderReturn },
      ({ createdReturn, existingOrderReturn }) => {
        return existingOrderReturn ?? (createdReturn?.[0] as ReturnDTO)
      }
    )

    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: ["id", "status", "items.*"],
      variables: { id: orderClaim.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status", "canceled_at", "confirmed_at", "declined_at"],
      variables: {
        filters: {
          order_id: orderClaim.order_id,
          claim_id: orderClaim.id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({
      name: "order-change-query",
    })

    when({ createdReturn }, ({ createdReturn }) => {
      return !!createdReturn?.length
    }).then(() => {
      updateOrderChangesStep([
        {
          id: orderChange.id,
          return_id: createdReturn?.[0]?.id,
        },
      ])
    })

    orderClaimRequestItemReturnValidationStep({
      order,
      items: input.items,
      orderClaim,
      orderReturn,
      orderChange,
    })

    when({ orderClaim }, ({ orderClaim }) => {
      return !orderClaim.return_id
    }).then(() => {
      const createdReturnId = transform(
        { createdReturn },
        ({ createdReturn }) => {
          return createdReturn?.[0]!.id
        }
      )
      updateOrderClaimsStep([
        {
          id: orderClaim.id,
          return_id: createdReturnId,
        },
      ])
    })

    const orderChangeActionInput = transform(
      { order, orderChange, orderClaim, orderReturn, items: input.items },
      ({ order, orderChange, orderClaim, orderReturn, items }) => {
        return items.map((item) => ({
          order_change_id: orderChange.id,
          order_id: order.id,
          claim_id: orderClaim.id,
          return_id: orderReturn.id,
          version: orderChange.version,
          action: ChangeActionType.RETURN_ITEM,
          internal_note: item.internal_note,
          reference: "return",
          reference_id: orderReturn.id,
          details: {
            reference_id: item.id,
            quantity: item.quantity,
            reason_id: item.reason_id,
            metadata: item.metadata,
          },
        }))
      }
    )

    createOrderChangeActionsWorkflow.runAsStep({
      input: orderChangeActionInput,
    })

    return new WorkflowResponse(previewOrderChangeStep(orderClaim.order_id))
  }
)
