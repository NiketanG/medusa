import { isPresent, MedusaError } from "@medusajs/framework/utils"
import { MedusaResponse } from "@medusajs/framework/http"
import { wrapVariantsWithInventoryQuantityForSalesChannel } from "../../../utils/middlewares"
import {
  refetchProduct,
  RequestWithContext,
  wrapProductsWithTaxPrices,
} from "../helpers"
import { HttpTypes } from "@medusajs/framework/types"

export const GET = async (
  req: RequestWithContext<HttpTypes.StoreProductParams>,
  res: MedusaResponse<HttpTypes.StoreProductResponse>
) => {
  const withInventoryQuantity = req.queryConfig.fields.some((field) =>
    field.includes("variants.inventory_quantity")
  )

  if (withInventoryQuantity) {
    req.queryConfig.fields = req.queryConfig.fields.filter(
      (field) => !field.includes("variants.inventory_quantity")
    )
  }

  const filters: object = {
    id: req.params.id,
    ...req.filterableFields,
  }

  if (isPresent(req.pricingContext)) {
    filters["context"] = {
      "variants.calculated_price": { context: req.pricingContext },
    }
  }

  const product = await refetchProduct(
    filters,
    req.scope,
    req.queryConfig.fields
  )

  if (!product) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product with id: ${req.params.id} was not found`
    )
  }

  if (withInventoryQuantity) {
    await wrapVariantsWithInventoryQuantityForSalesChannel(
      req,
      product.variants || []
    )
  }

  await wrapProductsWithTaxPrices(req, [product])
  res.json({ product })
}
