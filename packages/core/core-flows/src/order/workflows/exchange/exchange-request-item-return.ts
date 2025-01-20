import {
  OrderChangeDTO,
  OrderDTO,
  OrderExchangeDTO,
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
import { updateOrderExchangesStep } from "../../steps/exchange/update-order-exchanges"
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
 * The data to validate that items can be returned as part of an exchange.
 */
export type ExchangeRequestItemReturnValidationStepInput = {
  /**
   * The order's details.
   */
  order: OrderDTO
  /**
   * The order exchange's details.
   */
  orderExchange: OrderExchangeDTO
  /**
   * The order change's details.
   */
  orderChange: OrderChangeDTO
  /**
   * The order return's details.
   */
  orderReturn: ReturnDTO
  /**
   * The items to be returned.
   */
  items: OrderWorkflow.OrderExchangeRequestItemReturnWorkflowInput["items"]
}

/**
 * This step validates that items can be returned as part of an exchange.
 * If the order, exchange, or return is canceled, the order change is not active, 
 * or the item doesn't exist in the order, the step will throw an error.
 * 
 * :::note
 * 
 * You can retrieve an order, order exchange, and order return details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = exchangeRequestItemReturnValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderExchange: {
 *     id: "exchange_123",
 *     // other order exchange details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   },
 *   items: [
 *     {
 *       id: "orli_123",
 *       quantity: 1,
 *     }
 *   ]
 * })
 */
export const exchangeRequestItemReturnValidationStep = createStep(
  "exchange-request-item-return-validation",
  async function ({
    order,
    orderChange,
    orderReturn,
    orderExchange,
    items,
  }: ExchangeRequestItemReturnValidationStepInput) {
    throwIfIsCancelled(order, "Order")
    throwIfIsCancelled(orderExchange, "Exchange")
    throwIfIsCancelled(orderReturn, "Return")
    throwIfOrderChangeIsNotActive({ orderChange })
    throwIfItemsDoesNotExistsInOrder({ order, inputItems: items })
  }
)

export const orderExchangeRequestItemReturnWorkflowId =
  "exchange-request-item-return"
/**
 * This workflow adds inbound items to be retuned as part of the exchange. It's used
 * by the [Add Inbound Items Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidinbounditems).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to add inbound items
 * to be returned as part of an exchange in your custom flow.
 * 
 * @example
 * const { result } = await orderExchangeRequestItemReturnWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *     return_id: "return_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Add inbound items to be returned as part of the exchange.
 */
export const orderExchangeRequestItemReturnWorkflow = createWorkflow(
  orderExchangeRequestItemReturnWorkflowId,
  function (
    input: WorkflowData<OrderWorkflow.OrderExchangeRequestItemReturnWorkflowInput>
  ): WorkflowResponse<OrderPreviewDTO> {
    const orderExchange = useRemoteQueryStep({
      entry_point: "order_exchange",
      fields: ["id", "order_id", "return_id", "canceled_at"],
      variables: { id: input.exchange_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "exchange-query" })

    const existingOrderReturn = when({ orderExchange }, ({ orderExchange }) => {
      return orderExchange.return_id
    }).then(() => {
      return useRemoteQueryStep({
        entry_point: "return",
        fields: ["id", "status", "order_id", "canceled_at"],
        variables: { id: orderExchange.return_id },
        list: false,
        throw_if_key_not_found: true,
      }).config({ name: "return-query" }) as ReturnDTO
    })

    const createdReturn = when({ orderExchange }, ({ orderExchange }) => {
      return !orderExchange.return_id
    }).then(() => {
      return createReturnsStep([
        {
          order_id: orderExchange.order_id,
          exchange_id: orderExchange.id,
        },
      ])
    })

    const orderReturn: ReturnDTO = transform(
      { createdReturn, existingOrderReturn, orderExchange },
      ({ createdReturn, existingOrderReturn, orderExchange }) => {
        return existingOrderReturn ?? (createdReturn?.[0] as ReturnDTO)
      }
    )

    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: ["id", "status", "items.*"],
      variables: { id: orderExchange.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status"],
      variables: {
        filters: {
          order_id: orderExchange.order_id,
          exchange_id: orderExchange.id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({
      name: "order-change-query",
      status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
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

    exchangeRequestItemReturnValidationStep({
      order,
      items: input.items,
      orderExchange,
      orderReturn,
      orderChange,
    })

    when({ orderExchange }, ({ orderExchange }) => {
      return !orderExchange.return_id
    }).then(() => {
      const createdReturnId = transform(
        { createdReturn },
        ({ createdReturn }) => {
          return createdReturn?.[0]!.id
        }
      )
      updateOrderExchangesStep([
        {
          id: orderExchange.id,
          return_id: createdReturnId,
        },
      ])
    })

    const orderChangeActionInput = transform(
      { order, orderChange, orderExchange, orderReturn, items: input.items },
      ({ order, orderChange, orderExchange, orderReturn, items }) => {
        return items.map((item) => ({
          order_change_id: orderChange.id,
          order_id: order.id,
          exchange_id: orderExchange.id,
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

    return new WorkflowResponse(previewOrderChangeStep(orderExchange.order_id))
  }
)
