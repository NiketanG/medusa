"use state"

import React, { useEffect, useState } from "react"
import { useIsBrowser, useSiteConfig } from "../../../providers"
import Link from "next/link"
import { Tooltip } from "../../Tooltip"
import clsx from "clsx"

const LOCAL_STORAGE_SUFFIX = "last-version"

export const MainNavVersion = () => {
  const {
    config: { version },
  } = useSiteConfig()
  const [showNewBadge, setShowNewBadge] = useState(false)
  const { isBrowser } = useIsBrowser()

  useEffect(() => {
    if (!isBrowser) {
      return
    }

    const storedVersion = localStorage.getItem(LOCAL_STORAGE_SUFFIX)
    if (storedVersion !== version.number) {
      setShowNewBadge(true)
    }
  }, [isBrowser])

  const afterHover = () => {
    if (!showNewBadge) {
      return
    }

    setShowNewBadge(false)
    localStorage.setItem(LOCAL_STORAGE_SUFFIX, version.number)
  }

  return (
    <>
      <Link
        href={version.releaseUrl}
        target="_blank"
        className={clsx(version.hide && "hidden")}
      >
        <Tooltip html="View the release notes<br/>on GitHub">
          <span
            className="relative text-compact-small-plus"
            onMouseOut={afterHover}
          >
            <span>v{version.number}</span>
            {showNewBadge && (
              <span
                className={clsx(
                  "bg-medusa-tag-blue-icon w-[10px] h-[10px]",
                  "absolute -top-docs_0.25 -right-docs_0.5",
                  "animate-pulse rounded-full"
                )}
              ></span>
            )}
          </span>
        </Tooltip>
      </Link>
      <span className={clsx("text-compact-small", version.hide && "hidden")}>
        &#183;
      </span>
    </>
  )
}
