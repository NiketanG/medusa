import { model } from "@medusajs/framework/utils"
import IndexData from "./index-data"

const IndexRelation = model.define("IndexRelation", {
  id: model.autoincrement().primaryKey(),
  pivot: model.text(),
  parent_name: model.text(),
  child_name: model.text(),
  parent: model.belongsTo(() => IndexData, {
    mappedBy: "parents",
  }),
  child: model.belongsTo(() => IndexData, {
    mappedBy: "children",
  }),
})
export default IndexRelation
