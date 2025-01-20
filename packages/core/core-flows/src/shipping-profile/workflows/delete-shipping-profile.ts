import { createWorkflow, WorkflowData } from "@medusajs/framework/workflows-sdk"

import { deleteShippingProfilesStep } from "../steps"
import { removeRemoteLinkStep } from "../../common"
import { Modules } from "@medusajs/framework/utils"

/**
 * The data to delete shipping profiles.
 */
export type DeleteShippingProfilesWorkflowInput = {
  /**
   * The IDs of the shipping profiles to delete.
   */
  ids: string[]
}

export const deleteShippingProfileWorkflowId =
  "delete-shipping-profile-workflow"
/**
 * This workflow deletes one or more shipping profiles. It's used by the
 * [Delete Shipping Profile Admin API Route](https://docs.medusajs.com/api/admin#shipping-profiles_deleteshippingprofilesid).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete shipping profiles within your custom flows.
 * 
 * @example
 * const { result } = await deleteShippingProfileWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sp_123"]
 *   }
 * })
 * 
 * @summary
 * 
 * Delete shipping profiles.
 */
export const deleteShippingProfileWorkflow = createWorkflow(
  deleteShippingProfileWorkflowId,
  (input: WorkflowData<DeleteShippingProfilesWorkflowInput>) => {
    deleteShippingProfilesStep(input.ids)

    removeRemoteLinkStep({
      [Modules.FULFILLMENT]: { shipping_profile_id: input.ids },
    })
  }
)
