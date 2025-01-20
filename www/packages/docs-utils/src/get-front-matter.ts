import remarkFrontmatter from "remark-frontmatter"
import remarkParse from "remark-parse"
import remarkStringify from "remark-stringify"
import { unified } from "unified"
import { read, readSync } from "to-vfile"
import { matter } from "vfile-matter"
import { FrontMatter } from "types"

export async function getFrontMatter(filePath: string): Promise<FrontMatter> {
  return (
    await unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter, ["yaml"])
      .use(() => {
        return (tree, file) => {
          matter(file)
        }
      })
      .process(await read(filePath))
  ).data.matter as FrontMatter
}

export function getFrontMatterSync(filePath: string): FrontMatter {
  const content = readSync(filePath)

  matter(content)

  return content.data.matter as FrontMatter
}
