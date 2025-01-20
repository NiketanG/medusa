import { normalizePath, VALID_FILE_EXTENSIONS } from "../utils"

export function getRoute(file: string): string {
  const importPath = normalizePath(file)
  return importPath
    .replace(/.*\/admin\/(routes)/, "")
    .replace(/\[([^\]]+)\]/g, ":$1")
    .replace(
      new RegExp(
        `/page\\.(${VALID_FILE_EXTENSIONS.map((ext) => ext.slice(1)).join(
          "|"
        )})$`
      ),
      ""
    )
}
