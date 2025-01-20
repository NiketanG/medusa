import * as React from "react"

import { useDataTableContext } from "@/blocks/data-table/context/use-data-table-context"
import { DropdownMenu } from "@/components/dropdown-menu"
import { IconButton } from "@/components/icon-button"
import { Skeleton } from "@/components/skeleton"
import { Tooltip } from "@/components/tooltip"
import { Funnel } from "@medusajs/icons"

interface DataTableFilterMenuProps {
  tooltip?: string
}

const DataTableFilterMenu = (props: DataTableFilterMenuProps) => {
  const { instance } = useDataTableContext()

  const enabledFilters = Object.keys(instance.getFiltering())

  const filterOptions = instance
    .getFilters()
    .filter((filter) => !enabledFilters.includes(filter.id))

  if (!enabledFilters.length && !filterOptions.length) {
    throw new Error(
      "DataTable.FilterMenu was rendered but there are no filters to apply. Make sure to pass filters to 'useDataTable'"
    )
  }

  const Wrapper = props.tooltip ? Tooltip : React.Fragment

  if (instance.showSkeleton) {
    return <DataTableFilterMenuSkeleton />
  }

  return (
    <DropdownMenu>
      <Wrapper content={props.tooltip} hidden={filterOptions.length === 0}>
        <DropdownMenu.Trigger asChild disabled={filterOptions.length === 0}>
          <IconButton size="small">
            <Funnel />
          </IconButton>
        </DropdownMenu.Trigger>
      </Wrapper>
      <DropdownMenu.Content side="bottom">
        {filterOptions.map((filter) => (
          <DropdownMenu.Item
            key={filter.id}
            onClick={() => {
              instance.addFilter({ id: filter.id, value: undefined })
            }}
          >
            {filter.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

const DataTableFilterMenuSkeleton = () => {
  return <Skeleton className="size-7" />
}

export { DataTableFilterMenu }
export type { DataTableFilterMenuProps }

