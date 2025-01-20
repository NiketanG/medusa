import {
  BatchWorkflowInput,
  BatchWorkflowOutput,
  CreateProductWorkflowInputDTO,
  ProductTypes,
  UpdateProductWorkflowInputDTO,
} from "@medusajs/framework/types"
import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "./create-products"
import { deleteProductsWorkflow } from "./delete-products"
import { updateProductsWorkflow } from "./update-products"

/**
 * The products to manage.
 */
export type BatchProductWorkflowInput = BatchWorkflowInput<
  CreateProductWorkflowInputDTO,
  UpdateProductWorkflowInputDTO
>

export const batchProductsWorkflowId = "batch-products"
/**
 * This workflow creates, updates, or deletes products. It's used by the
 * [Manage Products Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsbatch).
 * 
 * You can use this workflow within your own customizations or custom workflows to manage products in bulk. This is
 * also useful when writing a [seed script](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts/seed-data) or a custom import script.
 * 
 * @example
 * const { result } = await batchProductsWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         title: "Shirt",
 *         options: [
 *           {
 *             title: "Color",
 *             values: ["Red", "Brown"]
 *           }
 *         ],
 *         variants: [
 *           {
 *             title: "Red Shirt",
 *             options: {
 *               "Color": "Red"
 *             },
 *             prices: [
 *               {
 *                 amount: 10,
 *                 currency_code: "usd"
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "prod_123",
 *         title: "Pants"
 *       }
 *     ],
 *     delete: ["prod_321"]
 *   }   
 * })
 * 
 * @summary
 * 
 * Manage products in bulk.
 */
export const batchProductsWorkflow = createWorkflow(
  batchProductsWorkflowId,
  (
    input: WorkflowData<BatchProductWorkflowInput>
  ): WorkflowResponse<BatchWorkflowOutput<ProductTypes.ProductDTO>> => {
    const res = parallelize(
      createProductsWorkflow.runAsStep({
        input: { products: input.create ?? [] },
      }),
      updateProductsWorkflow.runAsStep({
        input: { products: input.update ?? [] },
      }),
      deleteProductsWorkflow.runAsStep({
        input: { ids: input.delete ?? [] },
      })
    )

    return new WorkflowResponse(
      transform({ res, input }, (data) => {
        return {
          created: data.res[0],
          updated: data.res[1],
          deleted: data.input.delete ?? [],
        }
      })
    )
  }
)
