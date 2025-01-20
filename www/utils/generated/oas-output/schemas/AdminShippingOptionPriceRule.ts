/**
 * @schema AdminShippingOptionPriceRule
 * type: object
 * description: The details of a shipping option price's rule.
 * x-schemaName: AdminShippingOptionPriceRule
 * required:
 *   - id
 *   - value
 *   - operator
 *   - attribute
 *   - price_id
 *   - priority
 *   - created_at
 *   - updated_at
 *   - deleted_at
 * properties:
 *   id:
 *     type: string
 *     title: id
 *     description: The price rule's ID.
 *   value:
 *     oneOf:
 *       - type: string
 *         title: value
 *         description: The price rule's value.
 *       - type: number
 *         title: value
 *         description: The price rule's value.
 *     description: The price rule's value.
 *   operator:
 *     type: string
 *     description: The price rule's operator.
 *     enum:
 *       - gt
 *       - lt
 *       - eq
 *       - ne
 *       - in
 *       - lte
 *       - gte
 *       - nin
 *   attribute:
 *     type: string
 *     title: attribute
 *     description: The price rule's attribute.
 *   price_id:
 *     type: string
 *     title: price_id
 *     description: The ID of the price this rule applies to.
 *   priority:
 *     type: number
 *     title: priority
 *     description: The price rule's priority.
 *   created_at:
 *     type: string
 *     format: date-time
 *     title: created_at
 *     description: The date the price rule was created.
 *   updated_at:
 *     type: string
 *     format: date-time
 *     title: updated_at
 *     description: The date the price rule was updated.
 *   deleted_at:
 *     type: string
 *     format: date-time
 *     title: deleted_at
 *     description: The date the price rule was deleted.
 * 
*/

