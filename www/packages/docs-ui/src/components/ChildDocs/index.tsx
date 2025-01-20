"use client"

import React from "react"
import { useChildDocs, UseChildDocsProps } from "../.."

export const ChildDocs = (props: UseChildDocsProps) => {
  const { component } = useChildDocs(props)

  return <>{component}</>
}
