import { UpsertOrderAddressDTO } from "../../order"

export type UpdateOrderWorkflowInput = {
  id: string
  user_id: string
  shipping_address?: UpsertOrderAddressDTO
  billing_address?: UpsertOrderAddressDTO
  email?: string
}

export type UpdateOrderShippingAddressWorkflowInput = {
  order_id: string
  shipping_address: UpsertOrderAddressDTO
  description?: string
  internal_note?: string
}
