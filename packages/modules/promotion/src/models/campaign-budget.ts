import { PromotionUtils, model } from "@medusajs/framework/utils"
import Campaign from "./campaign"

const CampaignBudget = model.define(
  { name: "CampaignBudget", tableName: "promotion_campaign_budget" },
  {
    id: model.id({ prefix: "probudg" }).primaryKey(),
    type: model
      .enum(PromotionUtils.CampaignBudgetType)
      .index("IDX_campaign_budget_type"),
    currency_code: model.text().nullable(),
    limit: model.bigNumber().nullable(),
    used: model.bigNumber().default(0),
    campaign: model.belongsTo(() => Campaign, {
      mappedBy: "budget",
    }),
  }
)

export default CampaignBudget
