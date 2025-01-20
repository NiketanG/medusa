import {
  ICartModuleService,
  UpdateLineItemWithSelectorDTO,
} from "@medusajs/framework/types"
import {
  Modules,
  getSelectsAndRelationsFromObjectArray,
} from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The details of the line items to update.
 */
export interface UpdateLineItemsStepInput {
  /**
   * The ID of the cart that the line items belong to.
   */
  id: string
  /**
   * The line items to update.
   */
  items: UpdateLineItemWithSelectorDTO[]
}

export const updateLineItemsStepId = "update-line-items-step"
/**
 * This step updates a cart's line items.
 * 
 * @example
 * const data = updateLineItemsStep({
 *   id: "cart_123",
 *   items: [
 *     {
 *       selector: {
 *         id: "line_item_123"
 *       },
 *       data: {
 *         quantity: 2
 *       }
 *     }
 *   ]
 * })
 */
export const updateLineItemsStep = createStep(
  updateLineItemsStepId,
  async (input: UpdateLineItemsStepInput, { container }) => {
    const { items = [] } = input

    if (!items?.length) {
      return new StepResponse([], [])
    }

    const cartModule = container.resolve<ICartModuleService>(Modules.CART)

    const { selects, relations } = getSelectsAndRelationsFromObjectArray(
      items.map((item) => item.data)
    )

    const itemsBeforeUpdate = await cartModule.listLineItems(
      { id: items.map((d) => d.selector.id!) },
      { select: selects, relations }
    )

    const updatedItems = items.length
      ? await cartModule.updateLineItems(items)
      : []

    return new StepResponse(updatedItems, itemsBeforeUpdate)
  },
  async (itemsBeforeUpdate, { container }) => {
    if (!itemsBeforeUpdate?.length) {
      return
    }

    const cartModule: ICartModuleService = container.resolve(Modules.CART)

    if (itemsBeforeUpdate.length) {
      const itemsToUpdate: UpdateLineItemWithSelectorDTO[] = []

      for (const item of itemsBeforeUpdate) {
        const { id, ...data } = item

        itemsToUpdate.push({ selector: { id }, data })
      }

      await cartModule.updateLineItems(itemsToUpdate)
    }
  }
)
