import { model } from "@medusajs/framework/utils"

import { ShippingOption } from "./shipping-option"

export const ShippingOptionType = model.define("shipping_option_type", {
  id: model.id({ prefix: "sotype" }).primaryKey(),
  label: model.text(),
  description: model.text().nullable(),
  code: model.text(),
  shipping_option: model.hasOne(() => ShippingOption, {
    mappedBy: "type",
  }),
})
