import { statSync, readdirSync } from "fs"
import path from "path"
import { getFileSlug } from "docs-utils"

const monoRepoPath = path.resolve("..", "..", "..")

/**
 *
 * @param {string} dir - The directory to search in
 * @returns {Promise<import("types").SlugChange[]>}
 */
export default async function getSlugs(options = {}) {
  let { dir, basePath = path.resolve("app"), baseSlug = basePath } = options
  if (!dir) {
    dir = basePath
  }
  /**
   * @type {import("types").SlugChange[]}
   */
  const slugs = []

  // ignore general reference files
  if (dir.endsWith("/references/medusa") || dir.endsWith("/references/types")) {
    return slugs
  }
  const files = readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const fileBasename = path.basename(file)
    if (fileBasename !== "page.mdx") {
      const fileStat = statSync(filePath)
      if (fileStat.isDirectory()) {
        slugs.push(
          ...(await getSlugs({
            dir: filePath,
            basePath,
            baseSlug,
          }))
        )
      }
      continue
    }

    const newSlug = await getFileSlug(filePath)

    if (newSlug) {
      slugs.push({
        origSlug: filePath
          .replace(baseSlug, "")
          .replace(fileBasename, "")
          .replace(/\/$/, ""),
        newSlug,
        filePath: filePath.replace(monoRepoPath, ""),
      })
    }
  }

  return slugs
}
