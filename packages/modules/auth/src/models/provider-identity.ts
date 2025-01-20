import { model } from "@medusajs/framework/utils"
import { AuthIdentity } from "./auth-identity"

export const ProviderIdentity = model
  .define("provider_identity", {
    id: model.id().primaryKey(),
    entity_id: model.text(),
    provider: model.text(),
    auth_identity: model.belongsTo(() => AuthIdentity, {
      mappedBy: "provider_identities",
    }),
    user_metadata: model.json().nullable(),
    provider_metadata: model.json().nullable(),
  })
  .indexes([
    {
      name: "IDX_provider_identity_provider_entity_id",
      on: ["entity_id", "provider"],
      unique: true,
    },
  ])
