import BaseResource from "./base"
import * as Types from "../types"
import {
  StorePostCartsCartLineItemsReq,
  StorePostCartsCartLineItemsItemReq,
  StoreCartsDeleteRes,
  StoreCartsCartRes,
} from "@medusajs/medusa"
import { AxiosPromise } from "axios"

class LineItemsResource extends BaseResource {
  /**
   * Creates a line-item for a cart
   * @param {string} cart_id id of cart
   * @param {StorePostCartsCartLineItemsReq} payload details needed to create a line-item
   * @return {AxiosPromise<{ cart: Cart }>}
   */
  create(
    cart_id: string,
    payload: StorePostCartsCartLineItemsReq
  ): AxiosPromise<{ cart: StoreCartsCartRes }> {
    const path = `/store/carts/${cart_id}/line-items`
    return this.client.request("POST", path, payload)
  }

  /**
   * Updates a line-item.
   * Only quantity updates are allowed
   * @param {string} cart_id id of cart
   * @param {string} line_id id of item to update
   * @param {StorePostCartsCartLineItemsItemReq} payload details needed to update a line-item
   * @return {AxiosPromise<{ StoreCartsCartRes }>}
   */
  update(
    cart_id: string,
    line_id: string,
    payload: StorePostCartsCartLineItemsItemReq
  ): AxiosPromise<{ cart: StoreCartsCartRes }> {
    const path = `/store/carts/${cart_id}/line-items/${line_id}`
    return this.client.request("POST", path, payload)
  }

  /**
   * Remove a line-item from a cart
   * @param {string} cart_id id of cart
   * @param {string} line_id id of item to remove
   * @return {AxiosPromise<StoreCartsDeleteRes>}
   */
  delete(cart_id: string, line_id: string): AxiosPromise<{ cart: Types.Cart }> {
    const path = `/store/carts/${cart_id}/line-items/${line_id}`
    return this.client.request("DELETE", path)
  }
}

export default LineItemsResource
