import React from "react"
import { Link } from "../Link"
import { Badge } from "../Badge"
import { Github } from "@medusajs/icons"
import clsx from "clsx"

type SourceCodeLinkProps = {
  link: string
  text?: string
  icon?: React.ReactNode
  className?: string
}

export const SourceCodeLink = ({
  link,
  text,
  icon,
  className,
}: SourceCodeLinkProps) => {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noreferrer"
      className={clsx("my-docs_0.5 align-middle inline-block", className)}
    >
      <Badge
        variant="neutral"
        className="inline-flex hover:bg-medusa-tag-neutral-bg-hover cursor-pointer"
        childrenWrapperClassName="inline-flex flex-row gap-[3px] items-center"
      >
        {icon || <Github />}
        <span>{text || "Source Code"}</span>
      </Badge>
    </Link>
  )
}
