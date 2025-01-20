import {
  deleteLineItemsWorkflow,
  updateLineItemInCartWorkflow,
} from "@medusajs/core-flows"
import { prepareListQuery } from "@medusajs/framework"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HttpTypes } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { refetchCart } from "../../../helpers"
import { StoreUpdateCartLineItemType } from "../../../validators"

export const POST = async (
  req: MedusaRequest<StoreUpdateCartLineItemType>,
  res: MedusaResponse<HttpTypes.StoreCartResponse>
) => {
  // TODO: Move this to the workflow when the query to line item is fixed
  const cart = await refetchCart(
    req.params.id,
    req.scope,
    prepareListQuery(
      {},
      {
        defaults: [
          "id",
          "region_id",
          "customer_id",
          "sales_channel_id",
          "currency_code",
          "*items",
        ],
      }
    ).remoteQueryConfig.fields
  )

  const item = cart.items?.find((i) => i.id === req.params.line_id)
  if (!item) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Line item with id: ${req.params.line_id} was not found`
    )
  }

  await updateLineItemInCartWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      item_id: item.id,
      update: req.validatedBody,
    },
  })

  const updatedCart = await refetchCart(
    req.params.id,
    req.scope,
    req.queryConfig.fields
  )

  res.status(200).json({ cart: updatedCart })
}

export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse<HttpTypes.StoreLineItemDeleteResponse>
) => {
  const id = req.params.line_id

  await deleteLineItemsWorkflow(req.scope).run({
    input: { cart_id: req.params.id, ids: [id] },
  })

  const cart = await refetchCart(
    req.params.id,
    req.scope,
    req.queryConfig.fields
  )

  res.status(200).json({
    id: id,
    object: "line-item",
    deleted: true,
    parent: cart,
  })
}
