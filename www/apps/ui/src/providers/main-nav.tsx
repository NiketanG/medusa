"use client"

import {
  getNavDropdownItems,
  MainNavProvider as UiMainNavProvider,
} from "docs-ui"
import { useMemo } from "react"
import { siteConfig } from "../config/site"

type MainNavProviderProps = {
  children?: React.ReactNode
}

export const MainNavProvider = ({ children }: MainNavProviderProps) => {
  const navigationDropdownItems = useMemo(
    () =>
      getNavDropdownItems({
        basePath: siteConfig.baseUrl,
      }),
    []
  )

  return (
    <UiMainNavProvider navItems={navigationDropdownItems}>
      {children}
    </UiMainNavProvider>
  )
}
