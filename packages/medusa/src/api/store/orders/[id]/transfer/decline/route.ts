import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { HttpTypes } from "@medusajs/framework/types"
import {
  declineOrderTransferRequestWorkflow,
  getOrderDetailWorkflow,
} from "@medusajs/core-flows"

import { StoreDeclineOrderTransferRequestType } from "../../../validators"

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreDeclineOrderTransferRequestType>,
  res: MedusaResponse<HttpTypes.StoreOrderResponse>
) => {
  await declineOrderTransferRequestWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      token: req.validatedBody.token,
    },
  })

  const { result } = await getOrderDetailWorkflow(req.scope).run({
    input: {
      fields: req.queryConfig.fields,
      order_id: req.params.id,
    },
  })

  res.status(200).json({ order: result as HttpTypes.StoreOrder })
}
