import { model } from "@medusajs/framework/utils"
import { ProviderIdentity } from "./provider-identity"

export const AuthIdentity = model
  .define("auth_identity", {
    id: model.id({ prefix: "authid" }).primaryKey(),
    provider_identities: model.hasMany(() => ProviderIdentity, {
      mappedBy: "auth_identity",
    }),
    app_metadata: model.json().nullable(),
  })
  .cascades({
    delete: ["provider_identities"],
  })
