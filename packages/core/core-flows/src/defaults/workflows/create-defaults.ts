import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createDefaultSalesChannelStep } from "../../sales-channel"
import { createDefaultStoreStep } from "../steps/create-default-store"

export const createDefaultsWorkflowID = "create-defaults"
/**
 * This workflow creates default data for a Medusa application, including
 * a default sales channel and store. The Medusa application uses this workflow
 * to create the default data, if not existing, when the application is first started.
 * 
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create default data within your custom flows, such as seed scripts.
 * 
 * @example
 * const { result } = await createDefaultsWorkflow(container)
 * .run()
 * 
 * @summary
 * 
 * Create default data for a Medusa application.
 */
export const createDefaultsWorkflow = createWorkflow(
  createDefaultsWorkflowID,
  () => {
    const salesChannel = createDefaultSalesChannelStep({
      data: {
        name: "Default Sales Channel",
        description: "Created by Medusa",
      },
    })
    const store = createDefaultStoreStep({
      store: {
        default_sales_channel_id: salesChannel.id,
      },
    })

    return new WorkflowResponse(store)
  }
)
