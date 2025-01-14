import { matter } from "vfile-matter"
import { readSync } from "to-vfile"
import { FrontMatter } from "types"

export function getFileSlugSync(filePath: string): string | undefined {
  const content = readSync(filePath)

  matter(content)

  return ((content.data.matter as FrontMatter).slug as string) || undefined
}
