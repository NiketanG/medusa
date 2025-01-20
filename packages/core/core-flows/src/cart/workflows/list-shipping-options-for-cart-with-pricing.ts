import { ShippingOptionPriceType } from "@medusajs/framework/utils"
import {
  createWorkflow,
  parallelize,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { 
  CalculateShippingOptionPriceDTO, 
  ListShippingOptionsForCartWithPricingWorkflowInput,
} from "@medusajs/types"

import { useQueryGraphStep, validatePresenceOfStep } from "../../common"
import { useRemoteQueryStep } from "../../common/steps/use-remote-query"
import { calculateShippingOptionsPricesStep } from "../../fulfillment"
import { cartFieldsForCalculateShippingOptionsPrices } from "../utils/fields"

const COMMON_OPTIONS_FIELDS = [
  "id",
  "name",
  "price_type",
  "service_zone_id",
  "service_zone.fulfillment_set_id",
  "shipping_profile_id",
  "provider_id",
  "data",

  "type.id",
  "type.label",
  "type.description",
  "type.code",

  "provider.id",
  "provider.is_enabled",

  "rules.attribute",
  "rules.value",
  "rules.operator",
]

export const listShippingOptionsForCartWithPricingWorkflowId =
  "list-shipping-options-for-cart-with-pricing"
/**
 * This workflow lists shipping options that can be used during checkout for a cart. It also retrieves the prices
 * of these shipping options, including calculated prices that may be retrieved from third-party providers.
 * 
 * This workflow is executed in other cart-related workflows, such as {@link addShippingMethodToCartWorkflow} to retrieve the
 * price of the shipping method being added to the cart.
 * 
 * You can use this workflow within your own customizations or custom workflows, allowing you to retrieve the shipping options of a cart and their prices 
 * in your custom flows.
 * 
 * @example
 * const { result } = await listShippingOptionsForCartWithPricingWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     options: [
 *       {
 *         id: "so_123",
 *         data: {
 *           carrier_code: "fedex"
 *         }
 *       }
 *     ]
 *   }
 * })
 * 
 * @summary
 * 
 * List a cart's shipping options with prices.
 */
export const listShippingOptionsForCartWithPricingWorkflow = createWorkflow(
  listShippingOptionsForCartWithPricingWorkflowId,
  (
    input: WorkflowData<ListShippingOptionsForCartWithPricingWorkflowInput>
  ) => {
    const optionIds = transform({ input }, ({ input }) =>
      (input.options ?? []).map(({ id }) => id)
    )

    const cartQuery = useQueryGraphStep({
      entity: "cart",
      filters: { id: input.cart_id },
      fields: [
        ...cartFieldsForCalculateShippingOptionsPrices,
        "sales_channel_id",
        "currency_code",
        "region_id",
        "item_total",
        "total",
      ],
      options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" })

    const cart = transform({ cartQuery }, ({ cartQuery }) => cartQuery.data[0])

    validatePresenceOfStep({
      entity: cart,
      fields: ["sales_channel_id", "region_id", "currency_code"],
    })

    const scFulfillmentSetQuery = useQueryGraphStep({
      entity: "sales_channels",
      filters: { id: cart.sales_channel_id },
      fields: [
        "stock_locations.id",
        "stock_locations.name",
        "stock_locations.address.*",
        "stock_locations.fulfillment_sets.id",
      ],
    }).config({ name: "sales_channels-fulfillment-query" })

    const scFulfillmentSets = transform(
      { scFulfillmentSetQuery },
      ({ scFulfillmentSetQuery }) => scFulfillmentSetQuery.data[0]
    )

    const { fulfillmentSetIds, fulfillmentSetLocationMap } = transform(
      { scFulfillmentSets },
      ({ scFulfillmentSets }) => {
        const fulfillmentSetIds = new Set<string>()
        const fulfillmentSetLocationMap = {}

        scFulfillmentSets.stock_locations.forEach((stockLocation) => {
          stockLocation.fulfillment_sets.forEach((fulfillmentSet) => {
            fulfillmentSetLocationMap[fulfillmentSet.id] = stockLocation
            fulfillmentSetIds.add(fulfillmentSet.id)
          })
        })

        return {
          fulfillmentSetIds: Array.from(fulfillmentSetIds),
          fulfillmentSetLocationMap,
        }
      }
    )

    const commonOptions = transform(
      { input, cart, fulfillmentSetIds },
      ({ input, cart, fulfillmentSetIds }) => ({
        context: {
          is_return: input.is_return ?? false,
          enabled_in_store: input.enabled_in_store ?? true,
        },

        filters: {
          fulfillment_set_id: fulfillmentSetIds,

          address: {
            country_code: cart.shipping_address?.country_code,
            province_code: cart.shipping_address?.province,
            city: cart.shipping_address?.city,
            postal_expression: cart.shipping_address?.postal_code,
          },
        },
      })
    )

    const typeQueryFilters = transform(
      { optionIds, commonOptions },
      ({ optionIds, commonOptions }) => ({
        id: optionIds.length ? optionIds : undefined,
        ...commonOptions,
      })
    )

    /**
     * We need to prefetch exact same SO as in the final result but only to determine pricing calculations first.
     */
    const initialOptions = useRemoteQueryStep({
      entry_point: "shipping_options",
      variables: typeQueryFilters,
      fields: ["id", "price_type"],
    }).config({ name: "shipping-options-price-type-query" })

    /**
     * Prepare queries for flat rate and calculated shipping options since price calculations are different for each.
     */
    const { flatRateOptionsQuery, calculatedShippingOptionsQuery } = transform(
      {
        cart,
        initialOptions,
        commonOptions,
      },
      ({ cart, initialOptions, commonOptions }) => {
        const flatRateShippingOptionIds: string[] = []
        const calculatedShippingOptionIds: string[] = []

        initialOptions.forEach((option) => {
          if (option.price_type === ShippingOptionPriceType.FLAT) {
            flatRateShippingOptionIds.push(option.id)
          } else {
            calculatedShippingOptionIds.push(option.id)
          }
        })

        return {
          flatRateOptionsQuery: {
            ...commonOptions,
            id: flatRateShippingOptionIds,
            calculated_price: { context: cart },
          },
          calculatedShippingOptionsQuery: {
            ...commonOptions,
            id: calculatedShippingOptionIds,
          },
        }
      }
    )

    const [shippingOptionsFlatRate, shippingOptionsCalculated] = parallelize(
      useRemoteQueryStep({
        entry_point: "shipping_options",
        fields: [
          ...COMMON_OPTIONS_FIELDS,
          "calculated_price.*",
          "prices.*",
          "prices.price_rules.*",
        ],
        variables: flatRateOptionsQuery,
      }).config({ name: "shipping-options-query-flat-rate" }),
      useRemoteQueryStep({
        entry_point: "shipping_options",
        fields: [...COMMON_OPTIONS_FIELDS],
        variables: calculatedShippingOptionsQuery,
      }).config({ name: "shipping-options-query-calculated" })
    )

    const calculateShippingOptionsPricesData = transform(
      {
        shippingOptionsCalculated,
        cart,
        input,
        fulfillmentSetLocationMap,
      },
      ({
        shippingOptionsCalculated,
        cart,
        input,
        fulfillmentSetLocationMap,
      }) => {
        const optionDataMap = new Map(
          (input.options ?? []).map(({ id, data }) => [id, data])
        )

        return shippingOptionsCalculated.map(
          (so) =>
            ({
              id: so.id as string,
              optionData: so.data,
              context: {
                ...cart,
                from_location:
                  fulfillmentSetLocationMap[so.service_zone.fulfillment_set_id],
              },
              data: optionDataMap.get(so.id),
              provider_id: so.provider_id,
            } as CalculateShippingOptionPriceDTO)
        )
      }
    )

    const prices = calculateShippingOptionsPricesStep(
      calculateShippingOptionsPricesData
    )

    const shippingOptionsWithPrice = transform(
      {
        shippingOptionsFlatRate,
        shippingOptionsCalculated,
        prices,
        fulfillmentSetLocationMap,
      },
      ({
        shippingOptionsFlatRate,
        shippingOptionsCalculated,
        prices,
        fulfillmentSetLocationMap,
      }) => {
        return [
          ...shippingOptionsFlatRate.map((shippingOption) => {
            const price = shippingOption.calculated_price

            return {
              ...shippingOption,
              amount: price?.calculated_amount,
              is_tax_inclusive: !!price?.is_calculated_price_tax_inclusive,
            }
          }),
          ...shippingOptionsCalculated.map((shippingOption, index) => {
            return {
              ...shippingOption,
              amount: prices[index]?.calculated_amount,
              is_tax_inclusive:
                prices[index]?.is_calculated_price_tax_inclusive,
              calculated_price: prices[index],
              stock_location:
                fulfillmentSetLocationMap[
                  shippingOption.service_zone.fulfillment_set_id
                ],
            }
          }),
        ]
      }
    )

    return new WorkflowResponse(shippingOptionsWithPrice)
  }
)
