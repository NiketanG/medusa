"use client"

import {
  Feedback as UiFeedback,
  FeedbackProps as UiFeedbackProps,
} from "docs-ui"
import { usePathname } from "next/navigation"
import { basePathUrl } from "../../utils/base-path-url"
import { useMemo } from "react"

type FeedbackProps = Omit<UiFeedbackProps, "event" | "pathName">

const Feedback = (props: FeedbackProps) => {
  const pathname = usePathname()

  const feedbackPathname = useMemo(() => basePathUrl(pathname), [pathname])

  return (
    <UiFeedback
      event="survey"
      pathName={feedbackPathname}
      question={props.question || "Was this chapter helpful?"}
      {...props}
    />
  )
}

export default Feedback
