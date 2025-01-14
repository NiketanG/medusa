import { model } from "@medusajs/framework/utils"
import Capture from "./capture"
import PaymentCollection from "./payment-collection"
import PaymentSession from "./payment-session"
import Refund from "./refund"

const Payment = model
  .define("Payment", {
    id: model.id({ prefix: "pay" }).primaryKey(),
    amount: model.bigNumber(),
    currency_code: model.text(),
    provider_id: model.text(),
    cart_id: model.text().searchable().nullable(),
    order_id: model.text().searchable().nullable(),
    customer_id: model.text().searchable().nullable(),
    data: model.json().nullable(),
    metadata: model.json().nullable(),
    captured_at: model.dateTime().nullable(),
    canceled_at: model.dateTime().nullable(),
    payment_collection: model.belongsTo(() => PaymentCollection, {
      mappedBy: "payments",
    }),
    payment_session: model.belongsTo(() => PaymentSession, {
      mappedBy: "payment",
    }),
    refunds: model.hasMany(() => Refund, {
      mappedBy: "payment",
    }),
    captures: model.hasMany(() => Capture, {
      mappedBy: "payment",
    }),
  })
  .cascades({
    delete: ["refunds", "captures"],
  })
  .indexes([
    {
      name: "IDX_payment_provider_id",
      on: ["provider_id"],
    },
    {
      name: "IDX_payment_payment_collection_id",
      on: ["payment_collection_id"],
    },
    {
      name: "IDX_payment_payment_session_id",
      on: ["payment_session_id"],
    },
  ])

export default Payment
