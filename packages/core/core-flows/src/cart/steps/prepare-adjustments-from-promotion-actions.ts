import {
  AddItemAdjustmentAction,
  AddShippingMethodAdjustment,
  ComputeActions,
  IPromotionModuleService,
  PromotionDTO,
  RemoveItemAdjustmentAction,
  RemoveShippingMethodAdjustment,
} from "@medusajs/framework/types"
import { ComputedActions, Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The details of the actions computed by the Promotion Module.
 */
export interface PrepareAdjustmentsFromPromotionActionsStepInput {
  /**
   * The actions computed by the Promotion Module.
   */
  actions: ComputeActions[]
}

/**
 * The details of the adjustments to create and remove.
 */
export interface PrepareAdjustmentsFromPromotionActionsStepOutput {
  /**
   * The line item adjustments to create.
   */
  lineItemAdjustmentsToCreate: {
    /**
     * The promotion code that computed the adjustment.
     */
    code: string
    /**
     * The amount of the adjustment.
     */
    amount: number
    /**
     * The ID of the line item to adjust.
     */
    item_id: string
    /**
     * The ID of the applied promotion.
     */
    promotion_id?: string
  }[]
  /**
   * The line item adjustment IDs to remove.
   */
  lineItemAdjustmentIdsToRemove: string[]
  /**
   * The shipping method adjustments to create.
   */
  shippingMethodAdjustmentsToCreate: {
    /**
     * The promotion code that computed the adjustment.
     */
    code: string
    /**
     * The amount of the adjustment.
     */
    amount: number
    /**
     * The ID of the shipping method to adjust.
     */
    shipping_method_id: string
    /**
     * The ID of the applied promotion.
     */
    promotion_id?: string
  }[]
  /**
   * The shipping method adjustment IDs to remove.
   */
  shippingMethodAdjustmentIdsToRemove: string[]
  /**
   * The promotion codes that were computed.
   */
  computedPromotionCodes: string[]
}

export const prepareAdjustmentsFromPromotionActionsStepId =
  "prepare-adjustments-from-promotion-actions"
/**
 * This step prepares the line item or shipping method adjustments using
 * actions computed by the Promotion Module.
 * 
 * @example
 * const data = prepareAdjustmentsFromPromotionActionsStep({
 *   "actions": [{
 *     "action": "addItemAdjustment",
 *     "item_id": "litem_123",
 *     "amount": 10,
 *     "code": "10OFF",
 *   }]
 * })
 */
export const prepareAdjustmentsFromPromotionActionsStep = createStep(
  prepareAdjustmentsFromPromotionActionsStepId,
  async (
    data: PrepareAdjustmentsFromPromotionActionsStepInput,
    { container }
  ) => {
    const promotionModuleService: IPromotionModuleService = container.resolve(
      Modules.PROMOTION
    )

    const { actions = [] } = data
    const promotions = await promotionModuleService.listPromotions(
      { code: actions.map((a) => a.code) },
      { select: ["id", "code"] }
    )

    const promotionsMap = new Map<string, PromotionDTO>(
      promotions.map((promotion) => [promotion.code!, promotion])
    )

    const lineItemAdjustmentsToCreate = actions
      .filter((a) => a.action === ComputedActions.ADD_ITEM_ADJUSTMENT)
      .map((action) => ({
        code: action.code,
        amount: (action as AddItemAdjustmentAction).amount,
        item_id: (action as AddItemAdjustmentAction).item_id,
        promotion_id: promotionsMap.get(action.code)?.id,
      }))

    const lineItemAdjustmentIdsToRemove = actions
      .filter((a) => a.action === ComputedActions.REMOVE_ITEM_ADJUSTMENT)
      .map((a) => (a as RemoveItemAdjustmentAction).adjustment_id)

    const shippingMethodAdjustmentsToCreate = actions
      .filter(
        (a) => a.action === ComputedActions.ADD_SHIPPING_METHOD_ADJUSTMENT
      )
      .map((action) => ({
        code: action.code,
        amount: (action as AddShippingMethodAdjustment).amount,
        shipping_method_id: (action as AddShippingMethodAdjustment)
          .shipping_method_id,
        promotion_id: promotionsMap.get(action.code)?.id,
      }))

    const shippingMethodAdjustmentIdsToRemove = actions
      .filter(
        (a) => a.action === ComputedActions.REMOVE_SHIPPING_METHOD_ADJUSTMENT
      )
      .map((a) => (a as RemoveShippingMethodAdjustment).adjustment_id)

    const computedPromotionCodes = [
      ...lineItemAdjustmentsToCreate,
      ...shippingMethodAdjustmentsToCreate,
    ].map((adjustment) => adjustment.code)

    return new StepResponse({
      lineItemAdjustmentsToCreate,
      lineItemAdjustmentIdsToRemove,
      shippingMethodAdjustmentsToCreate,
      shippingMethodAdjustmentIdsToRemove,
      computedPromotionCodes,
    } as PrepareAdjustmentsFromPromotionActionsStepOutput)
  }
)
