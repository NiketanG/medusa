/**
 * @oas [post] /admin/inventory-items/location-levels/batch
 * operationId: PostInventoryItemsLocationLevelsBatch
 * summary: Manage Inventory Levels
 * description: Manage inventory levels to create, update, or delete them.
 * x-authenticated: true
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 *   - jwt_token: []
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         description: The inventory levels to manage.
 *         properties:
 *           create:
 *             type: array
 *             description: The inventory levels to create.
 *             items:
 *               type: object
 *               description: The details of an inventory level to create.
 *               required:
 *                 - location_id
 *                 - inventory_item_id
 *               properties:
 *                 location_id:
 *                   type: string
 *                   title: location_id
 *                   description: The ID of the associated stock location.
 *                 inventory_item_id:
 *                   type: string
 *                   title: inventory_item_id
 *                   description: The ID of the associated inventory item.
 *                 stocked_quantity:
 *                   type: number
 *                   title: stocked_quantity
 *                   description: The stocked quantity.
 *                 incoming_quantity:
 *                   type: number
 *                   title: incoming_quantity
 *                   description: The incoming quantity to be added to stock.
 *           update:
 *             type: array
 *             description: The inventory levels to update.
 *             items:
 *               type: object
 *               description: The details of an inventory level to update.
 *               required:
 *                 - location_id
 *                 - inventory_item_id
 *               properties:
 *                 location_id:
 *                   type: string
 *                   title: location_id
 *                   description: The ID of the associated stock location.
 *                 inventory_item_id:
 *                   type: string
 *                   title: inventory_item_id
 *                   description: The ID of the associated inventory item.
 *                 stocked_quantity:
 *                   type: number
 *                   title: stocked_quantity
 *                   description: The stocked quantity.
 *                 incoming_quantity:
 *                   type: number
 *                   title: incoming_quantity
 *                   description: The incoming quantity to be added to stock.
 *           delete:
 *             type: array
 *             description: The IDs of the inventory levels to delete.
 *             items:
 *               type: string
 *               title: delete
 *               description: The ID of the inventory level to delete.
 *           force:
 *             type: boolean
 *             title: force
 *             description: Whether to delete specified inventory levels even if they have a non-zero stocked quantity.
 * x-codeSamples:
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/inventory-items/location-levels/batch' \
 *       -H 'Authorization: Bearer {access_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *         "create": [
 *           {
 *             "location_id": "sloc_123",
 *             "inventory_item_id": "iitem_123",
 *             "stocked_quantity": 100,
 *             "incoming_quantity": 50
 *           }
 *         ],
 *         "update": [
 *           {
 *             "location_id": "sloc_456",
 *             "inventory_item_id": "iitem_456",
 *             "stocked_quantity": 200,
 *             "incoming_quantity": 75
 *           }
 *         ],
 *         "delete": [
 *           "iilev_123"
 *         ]
 *       }'
 * tags:
 *   - Inventory Items
 * responses:
 *   "400":
 *     $ref: "#/components/responses/400_error"
 *   "401":
 *     $ref: "#/components/responses/unauthorized"
 *   "404":
 *     $ref: "#/components/responses/not_found_error"
 *   "409":
 *     $ref: "#/components/responses/invalid_state_error"
 *   "422":
 *     $ref: "#/components/responses/invalid_request_error"
 *   "500":
 *     $ref: "#/components/responses/500_error"
 * x-workflow: batchInventoryItemLevelsWorkflow
 * 
*/

