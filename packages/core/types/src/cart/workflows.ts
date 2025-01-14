import { CustomerDTO } from "../customer"
import { ShippingOptionDTO } from "../fulfillment"
import { PaymentCollectionDTO } from "../payment"
import { ProductDTO } from "../product"
import { RegionDTO } from "../region"
import { BigNumberInput } from "../totals"
import { CartDTO } from "./common"
import {
  CreateAddressDTO,
  UpdateAddressDTO,
  UpdateLineItemDTO,
} from "./mutations"

/**
 * The details of the line item to create.
 */
export interface CreateCartCreateLineItemDTO {
  /**
   * The quantity of the line item.
   */
  quantity: BigNumberInput

  /**
   * The ID of the variant to be added to the cart.
   */
  variant_id?: string

  /**
   * The title of the line item.
   */
  title?: string

  /**
   * The subtitle of the line item.
   */
  subtitle?: string

  /**
   * The thumbnail URL of the line item.
   */
  thumbnail?: string

  /**
   * The ID of the product whose variant is being added to the cart.
   */
  product_id?: string

  /**
   * The title of the associated product.
   */
  product_title?: string

  /**
   * The description of the associated product.
   */
  product_description?: string

  /**
   * The subtitle of the associated product.
   */
  product_subtitle?: string

  /**
   * The ID of the associated product's type.
   */
  product_type?: string

  /**
   * The ID of the associated product's collection.
   */
  product_collection?: string

  /**
   * The handle of the associated product.
   */
  product_handle?: string

  /**
   * The SKU of the associated variant.
   */
  variant_sku?: string

  /**
   * The barcode of the associated variant.
   */
  variant_barcode?: string

  /**
   * The title of the associated variant.
   */
  variant_title?: string

  /**
   * The associated variant's values for the product's options.
   */
  variant_option_values?: Record<string, unknown>

  /**
   * Whether the line item requires shipping.
   */
  requires_shipping?: boolean

  /**
   * Whether the line item is discountable.
   */
  is_discountable?: boolean

  /**
   * Whether the line item's price is tax inclusive. Learn more in 
   * [this documentation](https://docs.medusajs.com/resources/commerce-modules/pricing/tax-inclusive-pricing)
   */
  is_tax_inclusive?: boolean

  /**
   * Whether the line item is a gift card.
   */
  is_giftcard?: boolean

  /**
   * The original price of the item before a promotion or sale.
   */
  compare_at_unit_price?: BigNumberInput

  /**
   * The price of a single quantity of the item.
   */
  unit_price?: BigNumberInput

  /**
   * Custom key-value pairs related to the item.
   */
  metadata?: Record<string, unknown> | null
}

export interface UpdateLineItemInCartWorkflowInputDTO {
  cart_id: string
  item_id: string
  update: Partial<UpdateLineItemDTO>
}

/**
 * The details of the address to create.
 */
export interface CreateCartAddressDTO {
  /**
   * The first name of the customer associated with the address.
   */
  first_name?: string
  
  /**
   * The last name of the customer associated with the address.
   */
  last_name?: string
  
  /**
   * The address's phone number
   */
  phone?: string
  
  /**
   * The address's company name.
   */
  company?: string
  
  /**
   * The primary address line.
   */
  address_1?: string
  
  /**
   * The secondary address line.
   */
  address_2?: string
  
  /**
   * The city of the address.
   */
  city?: string
  
  /**
   * The country code of the address.
   * 
   * @example us
   */
  country_code?: string
  
  /**
   * The province or state of the address.
   */
  province?: string
  
  /**
   * The postal code of the address.
   */
  postal_code?: string
  
  /**
   * Custom key-value pairs related to the address.
   */
  metadata?: Record<string, unknown>
}

/**
 * The details of a cart to create.
 */
export interface CreateCartWorkflowInputDTO {
  /**
   * The ID of the region that the cart belongs to.
   */
  region_id?: string

