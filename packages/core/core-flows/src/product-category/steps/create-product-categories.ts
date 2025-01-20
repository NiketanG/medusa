import {
  CreateProductCategoryDTO,
  IProductModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The data to create product categories.
 */
export type CreateProductCategoriesStepInput = {
  /**
   * The product categories to create.
   */
  product_categories: CreateProductCategoryDTO[]
}

export const createProductCategoriesStepId = "create-product-categories"
/**
 * This step creates one or more product categories.
 * 
 * @example
 * const data = createProductCategoriesStep({
 *   product_categories: [
 *     {
 *       name: "Shoes",
 *     }
 *   ]
 * })
 */
export const createProductCategoriesStep = createStep(
  createProductCategoriesStepId,
  async (data: CreateProductCategoriesStepInput, { container }) => {
    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)

    const created = await service.createProductCategories(
      data.product_categories
    )

    return new StepResponse(
      created,
      created.map((c) => c.id)
    )
  },
  async (createdIds, { container }) => {
    if (!createdIds?.length) {
      return
    }

    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)

    await service.deleteProductCategories(createdIds)
  }
)
