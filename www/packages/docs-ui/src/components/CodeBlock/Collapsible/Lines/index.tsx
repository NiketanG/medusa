import React from "react"
import { CollapsibleReturn } from "../../../../hooks"

export type CodeBlockCollapsibleLinesProps = {
  children: React.ReactNode
  type: "start" | "end"
} & Omit<CollapsibleReturn, "setCollapsed">

export const CodeBlockCollapsibleLines = ({
  children,
  type,
  collapsed,
}: CodeBlockCollapsibleLinesProps) => {
  const isStart = type === "start"
  return (
    <>
      {collapsed && Array.isArray(children)
        ? children.slice(isStart ? -2 : 0, isStart ? undefined : 2)
        : children}
    </>
  )
}
