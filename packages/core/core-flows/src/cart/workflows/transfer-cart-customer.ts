import {
  createWorkflow,
  transform,
  when,
  WorkflowData,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "../../common"
import { updateCartsStep } from "../steps"
import { refreshCartItemsWorkflow } from "./refresh-cart-items"

export const transferCartCustomerWorkflowId = "transfer-cart-customer"
/**
 * This workflow transfers cart's customer.
 */
export const transferCartCustomerWorkflow = createWorkflow(
  transferCartCustomerWorkflowId,
  (input: WorkflowData<{ id: string; customer_id: string }>) => {
    const cartQuery = useQueryGraphStep({
      entity: "cart",
      filters: { id: input.id },
      fields: [
        "id",
        "email",
        "customer_id",
        "customer.has_account",
        "shipping_address.*",
        "region.*",
        "region.countries.*",
      ],
      options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" })

    const cart = transform({ cartQuery }, ({ cartQuery }) => cartQuery.data[0])

    const customerQuery = useQueryGraphStep({
      entity: "customer",
      filters: { id: input.customer_id },
      fields: ["id", "email"],
      options: { throwIfKeyNotFound: true },
    }).config({ name: "get-customer" })

    const customer = transform(
      { customerQuery },
      ({ customerQuery }) => customerQuery.data[0]
    )

    // If its the same customer, we don't want the email to be overridden, so we skip the
    // update entirely. When the customer is different, we also override the email.
    // The customer will have an opportunity to edit email again through update cart endpoint.
    const shouldTransfer = transform(
      { cart, customer },
      ({ cart, customer }) => cart.customer?.id !== customer.id
    )

    when({ shouldTransfer }, ({ shouldTransfer }) => shouldTransfer).then(
      () => {
        const cartInput = transform(
          { cart, customer },
          ({ cart, customer }) => [
            {
              id: cart.id,
              customer_id: customer.id,
              email: customer.email,
            },
          ]
        )

        updateCartsStep(cartInput)

        refreshCartItemsWorkflow.runAsStep({
          input: { cart_id: input.id },
        })
      }
    )
  }
)
