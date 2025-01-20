/**
 * @schema AdminUpdateStore
 * type: object
 * description: The properties to update in a store.
 * x-schemaName: AdminUpdateStore
 * properties:
 *   name:
 *     type: string
 *     title: name
 *     description: The store's name.
 *   supported_currencies:
 *     type: array
 *     description: The store's supported currencies.
 *     items:
 *       type: object
 *       description: A store currency.
 *       required:
 *         - currency_code
 *       properties:
 *         currency_code:
 *           type: string
 *           title: currency_code
 *           description: The currency's code.
 *           example: usd
 *         is_default:
 *           type: boolean
 *           title: is_default
 *           description: Whether the currency is the default in the store.
 *         is_tax_inclusive:
 *           type: boolean
 *           title: is_tax_inclusive
 *           description: Whether prices using this currency are tax inclusive.
 *   default_sales_channel_id:
 *     type: string
 *     title: default_sales_channel_id
 *     description: The ID of the default sales channel in the store.
 *   default_region_id:
 *     type: string
 *     title: default_region_id
 *     description: The ID of the default region in the store.
 *   default_location_id:
 *     type: string
 *     title: default_location_id
 *     description: The ID of the default stock location in the store.
 *   metadata:
 *     type: object
 *     description: The store's metadata, can hold custom key-value pairs.
 * 
*/

