import {
  CreateShippingMethodDTO,
  ICartModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The details of the shipping methods to add.
 */
export interface AddShippingMethodToCartStepInput {
  /**
   * The shipping methods to add.
   */
  shipping_methods: CreateShippingMethodDTO[]
}

export const addShippingMethodToCartStepId = "add-shipping-method-to-cart-step"
/**
 * This step adds shipping methods to a cart.
 * 
 * @example
 * const data = addShippingMethodToCartStep({
 *   shipping_methods: [
 *     {
 *       name: "Standard Shipping",
 *       cart_id: "cart_123",
 *       amount: 10,
 *     }
 *   ]
 * })
 */
export const addShippingMethodToCartStep = createStep(
  addShippingMethodToCartStepId,
  async (data: AddShippingMethodToCartStepInput, { container }) => {
    const cartService = container.resolve<ICartModuleService>(Modules.CART)

    const methods = await cartService.addShippingMethods(data.shipping_methods)

    return new StepResponse(methods, methods)
  },
  async (methods, { container }) => {
    const cartService: ICartModuleService = container.resolve(Modules.CART)
    if (!methods?.length) {
      return
    }

    await cartService.deleteShippingMethods(methods.map((m) => m.id))
  }
)
