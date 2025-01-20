/**
 * @schema OrderCreditLine
 * type: object
 * description: The credit line's details.
 * x-schemaName: OrderCreditLine
 * required:
 *   - id
 *   - order_id
 *   - order
 *   - reference
 *   - reference_id
 *   - metadata
 *   - created_at
 *   - updated_at
 * properties:
 *   id:
 *     type: string
 *     title: id
 *     description: The credit line's ID.
 *   order_id:
 *     type: string
 *     title: order_id
 *     description: The ID of the associated order.
 *   order:
 *     $ref: "#/components/schemas/Order"
 *   reference:
 *     type: string
 *     title: reference
 *     description: The table that this credit line references. For example, `payment_collection`.
 *   reference_id:
 *     type: string
 *     title: reference_id
 *     description: The ID of the record in the referenced table. For example, `paycol_123`.
 *   metadata:
 *     type: object
 *     description: The credit line's metadata, can hold custom key-value pairs.
 *   created_at:
 *     type: string
 *     format: date-time
 *     title: created_at
 *     description: The date the credit line was created.
 *   updated_at:
 *     type: string
 *     format: date-time
 *     title: updated_at
 *     description: The date the credit line was updated.
 * 
*/

