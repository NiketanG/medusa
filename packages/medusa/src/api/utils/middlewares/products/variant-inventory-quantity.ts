import {
  ContainerRegistrationKeys,
  getTotalVariantAvailability,
  getVariantAvailability,
  MedusaError,
} from "@medusajs/framework/utils"
import { MedusaRequest, MedusaStoreRequest } from "@medusajs/framework/http"

export const wrapVariantsWithTotalInventoryQuantity = async (
  req: MedusaRequest,
  variants: VariantInput[]
) => {
  const variantIds = (variants ?? []).map((variant) => variant.id).flat(1)

  if (!variantIds.length) {
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const availability = await getTotalVariantAvailability(query, {
    variant_ids: variantIds,
  })

  wrapVariants(variants, availability)
}

export const wrapVariantsWithInventoryQuantityForSalesChannel = async (
  req: MedusaStoreRequest<unknown>,
  variants: VariantInput[]
) => {
  const salesChannelId = req.filterableFields.sales_channel_id as
    | string
    | string[]
  const { sales_channel_ids: idsFromPublishableKey = [] } =
    req.publishable_key_context

  let channelToUse: string | undefined
  if (salesChannelId && !Array.isArray(salesChannelId)) {
    channelToUse = salesChannelId
  }

  if (idsFromPublishableKey.length === 1) {
    channelToUse = idsFromPublishableKey[0]
  }

  if (!channelToUse) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Inventory availability cannot be calculated in the given context. Either provide a sales channel id or configure a single sales channel in the publishable key`
    )
  }

  variants ??= []
  const variantIds = variants.map((variant) => variant.id).flat(1)

  if (!variantIds.length) {
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const availability = await getVariantAvailability(query, {
    variant_ids: variantIds,
    sales_channel_id: channelToUse,
  })

  wrapVariants(variants, availability)
}

type VariantInput = {
  id: string
  inventory_quantity?: number
  manage_inventory?: boolean
}

type VariantAvailability = Awaited<
  ReturnType<typeof getTotalVariantAvailability>
>

const wrapVariants = (
  variants: VariantInput[],
  availability: VariantAvailability
) => {
  for (const variant of variants) {
    if (!variant.manage_inventory) {
      continue
    }

    variant.inventory_quantity = availability[variant.id].availability
  }
}
