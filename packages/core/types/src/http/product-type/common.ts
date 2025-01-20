export interface BaseProductType {
  /**
   * The product type's ID.
   */
  id: string
  /**
   * The product type's value.
   */
  value: string
  /**
   * The date the product type was created.
   */
  created_at: string
  /**
   * The date the product type was updated.
   */
  updated_at: string
  /**
   * The date the product type was deleted.
   */
  deleted_at?: string | null
  /**
   * Key-value pairs of custom data.
   */
  metadata?: Record<string, unknown> | null
}
