import { getFrontMatter, findPageTitle } from "docs-utils"
import { ItemsToAdd, sidebarAttachHrefCommonOptions } from "../index.js"
import { InteractiveSidebarItem } from "types"

export async function getSidebarItemLink({
  filePath,
  basePath,
  fileBasename,
}: {
  filePath: string
  basePath: string
  fileBasename: string
}): Promise<ItemsToAdd | undefined> {
  const frontmatter = await getFrontMatter(filePath)
  if (frontmatter.sidebar_autogenerate_exclude) {
    return
  }

  const newItem = sidebarAttachHrefCommonOptions([
    {
      type: "link",
      path:
        frontmatter.slug ||
        filePath.replace(basePath, "").replace(`/${fileBasename}`, ""),
      title: frontmatter.sidebar_label || findPageTitle(filePath) || "",
      description: frontmatter.sidebar_description || "",
    },
  ])[0] as InteractiveSidebarItem

  return {
    ...newItem,
    sidebar_position: frontmatter.sidebar_position,
  }
}
