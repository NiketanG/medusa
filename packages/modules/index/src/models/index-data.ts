import { model } from "@medusajs/framework/utils"
import IndexRelation from "./index-relation"

const IndexData = model
  .define("IndexData", {
    id: model.text().primaryKey(),
    name: model.text().primaryKey(),
    data: model.json().default({}),
    parents: model.manyToMany(() => IndexData, {
      mappedBy: "children",
      pivotEntity: () => IndexRelation,
      joinColumn: ["child_id", "child_name"],
      inverseJoinColumn: ["parent_id", "parent_name"],
    }),
    children: model.manyToMany(() => IndexData, {
      mappedBy: "parents",
    }),
  })
  .indexes([
    {
      name: "IDX_index_data_gin",
      type: "GIN",
      on: ["data"],
    },
    {
      name: "IDX_index_data_id",
      on: ["id"],
    },
    {
      name: "IDX_index_data_name",
      on: ["name"],
    },
  ])

export default IndexData
