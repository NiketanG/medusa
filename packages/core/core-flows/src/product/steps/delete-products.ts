import { IProductModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The IDs of the products to delete.
 */
export type DeleteProductsStepInput = string[]

export const deleteProductsStepId = "delete-products"
/**
 * This step deletes one or more products.
 */
export const deleteProductsStep = createStep(
  deleteProductsStepId,
  async (ids: DeleteProductsStepInput, { container }) => {
    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)

    await service.softDeleteProducts(ids)
    return new StepResponse(void 0, ids)
  },
  async (prevIds, { container }) => {
    if (!prevIds?.length) {
      return
    }

    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)

    await service.restoreProducts(prevIds)
  }
)
