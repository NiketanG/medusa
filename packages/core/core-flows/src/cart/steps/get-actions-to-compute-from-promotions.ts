import { CartDTO, IPromotionModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The details of the cart and its applied promotions.
 */
export interface GetActionsToComputeFromPromotionsStepInput {
  /**
   * The cart to compute the actions for.
   */
  cart: CartDTO
  /**
   * The promotion codes applied on the cart.
   */
  promotionCodesToApply: string[]
}

export const getActionsToComputeFromPromotionsStepId =
  "get-actions-to-compute-from-promotions"
/**
 * This step retrieves the actions to compute based on the promotions
 * applied on a cart.
 * 
 * :::tip
 * 
 * You can use the {@link retrieveCartStep} to retrieve a cart's details.
 * 
 * :::
 * 
 * @example
 * const data = getActionsToComputeFromPromotionsStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart,
 *   promotionCodesToApply: ["10OFF"]
 * })
 */
export const getActionsToComputeFromPromotionsStep = createStep(
  getActionsToComputeFromPromotionsStepId,
  async (data: GetActionsToComputeFromPromotionsStepInput, { container }) => {
    const { cart, promotionCodesToApply = [] } = data
    const promotionService = container.resolve<IPromotionModuleService>(
      Modules.PROMOTION
    )

    const actionsToCompute = await promotionService.computeActions(
      promotionCodesToApply,
      cart as any
    )

    return new StepResponse(actionsToCompute)
  }
)
