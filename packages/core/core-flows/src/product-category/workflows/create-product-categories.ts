import { ProductCategoryDTO, ProductCategoryWorkflow } from "@medusajs/framework/types"
import { ProductCategoryWorkflowEvents } from "@medusajs/framework/utils"
import {
  WorkflowData,
  WorkflowResponse,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "../../common"
import { createProductCategoriesStep } from "../steps"

/**
 * The created product categories.
 */
export type CreateProductCategoriesWorkflowOutput = ProductCategoryDTO[]

export const createProductCategoriesWorkflowId = "create-product-categories"
/**
 * This workflow creates one or more product categories. It's used by the
 * [Create Product Category Admin API Route](https://docs.medusajs.com/api/admin#product-categories_postproductcategories).
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create product categories within your custom flows.
 * 
 * @example
 * const { result } = await createProductCategoriesWorkflow(container)
 * .run({
 *   input: {
 *     product_categories: [
 *       {
 *         name: "Shoes",
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * Create product categories.
 */
export const createProductCategoriesWorkflow = createWorkflow(
  createProductCategoriesWorkflowId,
  (
    input: WorkflowData<ProductCategoryWorkflow.CreateProductCategoriesWorkflowInput>
  ): WorkflowResponse<CreateProductCategoriesWorkflowOutput> => {
    const createdProducts = createProductCategoriesStep(input)

    const productCategoryIdEvents = transform(
      { createdProducts },
      ({ createdProducts }) => {
        return createdProducts.map((v) => {
          return { id: v.id }
        })
      }
    )

    emitEventStep({
      eventName: ProductCategoryWorkflowEvents.CREATED,
      data: productCategoryIdEvents,
    })

    return new WorkflowResponse(createdProducts)
  }
)
