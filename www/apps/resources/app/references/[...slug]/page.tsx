import { MDXRemote } from "next-mdx-remote/rsc"
import path from "path"
import { promises as fs } from "fs"
import { notFound } from "next/navigation"
import {
  typeListLinkFixerPlugin,
  localLinksRehypePlugin,
  workflowDiagramLinkFixerPlugin,
  prerequisitesLinkFixerPlugin,
} from "remark-rehype-plugins"
import MDXComponents from "@/components/MDXComponents"
import mdxOptions from "../../../mdx-options.mjs"
import { slugChanges } from "../../../generated/slug-changes.mjs"
import { filesMap } from "../../../generated/files-map.mjs"
import { Metadata } from "next"
import { cache } from "react"

type PageProps = {
  params: Promise<{
    slug: string[]
  }>
}

export default async function ReferencesPage(props: PageProps) {
  const params = await props.params
  const { slug } = params

  const fileData = await loadFile(slug)

  if (!fileData) {
    return notFound()
  }

  const pluginOptions = {
    filePath: fileData.path,
    basePath: process.cwd(),
  }

  return (
    <MDXRemote
      source={fileData.content}
      components={MDXComponents}
      options={{
        mdxOptions: {
          rehypePlugins: [
            ...mdxOptions.options.rehypePlugins,
            [
              typeListLinkFixerPlugin,
              {
                ...pluginOptions,
                checkLinksType: "md",
              },
            ],
            [
              workflowDiagramLinkFixerPlugin,
              {
                ...pluginOptions,
                checkLinksType: "value",
              },
            ],
            [
              prerequisitesLinkFixerPlugin,
              {
                ...pluginOptions,
                checkLinksType: "value",
              },
            ],
            [localLinksRehypePlugin, pluginOptions],
          ],
          remarkPlugins: mdxOptions.options.remarkPlugins,
        },
      }}
    />
  )
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // read route params
  const slug = (await params).slug
  const metadata: Metadata = {}

  const fileData = await loadFile(slug)

  if (!fileData) {
    return metadata
  }

  const pageTitleMatch = /#(?<title>[\w -]+)/.exec(fileData.content)

  if (!pageTitleMatch?.groups?.title) {
    return metadata
  }

  metadata.title = pageTitleMatch.groups.title

  return metadata
}

const loadFile = cache(
  async (
    slug: string[]
  ): Promise<
    | {
        content: string
        path: string
      }
    | undefined
  > => {
    path.join(process.cwd(), "references")
    const monoRepoPath = path.resolve("..", "..", "..")

    const pathname = `/references/${slug.join("/")}`
    const fileDetails =
      slugChanges.find((f) => f.newSlug === pathname) ||
      filesMap.find((f) => f.pathname === pathname)
    if (!fileDetails) {
      return undefined
    }
    const fullPath = path.join(monoRepoPath, fileDetails.filePath)
    return {
      content: await fs.readFile(fullPath, "utf-8"),
      path: fullPath,
    }
  }
)
