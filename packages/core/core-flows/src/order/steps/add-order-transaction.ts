import { CreateOrderTransactionDTO } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

/**
 * The transaction(s) to add to the order.
 */
export type AddOrderTransactionStepInput = CreateOrderTransactionDTO | CreateOrderTransactionDTO[]

/**
 * The added order transaction(s).
 */
export type AddOrderTransactionStepOutput = CreateOrderTransactionDTO | CreateOrderTransactionDTO[]

export const addOrderTransactionStepId = "add-order-transaction"
/**
 * This step creates order transactions.
 */
export const addOrderTransactionStep = createStep(
  addOrderTransactionStepId,
  async (
    data: AddOrderTransactionStepInput,
    { container }
  ) => {
    const service = container.resolve(Modules.ORDER)

    const trxsData = Array.isArray(data) ? data : [data]

    for (const trx of trxsData) {
      const existing = await service.listOrderTransactions(
        {
          order_id: trx.order_id,
          reference: trx.reference,
          reference_id: trx.reference_id,
        },
        {
          select: ["id"],
        }
      )

      if (existing.length) {
        return new StepResponse(null)
      }
    }

    const created = await service.addOrderTransactions(trxsData)

    return new StepResponse(
      (Array.isArray(data) ? created : created[0]) as AddOrderTransactionStepOutput,
      created.map((c) => c.id)
    )
  },
  async (id, { container }) => {
    if (!id?.length) {
      return
    }

    const service = container.resolve(Modules.ORDER)

    await service.deleteOrderTransactions(id)
  }
)
