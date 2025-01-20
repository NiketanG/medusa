import {
  FilterableProductProps,
  RemoteQueryFunction,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

/**
 * The configuration to retrieve the products.
 */
export type GetAllProductsStepInput = {
  /**
   * The fields to select. These fields will be passed to 
   * [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query), so you can
   * pass product properties or any relation names, including custom links.
   */
  select: string[]
  /**
   * The filters to select which products to retrieve.
   */
  filter?: FilterableProductProps
}

export const getAllProductsStepId = "get-all-products"
/**
 * This step retrieves all products matching a set of filters.
 * 
 * @example
 * To retrieve all products:
 * 
 * ```ts
 * const data = getAllProductsStep({
 *   select: ["*"],
 * })
 * ```
 * 
 * To retrieve all products matching a filter:
 * 
 * ```ts
 * const data = getAllProductsStep({
 *   select: ["*"],
 *   filter: {
 *     collection_id: "collection_123"
 *   }
 * })
 */
export const getAllProductsStep = createStep(
  getAllProductsStepId,
  async (data: GetAllProductsStepInput, { container }) => {
    const remoteQuery: RemoteQueryFunction = container.resolve(
      ContainerRegistrationKeys.REMOTE_QUERY
    )

    const allProducts: any[] = []
    const pageSize = 200
    let page = 0

    // We intentionally fetch the products serially here to avoid putting too much load on the DB
    while (true) {
      const { rows: products } = await remoteQuery({
        entryPoint: "product",
        variables: {
          filters: data.filter,
          skip: page * pageSize,
          take: pageSize,
        },
        fields: data.select,
      })

      allProducts.push(...products)

      if (products.length < pageSize) {
        break
      }

      page += 1
    }

    return new StepResponse(allProducts, allProducts)
  }
)
