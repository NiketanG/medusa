"use client"

import { CheckMini, EllipseMiniSolid, XMark } from "@medusajs/icons"
import * as React from "react"

import { useDataTableContext } from "@/blocks/data-table/context/use-data-table-context"
import type {
  DataTableDateComparisonOperator,
  DataTableDateFilterProps,
  DataTableFilterOption,
} from "@/blocks/data-table/types"
import { isDateComparisonOperator } from "@/blocks/data-table/utils/is-date-comparison-operator"
import { DatePicker } from "@/components/date-picker"
import { Label } from "@/components/label"
import { Popover } from "@/components/popover"
import { clx } from "@/utils/clx"

interface DataTableFilterProps {
  id: string
  filter: unknown
}

const DEFAULT_FORMAT_DATE_VALUE = (d: Date) =>
  d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
const DEFAULT_RANGE_OPTION_LABEL = "Custom"
const DEFAULT_RANGE_OPTION_START_LABEL = "Starting"
const DEFAULT_RANGE_OPTION_END_LABEL = "Ending"

const DataTableFilter = ({ id, filter }: DataTableFilterProps) => {
  const { instance } = useDataTableContext()
  const [open, setOpen] = React.useState(filter === undefined)
  const [isCustom, setIsCustom] = React.useState(false)

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (
        !open &&
        (!filter || (Array.isArray(filter) && filter.length === 0))
      ) {
        instance.removeFilter(id)
      }

      setOpen(open)
    },
    [instance, id, filter]
  )

  const removeFilter = React.useCallback(() => {
    instance.removeFilter(id)
  }, [instance, id])

  const meta = instance.getFilterMeta(id)
  const { type, options, label, ...rest } = meta ?? {}

  const { displayValue, isCustomRange } = React.useMemo(() => {
    let displayValue: string | null = null
    let isCustomRange = false

    if (typeof filter === "string") {
      displayValue = options?.find((o) => o.value === filter)?.label ?? null
    }

    if (Array.isArray(filter)) {
      displayValue =
        filter
          .map((v) => options?.find((o) => o.value === v)?.label)
          .join(", ") ?? null
    }

    if (isDateComparisonOperator(filter)) {
      displayValue =
        options?.find((o) => {
          if (!isDateComparisonOperator(o.value)) {
            return false
          }

          return (
            !isCustom &&
            (filter.$gte === o.value.$gte || (!filter.$gte && !o.value.$gte)) &&
            (filter.$lte === o.value.$lte || (!filter.$lte && !o.value.$lte)) &&
            (filter.$gt === o.value.$gt || (!filter.$gt && !o.value.$gt)) &&
            (filter.$lt === o.value.$lt || (!filter.$lt && !o.value.$lt))
          )
        })?.label ?? null

      if (!displayValue && isDateFilterProps(meta)) {
        const formatDateValue = meta.formatDateValue
          ? meta.formatDateValue
          : DEFAULT_FORMAT_DATE_VALUE

        if (filter.$gte && !filter.$lte) {
          isCustomRange = true
          displayValue = `${
            meta.rangeOptionStartLabel || DEFAULT_RANGE_OPTION_START_LABEL
          } ${formatDateValue(new Date(filter.$gte))}`
        }

        if (filter.$lte && !filter.$gte) {
          isCustomRange = true
          displayValue = `${
            meta.rangeOptionEndLabel || DEFAULT_RANGE_OPTION_END_LABEL
          } ${formatDateValue(new Date(filter.$lte))}`
        }

        if (filter.$gte && filter.$lte) {
          isCustomRange = true
          displayValue = `${formatDateValue(
            new Date(filter.$gte)
          )} - ${formatDateValue(new Date(filter.$lte))}`
        }
      }
    }

    return { displayValue, isCustomRange }
  }, [filter, options])

  React.useEffect(() => {
    if (isCustomRange && !isCustom) {
      setIsCustom(true)
    }
  }, [isCustomRange, isCustom])

  if (!meta) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal>
      <Popover.Anchor asChild>
        <div
          className={clx(
            "bg-ui-bg-component flex flex-shrink-0 items-center overflow-hidden rounded-md",
            "[&>*]:txt-compact-small-plus [&>*]:flex [&>*]:items-center [&>*]:justify-center",
            {
              "shadow-borders-base divide-x": displayValue,
              "border border-dashed": !displayValue,
            }
          )}
        >
          {displayValue && (
            <div className="text-ui-fg-muted whitespace-nowrap px-2 py-1">
              {label || id}
            </div>
          )}
          <Popover.Trigger
            className={clx(
              "text-ui-fg-subtle hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed transition-fg whitespace-nowrap px-2 py-1 outline-none",
              {
                "text-ui-fg-muted": !displayValue,
              }
            )}
          >
            {displayValue || label || id}
          </Popover.Trigger>

          {displayValue && (
            <button
              type="button"
              className="text-ui-fg-muted hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed transition-fg size-7 outline-none"
              onClick={removeFilter}
            >
              <XMark />
            </button>
          )}
        </div>
      </Popover.Anchor>
      <Popover.Content
        align="start"
        className="bg-ui-bg-component p-0 outline-none"
      >
        {(() => {
          switch (type) {
            case "select":
              return (
                <DataTableFilterSelectContent
                  id={id}
                  filter={filter as string[] | undefined}
                  options={options as DataTableFilterOption<string>[]}
                />
              )
            case "radio":
              return (
                <DataTableFilterRadioContent
                  id={id}
                  filter={filter}
                  options={options as DataTableFilterOption<string>[]}
                />
              )
            case "date":
              return (
                <DataTableFilterDateContent
                  id={id}
                  filter={filter}
                  options={
                    options as DataTableFilterOption<DataTableDateComparisonOperator>[]
                  }
                  isCustom={isCustom}
                  setIsCustom={setIsCustom}
                  {...rest}
                />
              )
            default:
              return null
          }
        })()}
      </Popover.Content>
    </Popover>
  )
}

