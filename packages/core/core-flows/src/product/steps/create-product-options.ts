import { IProductModuleService, ProductTypes } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

export const createProductOptionsStepId = "create-product-options"
/**
 * This step creates one or more product options.
 * 
 * @example
 * const data = createProductOptionsStep([{
 *   title: "Size",
 *   values: ["S", "M", "L"]
 * }])
 */
export const createProductOptionsStep = createStep(
  createProductOptionsStepId,
  async (data: ProductTypes.CreateProductOptionDTO[], { container }) => {
    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)

    const created = await service.createProductOptions(data)
    return new StepResponse(
      created,
      created.map((productOption) => productOption.id)
    )
  },
  async (createdIds, { container }) => {
    if (!createdIds?.length) {
      return
    }

    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)

    await service.deleteProductOptions(createdIds)
  }
)
