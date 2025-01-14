import { Application } from "typedoc"
import WorkflowsPlugin from "./plugin.js"

export function load(app: Application) {
  new WorkflowsPlugin(app)
}
