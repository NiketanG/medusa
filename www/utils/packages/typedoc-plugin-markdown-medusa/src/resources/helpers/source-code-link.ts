import Handlebars from "handlebars"
import { SignatureReflection } from "typedoc"

export default function () {
  Handlebars.registerHelper(
    "sourceCodeLink",
    function (this: SignatureReflection): string {
      const source = this.parent.sources?.[0]

      if (!source?.url) {
        return ""
      }

      return `<SourceCodeLink link="${source.url}" />`
    }
  )
}
