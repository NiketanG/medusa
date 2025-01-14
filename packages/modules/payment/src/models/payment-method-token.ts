import { model } from "@medusajs/framework/utils"

const PaymentMethodToken = model.define("PaymentMethodToken", {
  id: model.id({ prefix: "paymttok" }).primaryKey(),
  provider_id: model.text(),
  data: model.json().nullable(),
  name: model.text(),
  type_detail: model.text().nullable(),
  description_detail: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default PaymentMethodToken
