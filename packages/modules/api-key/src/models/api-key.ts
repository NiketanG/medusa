import { model } from "@medusajs/framework/utils"

const ApiKey = model
  .define("ApiKey", {
    id: model.id({ prefix: "apk" }).primaryKey(),
    token: model.text(),
    salt: model.text(),
    redacted: model.text().searchable(),
    title: model.text().searchable(),
    type: model.enum(["publishable", "secret"]),
    last_used_at: model.dateTime().nullable(),
    created_by: model.text(),
    revoked_by: model.text().nullable(),
    revoked_at: model.dateTime().nullable(),
  })
  .indexes([
    {
      on: ["token"],
      unique: true,
    },
    {
      on: ["type"],
    },
  ])

export default ApiKey
