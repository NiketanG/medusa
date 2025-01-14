import { model } from "@medusajs/framework/utils"
import { Product, ProductOptionValue } from "@models"

const ProductVariant = model
  .define("ProductVariant", {
    id: model.id({ prefix: "variant" }).primaryKey(),
    title: model.text().searchable(),
    sku: model.text().searchable().nullable(),
    barcode: model.text().searchable().nullable(),
    ean: model.text().searchable().nullable(),
    upc: model.text().searchable().nullable(),
    allow_backorder: model.boolean().default(false),
    manage_inventory: model.boolean().default(true),
    hs_code: model.text().nullable(),
    origin_country: model.text().nullable(),
    mid_code: model.text().nullable(),
    material: model.text().nullable(),
    weight: model.number().nullable(),
    length: model.number().nullable(),
    height: model.number().nullable(),
    width: model.number().nullable(),
    metadata: model.json().nullable(),
    variant_rank: model.number().default(0).nullable(),
    product: model
      .belongsTo(() => Product, {
        mappedBy: "variants",
      })
      .nullable(),
    options: model.manyToMany(() => ProductOptionValue, {
      pivotTable: "product_variant_option",
      mappedBy: "variants",
      joinColumn: "variant_id",
      inverseJoinColumn: "option_value_id",
    }),
  })
  .indexes([
    {
      name: "IDX_product_variant_product_id",
      on: ["product_id"],
      unique: false,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_product_variant_sku_unique",
      on: ["sku"],
      unique: true,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_product_variant_barcode_unique",
      on: ["barcode"],
      unique: true,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_product_variant_ean_unique",
      on: ["ean"],
      unique: true,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_product_variant_upc_unique",
      on: ["upc"],
      unique: true,
      where: "deleted_at IS NULL",
    },
  ])

export default ProductVariant
