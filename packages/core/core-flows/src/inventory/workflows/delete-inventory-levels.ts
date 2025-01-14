import {
  createStep,
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  FilterableInventoryLevelProps,
  InventoryLevelDTO,
} from "@medusajs/framework/types"
import { deduplicate, MedusaError, Modules } from "@medusajs/framework/utils"
import { useRemoteQueryStep } from "../../common"
import { deleteEntitiesStep } from "../../common/steps/delete-entities"

/**
 * This step validates that inventory levels are deletable.
 */
export const validateInventoryLevelsDelete = createStep(
  "validate-inventory-levels-delete",
  async function ({
    inventoryLevels,
    force,
  }: {
    inventoryLevels: InventoryLevelDTO[]
    force?: boolean
  }) {
    const undeleteableDueToReservation = inventoryLevels.filter(
      (i) => i.reserved_quantity > 0 || i.incoming_quantity > 0
    )

    if (undeleteableDueToReservation.length) {
      const locationIds = deduplicate(
        undeleteableDueToReservation.map((item) => item.location_id)
      )
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot remove Inventory Levels for ${locationIds.join(
          ", "
        )} because there are reserved or incoming items at the locations`
      )
    }

    const undeleteableDueToStock = inventoryLevels.filter(
      (i) => !force && i.stocked_quantity > 0
    )

    if (undeleteableDueToStock.length) {
      const locationIds = deduplicate(
        undeleteableDueToStock.map((item) => item.location_id)
      )
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot remove Inventory Levels for ${locationIds.join(
          ", "
        )} because there are stocked items at the locations. Use force flag to delete anyway.`
      )
    }
  }
)

export interface DeleteInventoryLevelsWorkflowInput
  extends FilterableInventoryLevelProps {
  force?: boolean
}

export const deleteInventoryLevelsWorkflowId =
  "delete-inventory-levels-workflow"
/**
 * This workflow deletes one or more inventory levels.
 */
export const deleteInventoryLevelsWorkflow = createWorkflow(
  deleteInventoryLevelsWorkflowId,
  (input: WorkflowData<DeleteInventoryLevelsWorkflowInput>) => {
    const { filters, force } = transform(input, (data) => {
      const { force, ...filters } = data

      return {
        filters,
        force,
      }
    })

    const inventoryLevels = useRemoteQueryStep({
      entry_point: "inventory_levels",
      fields: ["id", "stocked_quantity", "reserved_quantity", "location_id"],
      variables: {
        filters: filters,
      },
    })

    validateInventoryLevelsDelete({ inventoryLevels, force })

    const idsToDelete = transform({ inventoryLevels }, ({ inventoryLevels }) =>
      inventoryLevels.map((il) => il.id)
    )

    deleteEntitiesStep({
      moduleRegistrationName: Modules.INVENTORY,
      invokeMethod: "softDeleteInventoryLevels",
      compensateMethod: "restoreInventoryLevels",
      data: idsToDelete,
    })

    return new WorkflowResponse(void 0)
  }
)
