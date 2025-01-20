import { transferCartCustomerWorkflow } from "@medusajs/core-flows"
import { HttpTypes } from "@medusajs/framework/types"

import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { refetchCart } from "../../helpers"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.StoreCartResponse>
) => {
  const workflow = transferCartCustomerWorkflow(req.scope)

  await workflow.run({
    input: {
      id: req.params.id,
      customer_id: req.auth_context?.actor_id,
    },
  })

  const cart = await refetchCart(
    req.params.id,
    req.scope,
    req.queryConfig.fields
  )

  res.status(200).json({ cart })
}
