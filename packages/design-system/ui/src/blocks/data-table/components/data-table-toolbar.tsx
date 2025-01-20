import { DataTableFilterBar } from "@/blocks/data-table/components/data-table-filter-bar"
import { clx } from "@/utils/clx"
import * as React from "react"

interface DataTableToolbarTranslations {
  /**
   * The label for the clear all filters button
   * @default "Clear all"
   */
  clearAll?: string
}

interface DataTableToolbarProps {
  className?: string
  children?: React.ReactNode
  translations?: DataTableToolbarTranslations
}

const DataTableToolbar = (props: DataTableToolbarProps) => {
  return (
    <div className="flex flex-col divide-y">
      <div className={clx("flex items-center px-6 py-4", props.className)}>
        {props.children}
      </div>
      <DataTableFilterBar
        clearAllFiltersLabel={props.translations?.clearAll}
      />
    </div>
  )
}

export { DataTableToolbar }
export type { DataTableToolbarProps, DataTableToolbarTranslations }

