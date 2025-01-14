import { CustomerDTO, ICustomerModuleService } from "@medusajs/framework/types"
import { isDefined, Modules, validateEmail } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export interface FindOrCreateCustomerStepInput {
  customerId?: string | null
  email?: string | null
}

export interface FindOrCreateCustomerOutputStepOutput {
  customer?: CustomerDTO | null
  email?: string | null
}

interface StepCompensateInput {
  customer?: CustomerDTO
  customerWasCreated: boolean
}

export const findOrCreateCustomerStepId = "find-or-create-customer"
/**
 * This step either finds a customer matching the specified ID, or finds / create a customer
 * matching the specified email. If both ID and email are provided, ID takes precedence.
 * If the customer is a guest, the email is updated to the provided email.
 */
export const findOrCreateCustomerStep = createStep(
  findOrCreateCustomerStepId,
  async (data: FindOrCreateCustomerStepInput, { container }) => {
    if (!isDefined(data.customerId) && !isDefined(data.email)) {
      return new StepResponse(
        {
          customer: undefined,
          email: undefined,
        },
        {
          customerWasCreated: false,
        }
      )
    }

    const service = container.resolve<ICustomerModuleService>(Modules.CUSTOMER)

    const customerData: FindOrCreateCustomerOutputStepOutput = {
      customer: null,
      email: null,
    }
    let originalCustomer: CustomerDTO | null = null
    let customerWasCreated = false

    if (data.customerId) {
      originalCustomer = await service.retrieveCustomer(data.customerId)
      customerData.customer = originalCustomer
      customerData.email = originalCustomer.email
    }

    if (data.email) {
      const validatedEmail = (data.email && validateEmail(data.email)) as string

      let [customer] = originalCustomer
        ? [originalCustomer]
        : await service.listCustomers({
            email: validatedEmail,
          })

      // if NOT a guest customer, return it
      if (customer?.has_account) {
        customerData.customer = customer
        customerData.email = customer.email

        return new StepResponse(customerData, {
          customerWasCreated,
        })
      }

      if (
        !customer ||
        (isDefined(data.email) && customer.email !== validatedEmail)
      ) {
        customer = await service.createCustomers({ email: validatedEmail })
        customerWasCreated = true
      }

      originalCustomer = customer

      customerData.customer = customer
      customerData.email = customer.email
    }

    return new StepResponse(customerData, {
      customer: originalCustomer,
      customerWasCreated,
    })
  },
  async (compData, { container }) => {
    const { customer, customerWasCreated } = compData as StepCompensateInput

    if (!customerWasCreated || !customer?.id) {
      return
    }

    const service = container.resolve<ICustomerModuleService>(Modules.CUSTOMER)

    await service.deleteCustomers(customer.id)
  }
)
