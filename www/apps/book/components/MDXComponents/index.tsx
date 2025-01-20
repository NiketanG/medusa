import type { MDXComponents as MDXComponentsType } from "mdx/types"
import { Link, MDXComponents as UiMdxComponents } from "docs-ui"
import Feedback from "../Feedback"

const MDXComponents: MDXComponentsType = {
  ...UiMdxComponents,
  a: Link,
  Feedback,
}

export default MDXComponents
