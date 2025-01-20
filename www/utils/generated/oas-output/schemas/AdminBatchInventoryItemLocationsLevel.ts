/**
 * @schema AdminBatchInventoryItemLocationsLevel
 * type: object
 * description: The inventory levels to create, update, or delete.
 * properties:
 *   create:
 *     type: array
 *     description: The inventory levels to create.
 *     items:
 *       type: object
 *       description: The inventory level's details.
 *       required:
 *         - location_id
 *       properties:
 *         location_id:
 *           type: string
 *           title: location_id
 *           description: The ID of the associated location.
 *         stocked_quantity:
 *           type: number
 *           title: stocked_quantity
 *           description: The inventory level's stocked quantity.
 *         incoming_quantity:
 *           type: number
 *           title: incoming_quantity
 *           description: The inventory level's incoming quantity.
 *   update:
 *     type: array
 *     description: The inventory levels to update.
 *     items:
 *       type: object
 *       description: The inventory level's details.
 *       properties:
 *         stocked_quantity:
 *           type: number
 *           title: stocked_quantity
 *           description: The inventory level's stocked quantity.
 *         incoming_quantity:
 *           type: number
 *           title: incoming_quantity
 *           description: The inventory level's incoming quantity.
 *         location_id:
 *           type: string
 *           title: location_id
 *           description: The associated stock location's ID.
 *         id:
 *           type: string
 *           title: id
 *           description: The ID of the location level.
 *       required:
 *         - location_id
 *   delete:
 *     type: array
 *     description: The inventory levels to delete.
 *     items:
 *       type: string
 *       title: delete
 *       description: The ID of the inventory level to delete.
 *   force:
 *     type: boolean
 *     title: force
 *     description: Whether to delete specified inventory levels even if they have a non-zero stocked quantity.
 * x-schemaName: AdminBatchInventoryItemLocationsLevel
 * 
*/

