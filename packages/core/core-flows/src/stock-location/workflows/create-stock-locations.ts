import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"

import { CreateStockLocationInput } from "@medusajs/framework/types"
import { createStockLocations } from "../steps"

/**
 * The data to create the stock locations.
 */
export interface CreateStockLocationsWorkflowInput {
  /**
   * The stock locations to create.
   */
  locations: CreateStockLocationInput[]
}

export const createStockLocationsWorkflowId = "create-stock-locations-workflow"
/**
 * This workflow creates one or more stock locations. It's used by the
 * [Create Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocations).
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create stock locations in your custom flows.
 * 
 * @example
 * const { result } = await createStockLocationsWorkflow(container)
 * .run({
 *   input: {
 *     locations: [
 *       {
 *         name: "European Warehouse",
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Create one or more stock locations.
 */
export const createStockLocationsWorkflow = createWorkflow(
  createStockLocationsWorkflowId,
  (input: WorkflowData<CreateStockLocationsWorkflowInput>) => {
    return new WorkflowResponse(createStockLocations(input.locations))
  }
)
