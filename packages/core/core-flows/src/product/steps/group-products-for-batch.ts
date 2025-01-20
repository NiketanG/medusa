import { HttpTypes, IProductModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The products to group.
 */
export type GroupProductsForBatchStepInput = (HttpTypes.AdminCreateProduct & { 
  /**
   * The ID of the product to update.
   */
  id?: string
})[]

export type GroupProductsForBatchStepOutput = {
  /**
   * The products to create.
   */
  create: HttpTypes.AdminCreateProduct[]
  /**
   * The products to update.
   */
  update: (HttpTypes.AdminUpdateProduct & { id: string })[]
}

export const groupProductsForBatchStepId = "group-products-for-batch"
/**
 * This step groups products to be created or updated.
 * 
 * @example
 * const data = groupProductsForBatchStep([
 *   {
 *     id: "prod_123",
 *     title: "Shirt",
 *     options: [
 *       {
 *         title: "Size",
 *         values: ["S", "M", "L"]
 *       }
 *     ]
 *   },
 *   {
 *     title: "Pants",
 *     options: [
 *       {
 *         title: "Color",
 *         values: ["Red", "Blue"]
 *       }
 *     ],
 *     variants: [
 *       {
 *         title: "Red Pants",
 *         options: {
 *           Color: "Red"
 *         },
 *         prices: [
 *           {
 *             amount: 10,
 *             currency_code: "usd"
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * ])
 */
export const groupProductsForBatchStep = createStep(
  groupProductsForBatchStepId,
  async (
    data: GroupProductsForBatchStepInput,
    { container }
  ) => {
    const service = container.resolve<IProductModuleService>(Modules.PRODUCT)

    const existingProducts = await service.listProducts(
      {
        // We use the ID to do product updates
        id: data.map((product) => product.id).filter(Boolean) as string[],
      },
      { select: ["handle"] }
    )
    const existingProductsSet = new Set(existingProducts.map((p) => p.id))

    const { toUpdate, toCreate } = data.reduce(
      (
        acc: {
          toUpdate: (HttpTypes.AdminUpdateProduct & { id: string })[]
          toCreate: HttpTypes.AdminCreateProduct[]
        },
        product
      ) => {
        // There are few data normalizations to do if we are dealing with an update.
        if (product.id && existingProductsSet.has(product.id)) {
          acc.toUpdate.push(
            product as HttpTypes.AdminUpdateProduct & { id: string }
          )
          return acc
        }

        // New products and variants will be created with a new ID, even if there is one present in the CSV.
        // To add support for creating with predefined IDs we will need to do changes to the upsert method.
        delete product.id
        product.variants?.forEach((variant) => {
          delete (variant as any).id
        })

        acc.toCreate.push(product)
        return acc
      },
      { toUpdate: [], toCreate: [] }
    )

    return new StepResponse(
      { create: toCreate, update: toUpdate } as GroupProductsForBatchStepOutput,
    )
  }
)
