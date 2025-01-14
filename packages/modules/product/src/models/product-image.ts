import { model } from "@medusajs/framework/utils"
import Product from "./product"

const ProductImage = model
  .define(
    { tableName: "image", name: "ProductImage" },
    {
      id: model.id({ prefix: "img" }).primaryKey(),
      url: model.text(),
      metadata: model.json().nullable(),
      rank: model.number().default(0),
      product: model.belongsTo(() => Product, {
        mappedBy: "images",
      }),
    }
  )
  .indexes([
    {
      name: "IDX_product_image_url",
      on: ["url"],
      unique: false,
      where: "deleted_at IS NULL",
    },
  ])

export default ProductImage
