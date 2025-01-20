"use client"

import * as React from "react"

import { clx } from "@/utils/clx"

import { DataTableCommandBar } from "./components/data-table-command-bar"
import { DataTableFilterMenu } from "./components/data-table-filter-menu"
import { DataTablePagination } from "./components/data-table-pagination"
import { DataTableSearch } from "./components/data-table-search"
import { DataTableSortingMenu } from "./components/data-table-sorting-menu"
import { DataTableTable } from "./components/data-table-table"
import { DataTableToolbar } from "./components/data-table-toolbar"
import { DataTableContextProvider } from "./context/data-table-context-provider"
import { UseDataTableReturn } from "./use-data-table"

interface DataTableProps<TData> {
  instance: UseDataTableReturn<TData>
  children?: React.ReactNode
  className?: string
}

const Root = <TData,>({
  instance,
  children,
  className,
}: DataTableProps<TData>) => {
  return (
    <DataTableContextProvider instance={instance}>
      <div className={clx("relative flex min-h-0 flex-1 flex-col", className)}>
        {children}
      </div>
    </DataTableContextProvider>
  )
}

const DataTable = Object.assign(Root, {
  Table: DataTableTable,
  Toolbar: DataTableToolbar,
  Search: DataTableSearch,
  SortingMenu: DataTableSortingMenu,
  FilterMenu: DataTableFilterMenu,
  Pagination: DataTablePagination,
  CommandBar: DataTableCommandBar,
})

export { DataTable }
export type { DataTableProps }
