"use client"

import {
  Feedback as UiFeedback,
  FeedbackProps as UiFeedbackProps,
} from "docs-ui"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { basePathUrl } from "../../utils/base-path-url"

type FeedbackProps = Omit<UiFeedbackProps, "event" | "pathName">

export const Feedback = (props: FeedbackProps) => {
  const pathname = usePathname()

  const feedbackPathname = useMemo(() => basePathUrl(pathname), [pathname])

  return (
    <UiFeedback
      event="survey"
      pathName={feedbackPathname}
      question="Was this page helpful?"
      {...props}
    />
  )
}
