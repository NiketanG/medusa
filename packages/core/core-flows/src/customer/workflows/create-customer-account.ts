import { CreateCustomerDTO, CustomerDTO } from "@medusajs/framework/types"
import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { setAuthAppMetadataStep } from "../../auth"
import { validateCustomerAccountCreation } from "../steps/validate-customer-account-creation"
import { createCustomersWorkflow } from "./create-customers"

export type CreateCustomerAccountWorkflowInput = {
  authIdentityId: string
  customerData: CreateCustomerDTO
}

export const createCustomerAccountWorkflowId = "create-customer-account"
/**
 * This workflow creates an authentication account for a customer.
 */
export const createCustomerAccountWorkflow = createWorkflow(
  createCustomerAccountWorkflowId,
  (
    input: WorkflowData<CreateCustomerAccountWorkflowInput>
  ): WorkflowResponse<CustomerDTO> => {
    validateCustomerAccountCreation(input)

    const customerData = transform({ input }, (data) => {
      return {
        ...data.input.customerData,
        has_account: !!data.input.authIdentityId,
      }
    })

    const customers = createCustomersWorkflow.runAsStep({
      input: {
        customersData: [customerData],
      },
    })

    const customer = transform(
      customers,
      (customers: CustomerDTO[]) => customers[0]
    )

    setAuthAppMetadataStep({
      authIdentityId: input.authIdentityId,
      actorType: "customer",
      value: customer.id,
    })

    return new WorkflowResponse(customer)
  }
)
