import { existsSync, readdirSync, readFileSync } from "fs"
import path from "path"
import type { Transformer } from "unified"
import type {
  BrokenLinkCheckerOptions,
  UnistNode,
  UnistNodeWithData,
  UnistTree,
} from "./types/index.js"
import type { VFile } from "vfile"
import { parseCrossProjectLink } from "./utils/cross-project-link-utils.js"
import { SlugChange } from "types"
import getAttribute from "./utils/get-attribute.js"
import { estreeToJs } from "./utils/estree-to-js.js"
import { performActionOnLiteral } from "./utils/perform-action-on-literal.js"
import { MD_LINK_REGEX } from "./constants.js"

function getErrorMessage({
  link,
  file,
}: {
  link: string
  file: VFile
}): string {
  return `Broken link found! ${link} linked in ${file.history[0]}`
}

function checkLocalLinkExists({
  link,
  file,
  currentPageFilePath,
}: {
  link: string
  file: VFile
  currentPageFilePath: string
}) {
  // get absolute path of the URL
  const linkedFilePath = path
    .resolve(currentPageFilePath, link)
    .replace(/#.*$/, "")
  // check if the file exists
  if (!existsSync(linkedFilePath)) {
    throw new Error(
      getErrorMessage({
        link,
        file,
      })
    )
  }
}

function mdxPageExists(pagePath: string): boolean {
  if (!existsSync(pagePath)) {
    // for projects that use a convention other than mdx
    // check if an mdx file exists with the same name
    if (existsSync(`${pagePath}.mdx`)) {
      return true
    }
    return false
  }

  if (existsSync(path.join(pagePath, "page.mdx"))) {
    return true
  }

  // for projects that use a convention other than mdx
  // check if an mdx file exists with the same name
  return readdirSync(pagePath).some((fileName) => fileName.endsWith(".mdx"))
}

function componentChecker({
  node,
  ...rest
}: {
  node: UnistNodeWithData
  file: VFile
  currentPageFilePath: string
  options: BrokenLinkCheckerOptions
}) {
  if (!node.name) {
    return
  }

  let attributeName: string | undefined

  const maybeCheckAttribute = () => {
    if (!attributeName) {
      return
    }

    const attribute = getAttribute(node, attributeName)

    if (!attribute) {
      return
    }

    if (typeof attribute.value === "string") {
      checkLink({
        link: attribute.value,
        ...rest,
      })
      return
    }

    if (!attribute.value.data?.estree) {
      return
    }

    const itemJsVar = estreeToJs(attribute.value.data.estree)

    if (!itemJsVar) {
      return
    }

    performActionOnLiteral(itemJsVar, (item) => {
      checkLink({
        link: item.original.value as string,
        ...rest,
      })
    })
  }

  switch (node.name) {
    case "Prerequisites":
    case "CardList":
      attributeName = "items"
      break
    case "Card":
      attributeName = "href"
      break
    case "WorkflowDiagram":
      attributeName = "workflow"
      break
    case "TypeList":
      attributeName = "types"
      break
  }

  maybeCheckAttribute()
}

function checkLink({
  link,
  file,
  currentPageFilePath,
  options,
}: {
  link: unknown | undefined
  file: VFile
  currentPageFilePath: string
  options: BrokenLinkCheckerOptions
}) {
  if (!link || typeof link !== "string") {
    return
  }
  // try to remove hash
  const hashIndex = link.lastIndexOf("#")
  const likeWithoutHash = hashIndex !== -1 ? link.substring(0, hashIndex) : link
  if (likeWithoutHash.match(/page\.mdx?$/)) {
    checkLocalLinkExists({
      link: likeWithoutHash,
      file,
      currentPageFilePath,
    })
    return
  }

  const parsedLink = parseCrossProjectLink(likeWithoutHash)

  if (!parsedLink || !Object.hasOwn(options.crossProjects, parsedLink.area)) {
    if (MD_LINK_REGEX.test(link)) {
      // try fixing MDX links
      let linkMatches
      let tempLink = link
      MD_LINK_REGEX.lastIndex = 0

      while ((linkMatches = MD_LINK_REGEX.exec(tempLink)) !== null) {
        if (!linkMatches.groups?.link) {
          return
        }

        checkLink({
          link: linkMatches.groups.link,
          file,
          currentPageFilePath,
          options,
        })

        tempLink = tempLink.replace(linkMatches.groups.link, "")
        // reset regex
        MD_LINK_REGEX.lastIndex = 0
      }
    }
    return
  }

  const projectOptions = options.crossProjects[parsedLink.area]

  const isReferenceLink = parsedLink.path.startsWith("/references")
  const baseDir = isReferenceLink
    ? "references"
    : projectOptions.contentPath || "app"
  const pagePath = isReferenceLink
    ? parsedLink.path.replace(/^\/references/, "")
    : parsedLink.path
  // check if the file exists
  if (mdxPageExists(path.join(projectOptions.projectPath, baseDir, pagePath))) {
    return
  }

  // file doesn't exist, check if slugs are enabled and generated
  const generatedSlugsPath = path.join(
    projectOptions.projectPath,
    "generated",
    "slug-changes.mjs"
  )
  if (!projectOptions.hasGeneratedSlugs || !existsSync(generatedSlugsPath)) {
    throw new Error(
      getErrorMessage({
        link,
        file,
      })
    )
  }

  // get slugs from file
  const generatedSlugContent = readFileSync(generatedSlugsPath, "utf-8")
  const slugChanges: SlugChange[] = JSON.parse(
    generatedSlugContent.substring(generatedSlugContent.indexOf("["))
  )
  const slugChange = slugChanges.find(
    (change) => change.newSlug === parsedLink.path
  )

  if (
    !slugChange ||
    !mdxPageExists(path.join(projectOptions.projectPath, slugChange.origSlug))
  ) {
    throw new Error(
      getErrorMessage({
        link,
        file,
      })
    )
  }
}

const allowedComponentNames = [
  "Card",
  "CardList",
  "Prerequisites",
  "WorkflowDiagram",
  "TypeList",
]

export function brokenLinkCheckerPlugin(
  options: BrokenLinkCheckerOptions
): Transformer {
  return async (tree, file) => {
    const { visit } = await import("unist-util-visit")

    const currentPageFilePath = file.history[0].replace(
      `/${path.basename(file.history[0])}`,
      ""
    )

    visit(
      tree as UnistTree,
      ["element", "mdxJsxFlowElement"],
      (node: UnistNode) => {
        if (node.tagName === "a" && node.properties?.href) {
          checkLink({
            link: node.properties.href,
            file,
            currentPageFilePath,
            options,
          })
        } else if (node.name && allowedComponentNames.includes(node.name)) {
          componentChecker({
            node: node as UnistNodeWithData,
            file,
            currentPageFilePath,
            options,
          })
        }
      }
    )
  }
}
