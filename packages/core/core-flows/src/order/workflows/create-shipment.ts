import {
  AdditionalData,
  FulfillmentDTO,
  OrderDTO,
  OrderWorkflow,
} from "@medusajs/framework/types"
import { FulfillmentEvents, Modules } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createStep,
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep, useRemoteQueryStep } from "../../common"
import { createShipmentWorkflow } from "../../fulfillment"
import { registerOrderShipmentStep } from "../steps"
import {
  throwIfItemsDoesNotExistsInOrder,
  throwIfOrderIsCancelled,
} from "../utils/order-validation"

/**
 * This step validates that a shipment can be created for an order.
 */
export const createShipmentValidateOrder = createStep(
  "create-shipment-validate-order",
  ({
    order,
    input,
  }: {
    order: OrderDTO
    input: OrderWorkflow.CreateOrderShipmentWorkflowInput
  }) => {
    const inputItems = input.items

    throwIfOrderIsCancelled({ order })
    throwIfItemsDoesNotExistsInOrder({ order, inputItems })

    const order_ = order as OrderDTO & { fulfillments: FulfillmentDTO[] }
    const fulfillment = order_.fulfillments.find(
      (f) => f.id === input.fulfillment_id
    )
    if (!fulfillment) {
      throw new Error(
        `Fulfillment with id ${input.fulfillment_id} not found in the order`
      )
    }
  }
)

function prepareRegisterShipmentData({
  order,
  input,
}: {
  order: OrderDTO
  input: OrderWorkflow.CreateOrderShipmentWorkflowInput
}) {
  const fulfillId = input.fulfillment_id
  const order_ = order as OrderDTO & { fulfillments: FulfillmentDTO[] }
  const fulfillment = order_.fulfillments.find((f) => f.id === fulfillId)!

  return {
    order_id: order.id,
    reference: Modules.FULFILLMENT,
    reference_id: fulfillment.id,
    created_by: input.created_by,
    items: (input.items ?? order.items)!.map((i) => {
      return {
        id: i.id,
        quantity: i.quantity,
      }
    }),
  }
}

/**
 * The data to create a shipment for an order, along with custom data that's passed to the workflow's hooks.
 */
export type CreateOrderShipmentWorkflowInput = OrderWorkflow.CreateOrderShipmentWorkflowInput & AdditionalData

export const createOrderShipmentWorkflowId = "create-order-shipment"
/**
 * This workflow creates a shipment for an order. It's used by the [Create Order Shipment Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidfulfillmentsfulfillment_idshipments).
 * 
 * This workflow has a hook that allows you to perform custom actions on the created shipment. For example, you can pass under `additional_data` custom data that 
 * allows you to create custom data models linked to the shipment.
 * 
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around creating a shipment.
 * 
 * @example
 * const { result } = await createOrderShipmentWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     fulfillment_id: "fulfillment_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1
 *       }
 *     ],
 *     additional_data: {
 *       oms_id: "123"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Creates a shipment for an order.
 * 
 * @property hooks.shipmentCreated - This hook is executed after the shipment is created. You can consume this hook to perform custom actions on the created shipment.
 */
export const createOrderShipmentWorkflow = createWorkflow(
  createOrderShipmentWorkflowId,
  (
    input: CreateOrderShipmentWorkflowInput
  ) => {
    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: [
        "id",
        "status",
        "region_id",
        "currency_code",
        "items.*",
        "fulfillments.*",
      ],
      variables: { id: input.order_id },
      list: false,
      throw_if_key_not_found: true,
    })

    createShipmentValidateOrder({ order, input })

    const fulfillmentData = transform({ input }, ({ input }) => {
      return {
        id: input.fulfillment_id,
        labels: input.labels ?? [],
      }
    })

    const shipmentData = transform(
      { order, input },
      prepareRegisterShipmentData
    )

    const [shipment] = parallelize(
      createShipmentWorkflow.runAsStep({
        input: fulfillmentData,
      }),
      registerOrderShipmentStep(shipmentData)
    )

    emitEventStep({
      eventName: FulfillmentEvents.SHIPMENT_CREATED,
      data: { id: shipment.id },
    })

    const shipmentCreated = createHook("shipmentCreated", {
      shipment,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(void 0, {
      hooks: [shipmentCreated],
    })
  }
)
