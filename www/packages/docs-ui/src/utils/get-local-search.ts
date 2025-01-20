import MiniSearch, { Options as MiniSearchOptions } from "minisearch"

type BaseSearchRecord = Record<string, unknown>

type GetLocalSearchInput<T extends BaseSearchRecord = BaseSearchRecord> = {
  docs: T[]
  searchableFields: string[]
  options?: Omit<MiniSearchOptions, "fields">
}

type SearchResult<T> = (T & {
  terms?: string[]
})[]

export type LocalSearch<T extends BaseSearchRecord = BaseSearchRecord> =
  MiniSearch & {
    search: (query: string) => SearchResult<T>
  }

export const getLocalSearch = <T extends BaseSearchRecord = BaseSearchRecord>({
  docs,
  searchableFields,
  options,
}: GetLocalSearchInput<T>): LocalSearch<T> => {
  const miniSearch = new MiniSearch({
    fields: searchableFields,
    ...options,
  })
  miniSearch.addAll(docs)

  return miniSearch as LocalSearch<T>
}
