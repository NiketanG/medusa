import Handlebars from "handlebars"
import { MarkdownTheme } from "../../theme.js"
import { stringify } from "yaml"
import { replaceTemplateVariables } from "../../utils/reflection-template-strings.js"
import { Reflection } from "typedoc"
import { FrontmatterData } from "types"
import { getTagComments, getTagsAsArray, getUniqueStrArray } from "utils"

export default function (theme: MarkdownTheme) {
  Handlebars.registerHelper("frontmatter", function (this: Reflection) {
    const { frontmatterData } = theme.getFormattingOptionsForLocation()

    if (!frontmatterData) {
      return ""
    }

    // format frontmatter data in case it has any template variables
    const resolvedFrontmatter = resolveFrontmatterVariables(
      frontmatterData,
      this
    )

    // check if reflection has an `@tags` tag
    const tagsComment = getTagComments(this)
    if (tagsComment?.length && !("tags" in resolvedFrontmatter)) {
      resolvedFrontmatter["tags"] = []
    }
    tagsComment?.forEach((tag) => {
      const tagContent = getTagsAsArray(tag)
      resolvedFrontmatter["tags"]?.push(...tagContent)
    })
    if (resolvedFrontmatter["tags"]?.length) {
      resolvedFrontmatter["tags"] = getUniqueStrArray(
        resolvedFrontmatter["tags"]
      )
    }

    return `---\n${stringify(resolvedFrontmatter).trim()}\n---\n\n`
  })
}

function resolveFrontmatterVariables(
  frontmatterData: FrontmatterData,
  reflection: Reflection
): FrontmatterData {
  const tempFrontmatterData: FrontmatterData = JSON.parse(
    JSON.stringify(frontmatterData)
  )
  Object.keys(tempFrontmatterData).forEach((key) => {
    const value = tempFrontmatterData[key]
    if (!value || typeof value !== "string") {
      return
    }

    tempFrontmatterData[key] = replaceTemplateVariables(reflection, value)
  })

  return tempFrontmatterData
}
