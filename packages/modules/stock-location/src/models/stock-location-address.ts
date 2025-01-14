import { model } from "@medusajs/framework/utils"
import { StockLocation } from "@models"

const StockLocationAddress = model
  .define("StockLocationAddress", {
    id: model.id({ prefix: "laddr" }).primaryKey(),
    address_1: model.text(),
    address_2: model.text().nullable(),
    company: model.text().nullable(),
    city: model.text().nullable(),
    country_code: model.text(),
    phone: model.text().nullable(),
    province: model.text().nullable(),
    postal_code: model.text().nullable(),
    metadata: model.json().nullable(),
    stock_locations: model.hasOne(() => StockLocation, {
      mappedBy: "address",
    }),
  })
  .cascades({
    delete: ["stock_locations"],
  })

export default StockLocationAddress
