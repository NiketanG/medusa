import { CalculatedPriceSet, IPricingModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

/**
 * The details of the variants to get price sets for.
 */
export interface GetVariantPriceSetsStepInput {
  /**
   * The IDs of the variants to get price sets for.
   */
  variantIds: string[]
  /**
   * The context to use when calculating the price sets.
   * 
   * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/product/guides/price#retrieve-calculated-price-for-a-context).
   */
  context?: Record<string, unknown>
}

/**
 * The calculated price sets of the variants. The object's keys are the variant IDs.
 */
export interface GetVariantPriceSetsStepOutput {
  [k: string]: CalculatedPriceSet
}

export const getVariantPriceSetsStepId = "get-variant-price-sets"
/**
 * This step retrieves the calculated price sets of the specified variants.
 * 
 * @example
 * To retrieve a variant's price sets:
 * 
 * ```ts
 * const data = getVariantPriceSetsStep({
 *   variantIds: ["variant_123"],
 * })
 * ```
 * 
 * To retrieve the calculated price sets of a variant:
 * 
 * ```ts
 * const data = getVariantPriceSetsStep({
 *   variantIds: ["variant_123"],
 *   context: {
 *     currency_code: "usd"
 *   }
 * })
 * ```
 */
export const getVariantPriceSetsStep = createStep(
  getVariantPriceSetsStepId,
  async (data: GetVariantPriceSetsStepInput, { container }) => {
    if (!data.variantIds.length) {
      return new StepResponse({})
    }

    const pricingModuleService = container.resolve<IPricingModuleService>(
      Modules.PRICING
    )

    const remoteQuery = container.resolve("remoteQuery")

    const variantPriceSets = await remoteQuery({
      entryPoint: "variant",
      fields: ["id", "price_set.id"],
      variables: {
        id: data.variantIds,
      },
    })

    const notFound: string[] = []
    const priceSetIds: string[] = []

    variantPriceSets.forEach((v) => {
      if (v.price_set?.id) {
        priceSetIds.push(v.price_set.id)
      } else {
        notFound.push(v.id)
      }
    })

    if (notFound.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Variants with IDs ${notFound.join(", ")} do not have a price`
      )
    }

    const calculatedPriceSets = await pricingModuleService.calculatePrices(
      { id: priceSetIds },
      { context: data.context as Record<string, string | number> }
    )

    const idToPriceSet = new Map<string, Record<string, any>>(
      calculatedPriceSets.map((p) => [p.id, p])
    )

    const variantToCalculatedPriceSets = variantPriceSets.reduce(
      (acc, { id, price_set }) => {
        const calculatedPriceSet = idToPriceSet.get(price_set?.id)
        if (calculatedPriceSet) {
          acc[id] = calculatedPriceSet
        }

        return acc
      },
      {}
    )

    return new StepResponse(
      variantToCalculatedPriceSets as GetVariantPriceSetsStepOutput
    )
  }
)
