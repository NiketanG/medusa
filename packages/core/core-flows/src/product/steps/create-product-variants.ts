import { IProductModuleService, ProductTypes } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

export const createProductVariantsStepId = "create-product-variants"
/**
 * This step creates one or more product variants.
 * 
 * @example
 * const data = createProductVariantsStep([{
 *   title: "Small Shirt",
 *   options: {
 *     Size: "S",
 *   },
 *   product_id: "prod_123",
 * }])
 */
export const createProductVariantsStep = createStep(
  createProductVariantsStepId,
  async (data: ProductTypes.CreateProductVariantDTO[], { container }) => {
    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)
    const created = await service.createProductVariants(data)
    return new StepResponse(
      created,
      created.map((productVariant) => productVariant.id)
    )
  },
  async (createdIds, { container }) => {
    if (!createdIds?.length) {
      return
    }

    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)

    await service.deleteProductVariants(createdIds)
  }
)
