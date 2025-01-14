import { z } from "zod"
import { applyAndAndOrOperators } from "../../utils/common-validators"
import { createFindParams, createSelectParams } from "../../utils/validators"

export const StoreGetShippingOptionsParams = createSelectParams()

export const StoreGetShippingOptionsFields = z
  .object({
    cart_id: z.string(),
    is_return: z.boolean().optional(),
  })
  .strict()

export type StoreGetShippingOptionsType = z.infer<
  typeof StoreGetShippingOptions
>
export const StoreGetShippingOptions = createFindParams({
  limit: 20,
  offset: 0,
})
  .merge(StoreGetShippingOptionsFields)
  .merge(applyAndAndOrOperators(StoreGetShippingOptionsFields))

export type StoreCalculateShippingOptionPriceType = z.infer<
  typeof StoreCalculateShippingOptionPrice
>
export const StoreCalculateShippingOptionPrice = z.object({
  cart_id: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
})
