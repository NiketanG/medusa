import { ChangeActionType, MedusaError } from "@medusajs/framework/utils"
import { OrderChangeProcessing } from "../calculate-order-change"
import { setActionReference } from "../set-action-reference"

OrderChangeProcessing.registerActionType(ChangeActionType.CREDIT_LINE_ADD, {
  operation({ action, currentOrder, options }) {
    const creditLines = currentOrder.credit_lines ?? []
    let existing = creditLines.find((cl) => cl.id === action.reference_id)

    if (!existing) {
      existing = {
        id: action.reference_id!,
        order_id: currentOrder.id,
        amount: action.amount!,
        reference: action.reference,
        reference_id: action.reference_id,
      }

      creditLines.push(existing)
    }

    setActionReference(existing, action, options)

    currentOrder.credit_lines = creditLines
  },
  validate({ action }) {
    if (action.amount == null) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Amount is required."
      )
    }
  },
})
