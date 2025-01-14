import { IndexOrderBy } from "../index-data/query-config/query-input-config-order-by"
import { ObjectToRemoteQueryFields } from "./object-to-remote-query-fields"
import { RemoteQueryEntryPoints } from "./remote-query-entry-points"
import { RemoteQueryFilters } from "./to-remote-query"

export type RemoteQueryObjectConfig<TEntry extends string> = {
  // service: string This property is still supported under the hood but part of the type due to types missmatch towards fields
  entryPoint: TEntry | keyof RemoteQueryEntryPoints
  variables?: any
  fields: ObjectToRemoteQueryFields<
    RemoteQueryEntryPoints[TEntry & keyof RemoteQueryEntryPoints]
  > extends never
    ? string[]
    :
        | ObjectToRemoteQueryFields<
            RemoteQueryEntryPoints[TEntry & keyof RemoteQueryEntryPoints]
          >[]
        | string[]
}

export type RemoteQueryObjectFromStringResult<
  TConfig extends RemoteQueryObjectConfig<any>
> = {
  __TConfig: TConfig
  __value: object
}

export type RemoteQueryInput<TEntry extends string> = {
  // service: string This property is still supported under the hood but part of the type due to types missmatch towards fields
  /**
   * The name of the entity to retrieve. For example, `product`.
   */
  entity: TEntry | keyof RemoteQueryEntryPoints
  /**
   * The fields and relations to retrieve in the entity.
   */
  fields: ObjectToRemoteQueryFields<
    RemoteQueryEntryPoints[TEntry & keyof RemoteQueryEntryPoints]
  > extends never
    ? string[]
    :
        | ObjectToRemoteQueryFields<
            RemoteQueryEntryPoints[TEntry & keyof RemoteQueryEntryPoints]
          >[]
        | string[]
  /**
   * Pagination configurations for the returned list of items.
   */
  pagination?: {
    /**
     * The number of items to skip before retrieving the returned items.
     */
    skip: number
    /**
     * The maximum number of items to return.
     */
    take?: number
    /**
     * Sort by field names in ascending or descending order.
     */
    order?: IndexOrderBy<TEntry>
  }
  /**
   * Filters to apply on the retrieved items.
   */
  filters?: RemoteQueryFilters<TEntry>
  /**
   * Apply a query context on the retrieved data. For example, to retrieve product prices for a certain context.
   */
  context?: any
}

export type RemoteQueryGraph<TEntry extends string> = {
  __TConfig: RemoteQueryObjectConfig<TEntry>
}