type DataTableFilterDateContentProps = {
  id: string
  filter: unknown
  options: DataTableFilterOption<DataTableDateComparisonOperator>[]
  isCustom: boolean
  setIsCustom: (isCustom: boolean) => void
} & Pick<
  DataTableDateFilterProps,
  | "format"
  | "rangeOptionLabel"
  | "disableRangeOption"
  | "rangeOptionStartLabel"
  | "rangeOptionEndLabel"
>

const DataTableFilterDateContent = ({
  id,
  filter,
  options,
  format = "date",
  rangeOptionLabel = DEFAULT_RANGE_OPTION_LABEL,
  rangeOptionStartLabel = DEFAULT_RANGE_OPTION_START_LABEL,
  rangeOptionEndLabel = DEFAULT_RANGE_OPTION_END_LABEL,
  disableRangeOption = false,
  isCustom,
  setIsCustom,
}: DataTableFilterDateContentProps) => {
  const currentValue = filter as DataTableDateComparisonOperator | undefined
  const { instance } = useDataTableContext()

  const selectedValue = React.useMemo(() => {
    if (!currentValue || isCustom) {
      return undefined
    }

    return JSON.stringify(currentValue)
  }, [currentValue, isCustom])

  const onValueChange = React.useCallback(
    (valueStr: string) => {
      setIsCustom(false)

      const value = JSON.parse(valueStr) as DataTableDateComparisonOperator
      instance.updateFilter({ id, value })
    },
    [instance, id]
  )

  const onSelectCustom = React.useCallback(() => {
    setIsCustom(true)
    instance.updateFilter({ id, value: undefined })
  }, [instance, id])

  const onCustomValueChange = React.useCallback(
    (input: "$gte" | "$lte", value: Date | null) => {
      const newCurrentValue = { ...currentValue }
      newCurrentValue[input] = value ? value.toISOString() : undefined
      instance.updateFilter({ id, value: newCurrentValue })
    },
    [instance, id]
  )

  const { focusedIndex, setFocusedIndex } = useKeyboardNavigation(
    options,
    (index) => {
      if (index === options.length && !disableRangeOption) {
        onSelectCustom()
      } else {
        onValueChange(JSON.stringify(options[index].value))
      }
    },
    disableRangeOption ? 0 : 1
  )

  const granularity = format === "date-time" ? "minute" : "day"

  const maxDate = currentValue?.$lte
    ? granularity === "minute"
      ? new Date(currentValue.$lte)
      : new Date(new Date(currentValue.$lte).setHours(23, 59, 59, 999))
    : undefined

  const minDate = currentValue?.$gte
    ? granularity === "minute"
      ? new Date(currentValue.$gte)
      : new Date(new Date(currentValue.$gte).setHours(0, 0, 0, 0))
    : undefined

  const initialFocusedIndex = isCustom ? options.length : 0

  const onListFocus = React.useCallback(() => {
    if (focusedIndex === -1) {
      setFocusedIndex(initialFocusedIndex)
    }
  }, [focusedIndex, initialFocusedIndex])

  return (
    <React.Fragment>
      <div
        className="flex flex-col p-1 outline-none"
        tabIndex={0}
        role="list"
        onFocus={onListFocus}
        autoFocus
      >
        {options.map((option, idx) => {
          const value = JSON.stringify(option.value)
          const isSelected = selectedValue === value

          return (
            <OptionButton
              key={idx}
              index={idx}
              option={option}
              isSelected={isSelected}
              isFocused={focusedIndex === idx}
              onClick={() => onValueChange(value)}
              onMouseEvent={setFocusedIndex}
              icon={EllipseMiniSolid}
            />
          )
        })}
        {!disableRangeOption && (
          <OptionButton
            index={options.length}
            option={{
              label: rangeOptionLabel,
              value: "__custom",
            }}
            icon={EllipseMiniSolid}
            isSelected={isCustom}
            isFocused={focusedIndex === options.length}
            onClick={onSelectCustom}
            onMouseEvent={setFocusedIndex}
          />
        )}
      </div>
      {!disableRangeOption && isCustom && (
        <React.Fragment>
          <div className="flex flex-col py-[3px]">
            <div className="bg-ui-border-menu-top h-px w-full" />
            <div className="bg-ui-border-menu-bot h-px w-full" />
          </div>
          <div className="flex flex-col gap-2 px-2 pb-3 pt-1">
            <div className="flex flex-col gap-1">
              <Label id="custom-start-date-label" size="xsmall" weight="plus">
                {rangeOptionStartLabel}
              </Label>
              <DatePicker
                aria-labelledby="custom-start-date-label"
                granularity={granularity}
                maxValue={maxDate}
                value={currentValue?.$gte ? new Date(currentValue.$gte) : null}
                onChange={(value) => onCustomValueChange("$gte", value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label id="custom-end-date-label" size="xsmall" weight="plus">
                {rangeOptionEndLabel}
              </Label>
              <DatePicker
                aria-labelledby="custom-end-date-label"
                granularity={granularity}
                minValue={minDate}
                value={currentValue?.$lte ? new Date(currentValue.$lte) : null}
                onChange={(value) => onCustomValueChange("$lte", value)}
              />
            </div>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}

type DataTableFilterSelectContentProps = {
  id: string
  filter?: string[]
  options: DataTableFilterOption<string>[]
}

const DataTableFilterSelectContent = ({
  id,
  filter = [],
  options,
}: DataTableFilterSelectContentProps) => {
  const { instance } = useDataTableContext()

  const onValueChange = React.useCallback(
    (value: string) => {
      if (filter?.includes(value)) {
        const newValues = filter?.filter((v) => v !== value)
        instance.updateFilter({
          id,
          value: newValues,
        })
      } else {
        instance.updateFilter({
          id,
          value: [...(filter ?? []), value],
        })
      }
    },
    [instance, id, filter]
  )

  const { focusedIndex, setFocusedIndex } = useKeyboardNavigation(
    options,
    (index) => onValueChange(options[index].value)
  )

  const onListFocus = React.useCallback(() => {
    if (focusedIndex === -1) {
      setFocusedIndex(0)
    }
  }, [focusedIndex])

  return (
    <div
      className="flex flex-col p-1 outline-none"
      role="list"
      tabIndex={0}
      onFocus={onListFocus}
      autoFocus
    >
      {options.map((option, idx) => {
        const isSelected = !!filter?.includes(option.value)

        return (
          <OptionButton
            key={idx}
            index={idx}
            option={option}
            isSelected={isSelected}
            isFocused={focusedIndex === idx}
            onClick={() => onValueChange(option.value)}
            onMouseEvent={setFocusedIndex}
            icon={CheckMini}
          />
        )
      })}
    </div>
  )
}

type DataTableFilterRadioContentProps = {
  id: string
  filter: unknown
  options: DataTableFilterOption<string>[]
}

const DataTableFilterRadioContent = ({
  id,
  filter,
  options,
}: DataTableFilterRadioContentProps) => {
  const { instance } = useDataTableContext()

  const onValueChange = React.useCallback(
    (value: string) => {
      instance.updateFilter({ id, value })
    },
    [instance, id]
  )

  const { focusedIndex, setFocusedIndex } = useKeyboardNavigation(
    options,
    (index) => onValueChange(options[index].value)
  )

  const onListFocus = React.useCallback(() => {
    if (focusedIndex === -1) {
      setFocusedIndex(0)
    }
  }, [focusedIndex])

  return (
    <div
      className="flex flex-col p-1 outline-none"
      role="list"
      tabIndex={0}
      onFocus={onListFocus}
      autoFocus
    >
      {options.map((option, idx) => {
        const isSelected = filter === option.value

        return (
          <OptionButton
            key={idx}
            index={idx}
            option={option}
            isSelected={isSelected}
            isFocused={focusedIndex === idx}
            onClick={() => onValueChange(option.value)}
            onMouseEvent={setFocusedIndex}
            icon={EllipseMiniSolid}
          />
        )
      })}
    </div>
  )
}

function isDateFilterProps(props?: unknown | null): props is DataTableDateFilterProps {
  if (!props) {
    return false
  }

  return (props as DataTableDateFilterProps).type === "date"
}

type OptionButtonProps = {
  index: number
  option: DataTableFilterOption<string | DataTableDateComparisonOperator>
  isSelected: boolean
  isFocused: boolean
  onClick: () => void
  onMouseEvent: (idx: number) => void
  icon: React.ElementType
}

const OptionButton = React.memo(
  ({
    index,
    option,
    isSelected,
    isFocused,
    onClick,
    onMouseEvent,
    icon: Icon,
  }: OptionButtonProps) => (
    <button
      type="button"
      role="listitem"
      className={clx(
        "bg-ui-bg-component txt-compact-small transition-fg flex items-center gap-2 rounded px-2 py-1 outline-none",
        { "bg-ui-bg-component-hover": isFocused }
      )}
      onClick={onClick}
      onMouseEnter={() => onMouseEvent(index)}
      onMouseLeave={() => onMouseEvent(-1)}
      tabIndex={-1}
    >
      <div className="flex size-[15px] items-center justify-center">
        {isSelected && <Icon />}
      </div>
      <span>{option.label}</span>
    </button>
  )
)

function useKeyboardNavigation(
  options: unknown[],
  onSelect: (index: number) => void,
  extraItems: number = 0
) {
  const [focusedIndex, setFocusedIndex] = React.useState(-1)

  const onKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      const totalLength = options.length + extraItems

      if ((document.activeElement as HTMLElement).contentEditable === "true") {
        return
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusedIndex((prev) => (prev < totalLength - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case " ":
        case "Enter":
          e.preventDefault()
          if (focusedIndex >= 0) {
            onSelect(focusedIndex)
          }
          break
      }
    },
    [options.length, extraItems, focusedIndex, onSelect]
  )

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [onKeyDown])

  return { focusedIndex, setFocusedIndex }
}

export { DataTableFilter }
export type { DataTableFilterProps }

