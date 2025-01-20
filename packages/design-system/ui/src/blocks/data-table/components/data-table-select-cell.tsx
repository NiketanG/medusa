"use client"

import type { DataTableCellContext, DataTableHeaderContext } from "@/blocks/data-table/types"
import { Checkbox } from "@/components/checkbox"
import { CheckedState } from "@radix-ui/react-checkbox"
import * as React from "react"

interface DataTableSelectCellProps<TData> {
  ctx: DataTableCellContext<TData, unknown>
}

const DataTableSelectCell = <TData,>(props: DataTableSelectCellProps<TData>) => {
  const checked = props.ctx.row.getIsSelected()
  const onChange = props.ctx.row.getToggleSelectedHandler()

  return (
    <Checkbox
      onClick={(e) => e.stopPropagation()}
      checked={checked}
      onCheckedChange={onChange}
    />
  )
}

interface DataTableSelectHeaderProps<TData> {
  ctx: DataTableHeaderContext<TData, unknown>
}

const DataTableSelectHeader = <TData,>(props: DataTableSelectHeaderProps<TData>) => {
  const checked = props.ctx.table.getIsSomePageRowsSelected()
    ? "indeterminate"
    : props.ctx.table.getIsAllPageRowsSelected()

  const onChange = (checked: CheckedState) => {
    props.ctx.table.toggleAllPageRowsSelected(!!checked)
  }

  return (
    <Checkbox
      onClick={(e) => e.stopPropagation()}
      checked={checked}
      onCheckedChange={onChange}
    />
  )
}

export { DataTableSelectCell, DataTableSelectHeader }
export type { DataTableSelectCellProps, DataTableSelectHeaderProps }

