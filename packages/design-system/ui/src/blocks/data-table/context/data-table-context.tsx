import { createContext } from "react"
import { UseDataTableReturn } from "../use-data-table"

export interface DataTableContextValue<TData> {
  instance: UseDataTableReturn<TData>
}

export const DataTableContext =
  createContext<DataTableContextValue<any> | null>(null)
