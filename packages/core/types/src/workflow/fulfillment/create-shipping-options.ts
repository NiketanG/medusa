import { ShippingOptionDTO } from "../../fulfillment"
import { RuleOperatorType } from "../../common"

type CreateFlatRateShippingOptionPriceRecord =
  | {
      currency_code: string
      amount: number
    }
  | {
      region_id: string
      amount: number
    }

type CreateFlatShippingOptionInputBase = {
  name: string
  service_zone_id: string
  shipping_profile_id: string
  data?: Record<string, unknown>
  provider_id: string
  type: {
    label: string
    description: string
    code: string
  }
  rules?: {
    attribute: string
    operator: RuleOperatorType
    value: string | string[]
  }[]
}

type CreateFlatRateShippingOptionInput = CreateFlatShippingOptionInputBase & {
  price_type: "flat"
  prices: CreateFlatRateShippingOptionPriceRecord[]
}

type CreateCalculatedShippingOptionInput = CreateFlatShippingOptionInputBase & {
  price_type: "calculated"
}

export type CreateShippingOptionsWorkflowInput =
  | CreateFlatRateShippingOptionInput
  | CreateCalculatedShippingOptionInput

export type CreateShippingOptionsWorkflowOutput = ShippingOptionDTO[]
