export enum SidebarItemSections {
  DEFAULT = "default",
  MOBILE = "mobile",
}

export type SidebarItemCommon = {
  title: string
  children?: SidebarItem[]
  isChildSidebar?: boolean
  hasTitleStyling?: boolean
  childSidebarTitle?: string
  loaded?: boolean
  additionalElms?: React.ReactNode
  chapterTitle?: string
  hideChildren?: boolean
  // can be used to hold any description relevant when showing cards, etc...
  description?: string
}

export type SidebarItemLink = SidebarItemCommon & {
  type: "link" | "ref"
  path: string
  isPathHref?: boolean
  linkProps?: React.AllHTMLAttributes<HTMLAnchorElement>
  childrenSameLevel?: boolean
}

export type SidebarItemCategory = SidebarItemCommon & {
  type: "category"
  onOpen?: () => void
  initialOpen?: boolean
  showLoadingIfEmpty?: boolean
}

export type SidebarItemSubCategory = SidebarItemCommon & {
  type: "sub-category"
  childrenSameLevel?: boolean
}

export type SidebarItemSeparator = {
  type: "separator"
}

export type InteractiveSidebarItem =
  | SidebarItemLink
  | SidebarItemCategory
  | SidebarItemSubCategory

export type SidebarItemLinkWithParent = SidebarItemLink & {
  parentItem?: InteractiveSidebarItem
}

export type SidebarItem = InteractiveSidebarItem | SidebarItemSeparator

export type SidebarSectionItems = {
  [k in SidebarItemSections]: SidebarItem[]
} & {
  parentItem?: InteractiveSidebarItem
}

export type RawSidebarItem = SidebarItem & {
  autogenerate_path?: string
  autogenerate_tags?: string
  autogenerate_as_ref?: boolean
  custom_autogenerate?: string
  number?: string
} & (
    | {
        type: "category" | "sub-category" | "link" | "ref"
        children?: RawSidebarItem[]
      }
    | {
        type: "separator"
      }
  )

export type PersistedSidebarCategoryState = {
  [k: string]: {
    [k: string]: boolean
  }
}
