import { model, PricingRuleOperator } from "@medusajs/framework/utils"
import Price from "./price"

const PriceRule = model
  .define("PriceRule", {
    id: model.id({ prefix: "prule" }).primaryKey(),
    attribute: model.text(),
    value: model.text(),
    operator: model.enum(PricingRuleOperator).default(PricingRuleOperator.EQ),
    priority: model.number().default(0),
    price: model.belongsTo(() => Price, {
      mappedBy: "price_rules",
    }),
  })
  .indexes([
    {
      on: ["price_id", "attribute", "operator"],
      where: "deleted_at IS NULL",
      unique: true,
    },
  ])

export default PriceRule
