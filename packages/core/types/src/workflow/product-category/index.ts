import { LinkWorkflowInput } from "../../common"
import {
  CreateProductCategoryDTO,
  FilterableProductCategoryProps,
  UpdateProductCategoryDTO,
} from "../../product"

/**
 * The data to create product categories.
 */
export interface CreateProductCategoriesWorkflowInput {
  /**
   * The product categories to create.
   */
  product_categories: CreateProductCategoryDTO[]
}
/**
 * The data to update product categories.
 */
export interface UpdateProductCategoriesWorkflowInput {
  /**
   * The filters to select the product categories to update.
   */
  selector: FilterableProductCategoryProps
  /**
   * The data to update in the product categories.
   */
  update: UpdateProductCategoryDTO
}

/**
 * The products to manage of a category.
 */
export interface BatchUpdateProductsOnCategoryWorkflowInput
  extends LinkWorkflowInput {}
