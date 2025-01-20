import React from "react"
import { InlineCode } from "../../../InlineCode"
import { Text } from "@medusajs/ui"
import { Bolt, InformationCircle } from "@medusajs/icons"

export const WorkflowDiagramLegend = () => {
  return (
    <div className="flex gap-docs_0.5 mt-1">
      <div className="flex items-center gap-docs_0.5">
        <div className="flex size-[20px] items-center justify-center text-medusa-tag-orange-icon">
          <Bolt />
        </div>
        <Text
          size="xsmall"
          leading="compact"
          weight="plus"
          className="select-none"
        >
          Workflow Hook
        </Text>
      </div>
      <div className="flex items-center gap-docs_0.5">
        <div className="flex size-[20px] items-center justify-center text-medusa-tag-green-icon">
          <InformationCircle />
        </div>
        <Text
          size="xsmall"
          leading="compact"
          weight="plus"
          className="select-none"
        >
          Step conditioned by <InlineCode>when</InlineCode>
        </Text>
      </div>
    </div>
  )
}
