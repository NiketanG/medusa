import { CartDTO } from "../.."

export type CartPropsForFulfillment = {
  id: CartDTO["id"]
  shipping_address: CartDTO["shipping_address"]
  items: CartDTO["items"] & {
    variant: {
      id: string
      weight: number
      length: number
      height: number
      width: number
      material: string
      product: {
        id: string
      }
    }
    product: {
      id: string
      collection_id: string
      categories: {
        id: string
      }[]
      tags: {
        id: string
      }[]
    }
  }
}
