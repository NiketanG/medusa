import { TransactionState } from "@medusajs/framework/orchestration"
import { model } from "@medusajs/framework/utils"

export const WorkflowExecution = model
  .define("workflow_execution", {
    id: model.id({ prefix: "wf_exec" }),
    workflow_id: model.text().primaryKey(),
    transaction_id: model.text().primaryKey(),
    execution: model.json().nullable(),
    context: model.json().nullable(),
    state: model.enum(TransactionState),
  })
  .indexes([
    {
      on: ["id"],
      where: "deleted_at IS NULL",
    },
    {
      on: ["workflow_id"],
      where: "deleted_at IS NULL",
    },
    {
      on: ["transaction_id"],
      where: "deleted_at IS NULL",
    },
    {
      on: ["state"],
      where: "deleted_at IS NULL",
    },
  ])
