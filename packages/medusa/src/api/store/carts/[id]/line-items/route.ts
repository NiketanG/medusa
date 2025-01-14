import { addToCartWorkflow } from "@medusajs/core-flows"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HttpTypes } from "@medusajs/framework/types"
import { refetchCart } from "../../helpers"
import { StoreAddCartLineItemType } from "../../validators"

export const POST = async (
  req: MedusaRequest<StoreAddCartLineItemType>,
  res: MedusaResponse<HttpTypes.StoreCartResponse>
) => {
  await addToCartWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      items: [req.validatedBody],
    },
  })

  const cart = await refetchCart(
    req.params.id,
    req.scope,
    req.queryConfig.fields
  )

  res.status(200).json({ cart })
}
