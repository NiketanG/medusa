import {
  FilterableStockLocationProps,
  StockLocationDTO,
  UpdateStockLocationInput,
  UpsertStockLocationAddressInput,
} from "@medusajs/framework/types"
import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"

import { useQueryGraphStep } from "../../common"
import { updateStockLocationsStep } from "../steps"
import { upsertStockLocationAddressesStep } from "../steps/upsert-stock-location-addresses"

export interface UpdateStockLocationsWorkflowInput {
  selector: FilterableStockLocationProps
  update: UpdateStockLocationInput
}
export const updateStockLocationsWorkflowId = "update-stock-locations-workflow"
/**
 * This workflow updates stock locations matching the specified filters.
 */
export const updateStockLocationsWorkflow = createWorkflow(
  updateStockLocationsWorkflowId,
  (
    input: WorkflowData<UpdateStockLocationsWorkflowInput>
  ): WorkflowResponse<StockLocationDTO[]> => {
    const stockLocationsQuery = useQueryGraphStep({
      entity: "stock_location",
      filters: input.selector,
      fields: ["id", "address.id"],
    }).config({ name: "get-stock-location" })

    const stockLocations = transform(
      { stockLocationsQuery },
      ({ stockLocationsQuery }) => stockLocationsQuery.data
    )

    const normalizedData = transform(
      { input, stockLocations },
      ({ input, stockLocations }) => {
        const { address, address_id, ...stockLocationInput } = input.update
        const addressesInput: UpsertStockLocationAddressInput[] = []

        if (address) {
          for (const stockLocation of stockLocations) {
            if (stockLocation.address?.id) {
              addressesInput.push({
                id: stockLocation.address?.id!,
                ...address,
              })
            } else {
              addressesInput.push(address)
            }
          }
        }

        return {
          stockLocationInput: {
            selector: input.selector,
            update: stockLocationInput,
          },
          addressesInput,
        }
      }
    )

    upsertStockLocationAddressesStep(normalizedData.addressesInput)

    return new WorkflowResponse(
      updateStockLocationsStep(normalizedData.stockLocationInput)
    )
  }
)
