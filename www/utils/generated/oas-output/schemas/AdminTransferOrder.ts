/**
 * @schema AdminTransferOrder
 * type: object
 * description: The details of the request to transfer the order.
 * x-schemaName: AdminTransferOrder
 * required:
 *   - customer_id
 * properties:
 *   customer_id:
 *     type: string
 *     title: customer_id
 *     description: The ID of the customer to transfer the order to.
 *   description:
 *     type: string
 *     title: description
 *     description: The description of the order transfer, which can be shown to the customer receiving the order transfer request.
 *   internal_note:
 *     type: string
 *     title: internal_note
 *     description: An internal note viewable only by admin users.
 * 
*/

