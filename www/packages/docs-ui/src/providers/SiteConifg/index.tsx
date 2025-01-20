"use client"

import React, { createContext, useContext, useState } from "react"
import { DocsConfig } from "types"
import { globalConfig } from "../../global-config"
import { GITHUB_ISSUES_LINK } from "../.."

export type SiteConfigContextType = {
  config: DocsConfig
  setConfig: React.Dispatch<React.SetStateAction<DocsConfig>>
}

const SiteConfigContext = createContext<SiteConfigContextType | null>(null)

export type SiteConfigProviderProps = {
  config?: DocsConfig
  children?: React.ReactNode
}

export const SiteConfigProvider = ({
  config: initConfig,
  children,
}: SiteConfigProviderProps) => {
  const [config, setConfig] = useState<DocsConfig>(
    Object.assign(
      {
        baseUrl: "",
        sidebar: {
          default: [],
          mobile: [],
        },
        project: {
          title: "",
          key: "",
        },
        breadcrumbOptions: {
          showCategories: true,
        },
        reportIssueLink: GITHUB_ISSUES_LINK,
        logo: "",
      },
      globalConfig,
      initConfig || {}
    )
  )

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        setConfig,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  )
}

export const useSiteConfig = (): SiteConfigContextType => {
  const context = useContext(SiteConfigContext)

  if (!context) {
    throw new Error("useSiteConfig must be used inside a SiteConfigProvider")
  }

  return context
}
