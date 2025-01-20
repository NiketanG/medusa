import { clx } from "@/utils/clx"
import * as React from "react"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clx("bg-ui-bg-component animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
