import {
  CartLineItemDTO,
  CartShippingMethodDTO,
  CartWorkflowDTO,
  ITaxModuleService,
  ItemTaxLineDTO,
  OrderLineItemDTO,
  OrderShippingMethodDTO,
  OrderWorkflowDTO,
  ShippingTaxLineDTO,
  TaxableItemDTO,
  TaxableShippingDTO,
  TaxCalculationContext,
} from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export interface GetItemTaxLinesStepInput {
  orderOrCart: OrderWorkflowDTO | CartWorkflowDTO
  items: OrderLineItemDTO[] | CartLineItemDTO[]
  shipping_methods: OrderShippingMethodDTO[] | CartShippingMethodDTO[]
  force_tax_calculation?: boolean
  is_return?: boolean
  shipping_address?: OrderWorkflowDTO["shipping_address"]
}

function normalizeTaxModuleContext(
  orderOrCart: OrderWorkflowDTO | CartWorkflowDTO,
  forceTaxCalculation: boolean,
  isReturn?: boolean,
  shippingAddress?: OrderWorkflowDTO["shipping_address"]
): TaxCalculationContext | null {
  const address = shippingAddress ?? orderOrCart.shipping_address
  const shouldCalculateTax =
    forceTaxCalculation || orderOrCart.region?.automatic_taxes

  if (!shouldCalculateTax) {
    return null
  }

  if (forceTaxCalculation && !address?.country_code) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `country code is required to calculate taxes`
    )
  }

  if (!address?.country_code) {
    return null
  }

  const customer = orderOrCart.customer && {
    id: orderOrCart.customer.id,
    email: orderOrCart.customer.email,
    customer_groups: orderOrCart.customer.groups?.map((g) => g.id) || [],
    metadata: orderOrCart.customer.metadata,
  }

  return {
    address: {
      country_code: address.country_code,
      province_code: address.province,
      address_1: address.address_1,
      address_2: address.address_2,
      city: address.city,
      postal_code: address.postal_code,
      metadata: address.metadata,
    },
    customer,
    is_return: isReturn ?? false,
  }
}

function normalizeLineItemsForTax(
  orderOrCart: OrderWorkflowDTO | CartWorkflowDTO,
  items: OrderLineItemDTO[] | CartLineItemDTO[]
): TaxableItemDTO[] {
  return items.map(
    (item) =>
      ({
        id: item.id,
        product_id: item.product_id!,
        product_type_id: item.product_type_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_code: orderOrCart.currency_code,
      } as TaxableItemDTO)
  )
}

function normalizeLineItemsForShipping(
  orderOrCart: OrderWorkflowDTO | CartWorkflowDTO,
  shippingMethods: OrderShippingMethodDTO[] | CartShippingMethodDTO[]
): TaxableShippingDTO[] {
  return shippingMethods.map(
    (shippingMethod) =>
      ({
        id: shippingMethod.id,
        shipping_option_id: shippingMethod.shipping_option_id!,
        unit_price: shippingMethod.amount,
        currency_code: orderOrCart.currency_code,
      } as TaxableShippingDTO)
  )
}

export const getItemTaxLinesStepId = "get-item-tax-lines"
/**
 * This step retrieves the tax lines for an order's line items and shipping methods.
 */
export const getItemTaxLinesStep = createStep(
  getItemTaxLinesStepId,
  async (data: GetItemTaxLinesStepInput, { container }) => {
    const {
      orderOrCart,
      items = [],
      shipping_methods: shippingMethods = [],
      force_tax_calculation: forceTaxCalculation = false,
      is_return: isReturn = false,
      shipping_address: shippingAddress,
    } = data
    const taxService = container.resolve<ITaxModuleService>(Modules.TAX)

    const taxContext = normalizeTaxModuleContext(
      orderOrCart,
      forceTaxCalculation,
      isReturn,
      shippingAddress
    )

    const stepResponseData = {
      lineItemTaxLines: [] as ItemTaxLineDTO[],
      shippingMethodsTaxLines: [] as ShippingTaxLineDTO[],
    }

    if (!taxContext) {
      return new StepResponse(stepResponseData)
    }

    if (items.length) {
      stepResponseData.lineItemTaxLines = (await taxService.getTaxLines(
        normalizeLineItemsForTax(orderOrCart, items),
        taxContext
      )) as ItemTaxLineDTO[]
    }

    if (shippingMethods.length) {
      stepResponseData.shippingMethodsTaxLines = (await taxService.getTaxLines(
        normalizeLineItemsForShipping(orderOrCart, shippingMethods),
        taxContext
      )) as ShippingTaxLineDTO[]
    }

    return new StepResponse(stepResponseData)
  }
)
