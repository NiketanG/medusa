"use client"

import {
  getNavDropdownItems,
  MainNavProvider as UiMainNavProvider,
} from "docs-ui"
import { useMemo } from "react"
import { config } from "../config"
import { usePathname } from "next/navigation"
import { generatedEditDates } from "../generated/edit-dates.mjs"

type MainNavProviderProps = {
  children?: React.ReactNode
}

export const MainNavProvider = ({ children }: MainNavProviderProps) => {
  const pathname = usePathname()
  const navigationDropdownItems = useMemo(
    () =>
      getNavDropdownItems({
        basePath: config.baseUrl,
      }),
    []
  )

  const editDate = useMemo(
    () =>
      (generatedEditDates as Record<string, string>)[
        `app${pathname.replace(/\/$/, "")}/page.mdx`
      ],
    [pathname]
  )

  return (
    <UiMainNavProvider navItems={navigationDropdownItems} editDate={editDate}>
      {children}
    </UiMainNavProvider>
  )
}
