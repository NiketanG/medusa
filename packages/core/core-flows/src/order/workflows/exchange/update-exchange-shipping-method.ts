import {
  OrderChangeActionDTO,
  OrderChangeDTO,
  OrderExchangeDTO,
  OrderPreviewDTO,
  OrderWorkflow,
} from "@medusajs/framework/types"
import { ChangeActionType, OrderChangeStatus } from "@medusajs/framework/utils"
import {
  WorkflowData,
  WorkflowResponse,
  createStep,
  createWorkflow,
  parallelize,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../../common"
import {
  updateOrderChangeActionsStep,
  updateOrderShippingMethodsStep,
} from "../../steps"
import { previewOrderChangeStep } from "../../steps/preview-order-change"
import {
  throwIfIsCancelled,
  throwIfOrderChangeIsNotActive,
} from "../../utils/order-validation"
import { prepareShippingMethodUpdate } from "../../utils/prepare-shipping-method"

/**
 * The data to validate that an exchange's shipping method can be updated.
 */
export type UpdateExchangeShippingMethodValidationStepInput = {
  /**
   * The order exchange's details.
   */
  orderExchange: OrderExchangeDTO
  /**
   * The order change's details.
   */
  orderChange: OrderChangeDTO
  /**
   * The details of the shipping method update.
   */
  input: Pick<OrderWorkflow.UpdateExchangeShippingMethodWorkflowInput, "exchange_id" | "action_id">
}

/**
 * This step validates that an exchange's shipping method can be updated.
 * If the exchange is canceled, the order change is not active, the shipping method
 * doesn't exist in the exchange, or the action isn't adding a shipping method,
 * the step will throw an error.
 * 
 * :::note
 * 
 * You can retrieve an order exchange and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = updateExchangeShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderExchange: {
 *     id: "exchange_123",
 *     // other order exchange details...
 *   },
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *     data: {
 *       custom_amount: 10,
 *     }
 *   }
 * })
 */
export const updateExchangeShippingMethodValidationStep = createStep(
  "validate-update-exchange-shipping-method",
  async function ({
    orderChange,
    orderExchange,
    input,
  }: UpdateExchangeShippingMethodValidationStepInput) {
    throwIfIsCancelled(orderExchange, "Exchange")
    throwIfOrderChangeIsNotActive({ orderChange })

    const associatedAction = (orderChange.actions ?? []).find(
      (a) => a.id === input.action_id
    ) as OrderChangeActionDTO

    if (!associatedAction) {
      throw new Error(
        `No shipping method found for exchange ${input.exchange_id} in order change ${orderChange.id}`
      )
    } else if (associatedAction.action !== ChangeActionType.SHIPPING_ADD) {
      throw new Error(
        `Action ${associatedAction.id} is not adding a shipping method`
      )
    }
  }
)

export const updateExchangeShippingMethodWorkflowId =
  "update-exchange-shipping-method"
/**
 * This workflow updates an exchange's inbound or outbound shipping method. It's used by the
 * [Update Inbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidinboundshippingmethodaction_id)
 * or the [Outbound Inbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidoutboundshippingmethodaction_id).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update an exchange's
 * inbound or outbound shipping method in your custom flow.
 * 
 * @example
 * const { result } = await updateExchangeShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *     data: {
 *       custom_amount: 10,
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update an exchange's inbound or outbound shipping method.
 */
export const updateExchangeShippingMethodWorkflow = createWorkflow(
  updateExchangeShippingMethodWorkflowId,
  function (
    input: WorkflowData<OrderWorkflow.UpdateExchangeShippingMethodWorkflowInput>
  ): WorkflowResponse<OrderPreviewDTO> {
    const orderExchange: OrderExchangeDTO = useRemoteQueryStep({
      entry_point: "order_exchange",
      fields: [
        "id",
        "status",
        "order_id",
        "canceled_at",
        "order.currency_code",
      ],
      variables: { id: input.exchange_id },
      list: false,
      throw_if_key_not_found: true,
    })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status", "version", "actions.*"],
      variables: {
        filters: {
          order_id: orderExchange.order_id,
          exchange_id: orderExchange.id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    const shippingOptions = when({ input }, ({ input }) => {
      return input.data?.custom_amount === null
    }).then(() => {
      const action = transform(
        { orderChange, input, orderExchange },
        ({ orderChange, input, orderExchange }) => {
          const originalAction = (orderChange.actions ?? []).find(
            (a) => a.id === input.action_id
          ) as OrderChangeActionDTO

          return {
            shipping_method_id: originalAction.reference_id,
            currency_code: (orderExchange as any).order.currency_code,
          }
        }
      )

      const shippingMethod = useRemoteQueryStep({
        entry_point: "order_shipping_method",
        fields: ["id", "shipping_option_id"],
        variables: {
          id: action.shipping_method_id,
        },
        list: false,
      }).config({ name: "fetch-shipping-method" })

      return useRemoteQueryStep({
        entry_point: "shipping_option",
        fields: [
          "id",
          "name",
          "calculated_price.calculated_amount",
          "calculated_price.is_calculated_price_tax_inclusive",
        ],
        variables: {
          id: shippingMethod.shipping_option_id,
          calculated_price: {
            context: { currency_code: action.currency_code },
          },
        },
      }).config({ name: "fetch-shipping-option" })
    })

    updateExchangeShippingMethodValidationStep({
      orderExchange,
      orderChange,
      input,
    })

    const updateData = transform(
      { orderChange, input, shippingOptions },
      prepareShippingMethodUpdate
    )

    parallelize(
      updateOrderChangeActionsStep([updateData.action]),
      updateOrderShippingMethodsStep([updateData.shippingMethod!])
    )

    return new WorkflowResponse(previewOrderChangeStep(orderExchange.order_id))
  }
)
