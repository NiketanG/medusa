import {
  AdditionalData,
  UpdateCartWorkflowInputDTO,
} from "@medusajs/framework/types"
import {
  CartWorkflowEvents,
  isDefined,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  createHook,
  createWorkflow,
  parallelize,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  emitEventStep,
  useQueryGraphStep,
  useRemoteQueryStep,
} from "../../common"
import { deleteLineItemsStep } from "../../line-item"
import {
  findOrCreateCustomerStep,
  findSalesChannelStep,
  updateCartsStep,
} from "../steps"
import { refreshCartItemsWorkflow } from "./refresh-cart-items"

/**
 * The data to update the cart, along with custom data that's passed to the workflow's hooks.
 */
export type UpdateCartWorkflowInput = UpdateCartWorkflowInputDTO & AdditionalData

export const updateCartWorkflowId = "update-cart"
/**
 * This workflow updates a cart and returns it. You can update the cart's region, address, and more. This workflow is executed by the 
 * [Update Cart Store API Route](https://docs.medusajs.com/api/store#carts_postcartsid).
 * 
 * :::note
 * 
 * This workflow doesn't allow updating a cart's line items. Instead, use {@link addToCartWorkflow} and {@link updateLineItemInCartWorkflow}.
 * 
 * :::
 * 
 * This workflow has a hook that allows you to perform custom actions on the updated cart. For example, you can pass custom data under the `additional_data` property of the Update Cart API route, 
 * then update any associated details related to the cart in the workflow's hook.
 * 
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around updating a cart.
 * 
 * @example
 * const { result } = await updateCartWorkflow(container)
 * .run({
 *   input: {
 *     id: "cart_123",
 *     region_id: "region_123",
 *     shipping_address: {
 *       first_name: "John",
 *       last_name: "Doe",
 *       address_1: "1234 Main St",
 *       city: "San Francisco",
 *       country_code: "US",
 *       postal_code: "94111",
 *       phone: "1234567890",
 *     },
 *     additional_data: {
 *       external_id: "123"
 *     }
 *   }
 * })
 * 
 * @summary
 * 
 * Update a cart's details, such as region, address, and more.
 * 
 * @property hooks.cartUpdated - This hook is executed after a cart is update. You can consume this hook to perform custom actions on the updated cart.
 */
export const updateCartWorkflow = createWorkflow(
  updateCartWorkflowId,
  (input: WorkflowData<UpdateCartWorkflowInput>) => {
    const cartToUpdate = useRemoteQueryStep({
      entry_point: "cart",
      variables: { id: input.id },
      fields: [
        "id",
        "email",
        "customer_id",
        "shipping_address.*",
        "region.*",
        "region.countries.*",
      ],
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "get-cart" })

    const customerDataInput = transform({ input, cartToUpdate }, (data) => {
      return {
        customer_id: data.cartToUpdate.customer_id,
        email: data.input.email ?? data.cartToUpdate.email,
      }
    })

    const [salesChannel, customer] = parallelize(
      findSalesChannelStep({
        salesChannelId: input.sales_channel_id,
      }),
      findOrCreateCustomerStep({
        customerId: customerDataInput.customer_id,
        email: customerDataInput.email,
      })
    )

    const newRegion = when({ input }, (data) => {
      return !!data.input.region_id
    }).then(() => {
      return useRemoteQueryStep({
        entry_point: "region",
        variables: { id: input.region_id },
        fields: ["id", "countries.*", "currency_code", "name"],
        list: false,
        throw_if_key_not_found: true,
      }).config({ name: "get-region" })
    })

    const region = transform({ cartToUpdate, newRegion }, (data) => {
      return data.newRegion ?? data.cartToUpdate.region
    })

    const cartInput = transform(
      {
        input,
        region,
        customer,
        salesChannel,
        cartToUpdate,
      },
      (data) => {
        const {
          promo_codes,
          additional_data: _,
          ...updateCartData
        } = data.input

        const data_ = {
          ...updateCartData,
          currency_code: data.region?.currency_code,
          region_id: data.region?.id, // This is either the region from the input or the region from the cart or null
        }

        // When the region is updated, we do a few things:
        // - We need to make sure the provided shipping address country code is in the new region
        // - We clear the shipping address if the new region has more than one country
        const regionIsNew = data.region?.id !== data.cartToUpdate.region?.id
        const shippingAddress = data.input.shipping_address

        if (shippingAddress?.country_code) {
          const country = data.region.countries.find(
            (c) => c.iso_2 === shippingAddress.country_code
          )

          if (!country) {
            throw new MedusaError(
              MedusaError.Types.INVALID_DATA,
              `Country with code ${shippingAddress.country_code} is not within region ${data.region.name}`
            )
          }

          data_.shipping_address = {
            ...shippingAddress,
            country_code: country.iso_2,
          }
        }

        if (regionIsNew) {
          if (data.region.countries.length === 1) {
            data_.shipping_address = {
              country_code: data.region.countries[0].iso_2,
            }
          }

          if (!data_.shipping_address?.country_code) {
            data_.shipping_address = null
          }
        }

        if (isDefined(updateCartData.email) && data.customer?.customer) {
          const currentCustomer = data.customer.customer!
          data_.customer_id = currentCustomer.id

          // registered customers can update the cart email
          if (currentCustomer.has_account) {
            data_.email = updateCartData.email
          } else {
            data_.email = data.customer.email
          }
        }

        if (isDefined(updateCartData.sales_channel_id)) {
          data_.sales_channel_id = data.salesChannel?.id || null
        }

        return data_
      }
    )

    /*
    when({ cartInput }, ({ cartInput }) => {
      return isDefined(cartInput.customer_id) || isDefined(cartInput.email)
    }).then(() => {
      emitEventStep({
        eventName: CartWorkflowEvents.CUSTOMER_UPDATED,
        data: { id: input.id },
      }).config({ name: "emit-customer-updated" })
    })
    */

    const regionUpdated = transform(
      { input, cartToUpdate },
      ({ input, cartToUpdate }) => {
        return (
          isDefined(input.region_id) &&
          input.region_id !== cartToUpdate?.region?.id
        )
      }
    )

    when({ regionUpdated }, ({ regionUpdated }) => {
      return !!regionUpdated
    }).then(() => {
      emitEventStep({
        eventName: CartWorkflowEvents.REGION_UPDATED,
        data: { id: input.id },
      }).config({ name: "emit-region-updated" })
    })

    parallelize(
      updateCartsStep([cartInput]),
      emitEventStep({
        eventName: CartWorkflowEvents.UPDATED,
        data: { id: input.id },
      })
    )

    // In case the region is updated, we might have a new currency OR tax inclusivity setting
    // Therefore, we need to delete line items with a custom price for good measure
    when({ regionUpdated }, ({ regionUpdated }) => {
      return !!regionUpdated
    }).then(() => {
      const lineItems = useQueryGraphStep({
        entity: "line_items",
        filters: {
          cart_id: input.id,
          is_custom_price: true,
        },
        fields: ["id"],
      })

      const lineItemIds = transform({ lineItems }, ({ lineItems }) => {
        return lineItems.data.map((i) => i.id)
      })

      deleteLineItemsStep(lineItemIds)
    })

    const cart = refreshCartItemsWorkflow.runAsStep({
      input: { cart_id: cartInput.id, promo_codes: input.promo_codes },
    })

    const cartUpdated = createHook("cartUpdated", {
      cart,
      additional_data: input.additional_data,
    })

    return new WorkflowResponse(void 0, {
      hooks: [cartUpdated],
    })
  }
)