  /**
   * The ID of the customer associated with the cart.
   */
  customer_id?: string

  /**
   * The ID of the sales channel through which the cart is created.
   */
  sales_channel_id?: string

  /**
   * The email address of the cart's customer.
   */
  email?: string

  /**
   * The currency code of the cart. This defaults to the region's currency code.
   * 
   * @example usd
   */
  currency_code?: string

  /**
   * The ID of the associated shipping address.
   */
  shipping_address_id?: string

  /**
   * The ID of the associated billing address.
   */
  billing_address_id?: string

  /**
   * The ID of an existing shipping address, or the details of a shipping address to create.
   */
  shipping_address?: CreateCartAddressDTO | string

  /**
   * The ID of an existing billing address, or the details of a billing address to create.
   */
  billing_address?: CreateCartAddressDTO | string

  /**
   * Custom key-value pairs related to the cart.
   */
  metadata?: Record<string, unknown>

  /**
   * The items to be added to the cart.
   */
  items?: CreateCartCreateLineItemDTO[]

  /**
   * The promotional codes applied on the cart.
   */
  promo_codes?: string[]
}

export interface AddToCartWorkflowInputDTO {
  cart_id: string
  items: CreateCartCreateLineItemDTO[]
}

/**
 * The details to update in a cart.
 */
export interface UpdateCartWorkflowInputDTO {
  /**
   * The ID of the cart to update.
   */
  id: string

  /**
   * An array of promotional codes applied on the cart.
   */
  promo_codes?: string[]

  /**
   * The ID of the cart's region.
   */
  region_id?: string

  /**
   * The ID of the cart's customer.
   */
  customer_id?: string | null

  /**
   * The ID of the cart's sales channel.
   */
  sales_channel_id?: string | null

  /**
   * The email address of the cart's customer.
   */
  email?: string | null

  /**
   * The currency code for the cart.
   * 
   * @example usd
   */
  currency_code?: string

  /**
   * Custom key-value pairs of data related to the cart.
   */
  metadata?: Record<string, unknown> | null

  /**
   * The cart's shipping address. You can either update the cart's existing shipping address, or create a new one.
   */
  shipping_address?: CreateAddressDTO | UpdateAddressDTO | null

  /**
   * The cart's billing address. You can either update the cart's existing billing address, or create a new one.
   */
  billing_address?: CreateAddressDTO | UpdateAddressDTO | null
}

export interface CreatePaymentCollectionForCartWorkflowInputDTO {
  cart_id: string
  metadata?: Record<string, unknown>
}

export interface CartWorkflowDTO extends CartDTO {
  customer?: CustomerDTO
  product?: ProductDTO
  region?: RegionDTO
}

export interface ListShippingOptionsForCartWorkflowInputDTO {
  cart_id: string
  is_return: boolean
  sales_channel_id?: string
  region_id?: string
  currency_code: string
  shipping_address: {
    city?: string
    country_code?: string
    province?: string
  }
}

export interface PricedShippingOptionDTO extends ShippingOptionDTO {
  amount: BigNumberInput
}

export interface CompleteCartWorkflowInputDTO {
  id: string
}

export interface ConfirmVariantInventoryWorkflowInputDTO {
  sales_channel_id: string
  variants: {
    id: string
    manage_inventory: boolean
    inventory_items: {
      inventory_item_id: string
      variant_id: string
      required_quantity: BigNumberInput
      inventory: {
        location_levels: {
          stock_locations: {
            id: string
            sales_channels: {
              id: string
            }[]
          }[]
        }
      }[]
    }[]
  }[]
  items: {
    variant_id?: string | null
    quantity: BigNumberInput
    id?: string
  }[]
  itemsToUpdate?: {
    data: {
      variant_id?: string
      quantity?: BigNumberInput
    }
  }[]
}

export interface CartWorkflowDTO {
  id: string
  payment_collection: PaymentCollectionDTO
}
