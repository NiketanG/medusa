import { ModuleJoinerConfig } from "@medusajs/framework/types"
import { LINKS, Modules } from "@medusajs/framework/utils"

export const OrderPromotion: ModuleJoinerConfig = {
  serviceName: LINKS.OrderPromotion,
  isLink: true,
  databaseConfig: {
    tableName: "order_promotion",
    idPrefix: "orderpromo",
  },
  alias: [
    {
      name: ["order_promotion", "order_promotions"],
      entity: "LinkOrderPromotion",
    },
  ],
  primaryKeys: ["id", "order_id", "promotion_id"],
  relationships: [
    {
      serviceName: Modules.ORDER,
      entity: "Order",
      primaryKey: "id",
      foreignKey: "order_id",
      alias: "order",
      args: {
        methodSuffix: "Orders",
      },
    },
    {
      serviceName: Modules.PROMOTION,
      entity: "Promotion",
      primaryKey: "id",
      foreignKey: "promotion_id",
      alias: "promotion",
      args: {
        methodSuffix: "Promotions",
      },
    },
  ],
  extends: [
    {
      serviceName: Modules.ORDER,
      entity: "Order",
      fieldAlias: {
        promotion: {
          path: "promotion_link.promotion",
          isList: true,
        },
      },
      relationship: {
        serviceName: LINKS.OrderPromotion,
        primaryKey: "order_id",
        foreignKey: "id",
        alias: "promotion_link",
      },
    },
    {
      serviceName: Modules.PROMOTION,
      entity: "Promotion",
      relationship: {
        serviceName: LINKS.OrderPromotion,
        primaryKey: "promotion_id",
        foreignKey: "id",
        alias: "order_link",
      },
    },
  ],
}
