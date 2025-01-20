import {
  FilterableStockLocationProps,
  IStockLocationService,
  UpdateStockLocationInput,
} from "@medusajs/framework/types"
import { getSelectsAndRelationsFromObjectArray } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

import { Modules } from "@medusajs/framework/utils"

/**
 * The data to update stock locations.
 */
interface StepInput {
  /**
   * The filters to select stock locations to update.
   */
  selector: FilterableStockLocationProps
  /**
   * The data to update stock locations with.
   */
  update: UpdateStockLocationInput
}

export const updateStockLocationsStepId = "update-stock-locations-step"
/**
 * This step updates stock locations matching the specified filters.
 * 
 * @example
 * const data = updateStockLocationsStep({
 *   selector: {
 *     id: "sloc_123"
 *   },
 *   update: {
 *     name: "European Warehouse"
 *   }
 * })
 */
export const updateStockLocationsStep = createStep(
  updateStockLocationsStepId,
  async (input: StepInput, { container }) => {
    const stockLocationService = container.resolve<IStockLocationService>(
      Modules.STOCK_LOCATION
    )
    const { selects, relations } = getSelectsAndRelationsFromObjectArray([
      input.update,
    ])

    const dataBeforeUpdate = await stockLocationService.listStockLocations(
      input.selector,
      {
        select: selects,
        relations,
      }
    )

    const updatedStockLocations =
      await stockLocationService.updateStockLocations(
        input.selector,
        input.update
      )

    return new StepResponse(updatedStockLocations, dataBeforeUpdate)
  },
  async (revertInput, { container }) => {
    if (!revertInput?.length) {
      return
    }

    const stockLocationService = container.resolve<IStockLocationService>(
      Modules.STOCK_LOCATION
    )

    await stockLocationService.upsertStockLocations(
      revertInput.map((item) => ({
        id: item.id,
        name: item.name,
        ...(item.metadata ? { metadata: item.metadata } : {}),
        ...(item.address ? { address: item.address } : {}),
      }))
    )
  }
)
