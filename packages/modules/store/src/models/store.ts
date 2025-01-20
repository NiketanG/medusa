import { model } from "@medusajs/framework/utils"
import StoreCurrency from "./currency"

const Store = model
  .define("Store", {
    id: model.id({ prefix: "store" }).primaryKey(),
    name: model.text().default("Medusa Store").searchable(),
    default_sales_channel_id: model.text().nullable(),
    default_region_id: model.text().nullable(),
    default_location_id: model.text().nullable(),
    metadata: model.json().nullable(),
    supported_currencies: model.hasMany(() => StoreCurrency, {
      mappedBy: "store",
    }),
  })
  .cascades({
    delete: ["supported_currencies"],
  })

export default Store
