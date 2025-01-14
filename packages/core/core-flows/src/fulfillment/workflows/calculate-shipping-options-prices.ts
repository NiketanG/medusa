import { FulfillmentWorkflow } from "@medusajs/framework/types"
import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { calculateShippingOptionsPricesStep } from "../steps"
import { useQueryGraphStep } from "../../common"
import { cartFieldsForCalculateShippingOptionsPrices } from "../../cart/utils/fields"

export const calculateShippingOptionsPricesWorkflowId =
  "calculate-shipping-options-prices-workflow"
/**
 * This workflow calculates the prices for one or more shipping options.
 */
export const calculateShippingOptionsPricesWorkflow = createWorkflow(
  calculateShippingOptionsPricesWorkflowId,
  (
    input: WorkflowData<FulfillmentWorkflow.CalculateShippingOptionsPricesWorkflowInput>
  ): WorkflowResponse<FulfillmentWorkflow.CalculateShippingOptionsPricesWorkflowOutput> => {
    const ids = transform({ input }, ({ input }) =>
      input.shipping_options.map((so) => so.id)
    )

    const shippingOptionsQuery = useQueryGraphStep({
      entity: "shipping_option",
      filters: { id: ids },
      fields: ["id", "provider_id", "data", "service_zone.fulfillment_set_id"],
    }).config({ name: "shipping-options-query" })

    const cartQuery = useQueryGraphStep({
      entity: "cart",
      filters: { id: input.cart_id },
      fields: cartFieldsForCalculateShippingOptionsPrices,
    }).config({ name: "cart-query" })

    const fulfillmentSetId = transform(
      { shippingOptionsQuery },
      ({ shippingOptionsQuery }) =>
        shippingOptionsQuery.data.map(
          (so) => so.service_zone.fulfillment_set_id
        )
    )

    const locationFulfillmentSetQuery = useQueryGraphStep({
      entity: "location_fulfillment_set",
      filters: { fulfillment_set_id: fulfillmentSetId },
      fields: ["id", "stock_location_id", "fulfillment_set_id"],
    }).config({ name: "location-fulfillment-set-query" })

    const locationIds = transform(
      { locationFulfillmentSetQuery },
      ({ locationFulfillmentSetQuery }) =>
        locationFulfillmentSetQuery.data.map((lfs) => lfs.stock_location_id)
    )

    const locationQuery = useQueryGraphStep({
      entity: "stock_location",
      filters: { id: locationIds },
      fields: ["id", "name", "address.*"],
    }).config({ name: "location-query" })

    const data = transform(
      {
        shippingOptionsQuery,
        cartQuery,
        input,
        locationFulfillmentSetQuery,
        locationQuery,
      },
      ({
        shippingOptionsQuery,
        cartQuery,
        input,
        locationFulfillmentSetQuery,
        locationQuery,
      }) => {
        const shippingOptions = shippingOptionsQuery.data
        const cart = cartQuery.data[0]

        const locations = locationQuery.data
        const locationFulfillmentSetMap = new Map(
          locationFulfillmentSetQuery.data.map((lfs) => [
            lfs.fulfillment_set_id,
            lfs.stock_location_id,
          ])
        )

        const shippingOptionDataMap = new Map(
          input.shipping_options.map((so) => [so.id, so.data])
        )

        return shippingOptions.map((shippingOption) => ({
          id: shippingOption.id,
          provider_id: shippingOption.provider_id,
          optionData: shippingOption.data,
          data: shippingOptionDataMap.get(shippingOption.id) ?? {},
          context: {
            ...cart,
            from_location: locations.find(
              (l) =>
                l.id ===
                locationFulfillmentSetMap.get(
                  shippingOption.service_zone.fulfillment_set_id
                )
            ),
          },
        }))
      }
    )

    const prices = calculateShippingOptionsPricesStep(data)

    return new WorkflowResponse(prices)
  }
)
