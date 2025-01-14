"use client"

import { CheckMini, MinusMini } from "@medusajs/icons"
import * as Primitives from "@radix-ui/react-checkbox"
import * as React from "react"

import { clx } from "@/utils/clx"

/**
 * This component is based on the [Radix UI Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox) primitive.
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof Primitives.Root>,
  React.ComponentPropsWithoutRef<typeof Primitives.Root>
>(({ className, checked, ...props }, ref) => {
  return (
    <Primitives.Root
      {...props}
      ref={ref}
      checked={checked}
      className={clx(
        "group relative inline-flex h-5 w-5 items-center justify-center outline-none ",
        className
      )}
    >
      <div
        className={clx(
          "text-ui-fg-on-inverted bg-ui-bg-base shadow-borders-base [&_path]:shadow-details-contrast-on-bg-interactive transition-fg h-[14px] w-[14px] rounded-[3px]",
          "group-disabled:cursor-not-allowed group-disabled:opacity-50",
          "group-focus-visible:!shadow-borders-interactive-with-focus",
          "group-hover:group-enabled:group-data-[state=unchecked]:bg-ui-bg-base-hover",
          "group-data-[state=checked]:bg-ui-bg-interactive group-data-[state=checked]:shadow-borders-interactive-with-shadow",
          "group-data-[state=indeterminate]:bg-ui-bg-interactive group-data-[state=indeterminate]:shadow-borders-interactive-with-shadow"
        )}
      >
        <Primitives.Indicator className="absolute inset-0 flex items-center justify-center">
          {checked === "indeterminate" ? <MinusMini /> : <CheckMini />}
        </Primitives.Indicator>
      </div>
    </Primitives.Root>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
