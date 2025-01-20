import { model } from "@medusajs/framework/utils"
import PromotionRule from "./promotion-rule"

const PromotionRuleValue = model.define(
  { name: "PromotionRuleValue", tableName: "promotion_rule_value" },
  {
    id: model.id({ prefix: "prorulval" }).primaryKey(),
    value: model.text(),
    promotion_rule: model.belongsTo(() => PromotionRule, {
      mappedBy: "values",
    }),
  }
)

export default PromotionRuleValue
