import { AdditionalData, UpdatePromotionDTO } from "@medusajs/framework/types"
import {
  WorkflowResponse,
  createHook,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { updatePromotionsStep } from "../steps"

/**
 * The data to update one or more promotions, along with custom data that's passed to the workflow's hooks.
 */
export type UpdatePromotionsWorkflowInput = {
  /**
   * The promotions to update.
   */
  promotionsData: UpdatePromotionDTO[]
} & AdditionalData

export const updatePromotionsWorkflowId = "update-promotions"
/**
 * This workflow updates one or more promotions. It's used by the [Update Promotion Admin API Route](https://docs.medusajs.com/api/admin#promotions_postpromotionsid).
 * 
 * This workflow has a hook that allows you to perform custom actions on the updated promotion. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the promotions.
 * 
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around updating promotions.
 * 
 * @example
 * const { result } = await updatePromotionsWorkflow(container)
 * .run({
 *   input: {
 *     promotionsData: [
 *       {
 *         id: "promo_123",
 *         code: "10OFF",
 *       }
 *     ],
 *     additional_data: {
 *       external_id: "123"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update one or more promotions.
 * 
 * @property hooks.promotionsUpdated - This hook is executed after the promotions are updated. You can consume this hook to perform custom actions on the updated promotions.
 */
export const updatePromotionsWorkflow = createWorkflow(
  updatePromotionsWorkflowId,
  (input: UpdatePromotionsWorkflowInput) => {
    const updatedPromotions = updatePromotionsStep(input.promotionsData)
    const promotionsUpdated = createHook("promotionsUpdated", {
      promotions: updatedPromotions,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(updatedPromotions, {
      hooks: [promotionsUpdated],
    })
  }
)
