import {
  BigNumberInput,
  OrderChangeDTO,
  OrderClaimDTO,
  OrderDTO,
  OrderPreviewDTO,
} from "@medusajs/framework/types"
import { ChangeActionType, OrderChangeStatus } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createStep,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useRemoteQueryStep } from "../../../common"
import { previewOrderChangeStep } from "../../steps"
import { createOrderShippingMethods } from "../../steps/create-order-shipping-methods"
import {
  throwIfIsCancelled,
  throwIfOrderChangeIsNotActive,
} from "../../utils/order-validation"
import { prepareShippingMethod } from "../../utils/prepare-shipping-method"
import { createOrderChangeActionsWorkflow } from "../create-order-change-actions"
import { updateOrderTaxLinesWorkflow } from "../update-tax-lines"

/**
 * The data to validate that a shipping method can be created for a claim.
 */
export type CreateClaimShippingMethodValidationStepInput = {
  /**
   * The order's details.
   */
  order: OrderDTO
  /**
   * The order claim's details.
   */
  orderClaim: OrderClaimDTO
  /**
   * The order change's details.
   */
  orderChange: OrderChangeDTO
}

/**
 * This step confirms that a shipping method can be created for a claim.
 * If the order or claim is canceled, or the order change is not active, the step will throw an error.
 * 
 * :::note
 * 
 * You can retrieve an order, order claim, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 * 
 * :::
 * 
 * @example
 * const data = createClaimShippingMethodValidationStep({
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
 * })
 */
export const createClaimShippingMethodValidationStep = createStep(
  "validate-create-claim-shipping-method",
  async function ({
    order,
    orderChange,
    orderClaim,
  }: CreateClaimShippingMethodValidationStepInput) {
    throwIfIsCancelled(order, "Order")
    throwIfIsCancelled(orderClaim, "Claim")
    throwIfOrderChangeIsNotActive({ orderChange })
  }
)

/**
 * The data to create a shipping method for a claim.
 */
export type CreateClaimShippingMethodWorkflowInput = {
  /**
   * The ID of the return associated with the claim.
   * If this is set, the shipping method will be created as an inbound (return) shipping method.
   * If not set, the shipping method will be created as an outbound (delivering new items) shipping method.
   */
  return_id?: string
  /**
   * The ID of the claim to create the shipping method for.
   */
  claim_id?: string
  /**
   * The ID of the shipping option to create the shipping method from.
   */
  shipping_option_id: string
  /**
   * A custom amount to set for the shipping method. If not set, the shipping option's amount is used.
   */
  custom_amount?: BigNumberInput | null
}

export const createClaimShippingMethodWorkflowId =
  "create-claim-shipping-method"
/**
 * This workflow creates an inbound (return) or outbound (delivering new items) shipping method for a claim.
 * It's used by the [Add Inbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidinboundshippingmethod),
 * and the [Add Outbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidoutboundshippingmethod).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to create a shipping method
 * for a claim in your custom flows.
 * 
 * @example
 * To create an outbound shipping method for a claim:
 * 
 * ```ts
 * const { result } = await createClaimShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     shipping_option_id: "so_123",
 *   }
 * })
 * ```
 * 
 * To create an inbound shipping method for a claim, specify the ID of the return associated with the claim:
 * 
 * ```ts
 * const { result } = await createClaimShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     return_id: "return_123",
 *     shipping_option_id: "so_123",
 *   }
 * })
 * ```
 * 
 * @summary
 * 
 * Create an inbound or outbound shipping method for a claim.
 */
export const createClaimShippingMethodWorkflow = createWorkflow(
  createClaimShippingMethodWorkflowId,
  function (input: CreateClaimShippingMethodWorkflowInput): WorkflowResponse<OrderPreviewDTO> {
    const orderClaim: OrderClaimDTO = useRemoteQueryStep({
      entry_point: "order_claim",
      fields: ["id", "status", "order_id", "canceled_at"],
      variables: { id: input.claim_id },
      list: false,
      throw_if_key_not_found: true,
    })

    const order: OrderDTO = useRemoteQueryStep({
      entry_point: "orders",
      fields: ["id", "status", "region_id", "currency_code", "canceled_at"],
      variables: { id: orderClaim.order_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "order-query" })

    const shippingOptions = useRemoteQueryStep({
      entry_point: "shipping_option",
      fields: [
        "id",
        "name",
        "calculated_price.calculated_amount",
        "calculated_price.is_calculated_price_tax_inclusive",
      ],
      variables: {
        id: input.shipping_option_id,
        calculated_price: {
          context: { currency_code: order.currency_code },
        },
      },
    }).config({ name: "fetch-shipping-option" })

    const orderChange: OrderChangeDTO = useRemoteQueryStep({
      entry_point: "order_change",
      fields: ["id", "status", "version"],
      variables: {
        filters: {
          order_id: orderClaim.order_id,
          claim_id: orderClaim.id,
          status: [OrderChangeStatus.PENDING, OrderChangeStatus.REQUESTED],
        },
      },
      list: false,
    }).config({ name: "order-change-query" })

    createClaimShippingMethodValidationStep({ order, orderClaim, orderChange })

    const shippingMethodInput = transform(
      {
        relatedEntity: orderClaim,
        shippingOptions,
        customPrice: input.custom_amount,
        orderChange,
        input,
      },
      prepareShippingMethod("claim_id")
    )

    const createdMethods = createOrderShippingMethods({
      shipping_methods: [shippingMethodInput],
    })

    const shippingMethodIds = transform(createdMethods, (createdMethods) => {
      return createdMethods.map((item) => item.id)
    })

    const isReturn = transform(input, (data) => {
      return !!data.return_id
    })

    updateOrderTaxLinesWorkflow.runAsStep({
      input: {
        order_id: order.id,
        shipping_method_ids: shippingMethodIds,
        is_return: isReturn,
      },
    })

    const orderChangeActionInput = transform(
      {
        order,
        orderClaim,
        shippingOptions,
        createdMethods,
        customPrice: input.custom_amount,
        orderChange,
        input,
      },
      ({
        shippingOptions,
        orderClaim,
        order,
        createdMethods,
        customPrice,
        orderChange,
        input,
      }) => {
        const shippingOption = shippingOptions[0]
        const createdMethod = createdMethods[0]

        const methodPrice =
          customPrice ?? shippingOption.calculated_price.calculated_amount

        return {
          action: ChangeActionType.SHIPPING_ADD,
          reference: "order_shipping_method",
          order_change_id: orderChange.id,
          reference_id: createdMethod.id,
          amount: methodPrice,
          order_id: order.id,
          return_id: input.return_id,
          claim_id: orderClaim.id,
        }
      }
    )

    createOrderChangeActionsWorkflow.runAsStep({
      input: [orderChangeActionInput],
    })

    return new WorkflowResponse(previewOrderChangeStep(order.id))
  }
)
