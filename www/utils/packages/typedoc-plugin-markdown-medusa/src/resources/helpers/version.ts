import Handlebars from "handlebars"
import { Reflection } from "typedoc"

export default function () {
  Handlebars.registerHelper("version", function (reflection: Reflection) {
    const versionTag = reflection.comment?.blockTags.find(
      (tag) => tag.tag === "@version"
    )

    if (!versionTag) {
      return ""
    }

    const tagContent = versionTag.content
      .map((content) => content.text)
      .join("")

    return `:::note\n\nThis is only available after Medusa \`v${tagContent}\`.\n\n:::`
  })
}
