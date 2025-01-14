"use client"

import React, { useCallback, useMemo } from "react"
import {
  Card,
  CardList,
  H2,
  H3,
  H4,
  Hr,
  isSidebarItemLink,
  MarkdownContent,
  useSidebar,
} from "../.."
import { InteractiveSidebarItem, SidebarItem, SidebarItemLink } from "types"
import slugify from "slugify"
import { MDXComponents } from "../.."
import { ChevronDoubleRight } from "@medusajs/icons"

type HeadingComponent = (
  props: React.HTMLAttributes<HTMLHeadingElement>
) => React.JSX.Element

export type UseChildDocsProps = {
  onlyTopLevel?: boolean
  type?: "sidebar" | "item"
  hideItems?: string[]
  showItems?: string[]
  hideTitle?: boolean
  hideDescription?: boolean
  titleLevel?: number
  childLevel?: number
  itemsPerRow?: number
  defaultItemsPerRow?: number
}

export const useChildDocs = ({
  onlyTopLevel = false,
  hideItems = [],
  showItems,
  type = "sidebar",
  hideTitle = false,
  hideDescription = false,
  titleLevel = 2,
  childLevel = 1,
  itemsPerRow,
  defaultItemsPerRow,
}: UseChildDocsProps) => {
  const { currentItems, activeItem } = useSidebar()
  const TitleHeaderComponent = useCallback(
    (level: number): HeadingComponent => {
      switch (level) {
        case 3:
          return H3
        case 4:
          return H4
        case 5:
          return MDXComponents["h5"] as HeadingComponent
        case 6:
          return MDXComponents["h6"] as HeadingComponent
        default:
          return H2
      }
    },
    []
  )
  const filterType = useMemo(() => {
    return showItems !== undefined
      ? "show"
      : hideItems.length > 0
        ? "hide"
        : "all"
  }, [showItems, hideItems])

  const filterCondition = (item: SidebarItem): boolean => {
    if (item.type === "separator") {
      return false
    }
    switch (filterType) {
      case "hide":
        return (
          (!isSidebarItemLink(item) || !hideItems.includes(item.path)) &&
          !hideItems.includes(item.title)
        )
      case "show":
        return (
          (isSidebarItemLink(item) && showItems!.includes(item.path)) ||
          showItems!.includes(item.title)
        )
      case "all":
        return true
    }
  }

  const filterItems = (items: SidebarItem[]): SidebarItem[] => {
    return items
      .filter(filterCondition)
      .map((item) => Object.assign({}, item))
      .map((item) => {
        if (
          item.type !== "separator" &&
          item.children &&
          filterType === "hide"
        ) {
          item.children = filterItems(item.children)
        }

        return item
      })
  }

  const filteredItems = useMemo(() => {
    const targetItems =
      type === "sidebar"
        ? currentItems
          ? Object.assign({}, currentItems)
          : undefined
        : {
            default: [...(activeItem?.children || [])],
          }
    if (filterType === "all" || !targetItems) {
      return targetItems
    }

    return {
      ...targetItems,
      default: filterItems(targetItems.default),
    }
  }, [currentItems, type, activeItem, filterItems])

  const filterNonInteractiveItems = (
    items: SidebarItem[] | undefined
  ): InteractiveSidebarItem[] => {
    return (
      (items?.filter(
        (item) => item.type !== "separator"
      ) as InteractiveSidebarItem[]) || []
    )
  }

  const getChildrenForLevel = (
    item: InteractiveSidebarItem,
    currentLevel = 1
  ): InteractiveSidebarItem[] | undefined => {
    if (currentLevel === childLevel) {
      return filterNonInteractiveItems(item.children)
    }
    if (!item.children) {
      return
    }

    const childrenResult: InteractiveSidebarItem[] = []

    filterNonInteractiveItems(item.children).forEach((child) => {
      const childChildren = getChildrenForLevel(child, currentLevel + 1)

      if (!childChildren) {
        return
      }

      childrenResult.push(...childChildren)
    })

    return childrenResult
  }

  const getTopLevelElms = (items?: SidebarItem[]) => {
    return (
      <CardList
        items={
          filterNonInteractiveItems(items).map((childItem) => {
            const href = isSidebarItemLink(childItem)
              ? childItem.path
              : childItem.children?.length
                ? (
                    childItem.children.find((item) =>
                      isSidebarItemLink(item)
                    ) as SidebarItemLink
                  )?.path
                : "#"
            return {
              title: childItem.title,
              href,
              rightIcon:
                childItem.type === "ref" ? ChevronDoubleRight : undefined,
            }
          }) || []
        }
        itemsPerRow={itemsPerRow}
        defaultItemsPerRow={defaultItemsPerRow}
      />
    )
  }

  const getAllLevelsElms = (
    items?: SidebarItem[],
    headerLevel = titleLevel
  ) => {
    const filteredItems = filterNonInteractiveItems(items)
    return filteredItems.map((item, key) => {
      const itemChildren = getChildrenForLevel(item)
      const HeadingComponent = itemChildren?.length
        ? TitleHeaderComponent(headerLevel)
        : undefined
      const isChildrenCategory = itemChildren?.every(
        (child) => child.type === "category" || child.type === "sub-category"
      )

      return (
        <React.Fragment key={key}>
          {HeadingComponent && (
            <>
              {!hideTitle && (
                <>
                  <HeadingComponent id={slugify(item.title.toLowerCase())}>
                    {item.title}
                  </HeadingComponent>
                  {!hideDescription && item.description && (
                    <MarkdownContent
                      allowedElements={["a", "code", "ul", "ol", "p"]}
                    >
                      {item.description}
                    </MarkdownContent>
                  )}
                </>
              )}
              {isChildrenCategory &&
                getAllLevelsElms(itemChildren, headerLevel + 1)}
              {!isChildrenCategory && (
                <CardList
                  items={
                    itemChildren?.map((childItem) => ({
                      title: childItem.title,
                      href: isSidebarItemLink(childItem) ? childItem.path : "",
                      text: childItem.description,
                      rightIcon:
                        childItem.type === "ref"
                          ? ChevronDoubleRight
                          : undefined,
                    })) || []
                  }
                  itemsPerRow={itemsPerRow}
                  defaultItemsPerRow={defaultItemsPerRow}
                />
              )}
              {key !== filteredItems.length - 1 && headerLevel === 2 && <Hr />}
            </>
          )}
          {!HeadingComponent && isSidebarItemLink(item) && (
            <Card
              title={item.title}
              href={item.path}
              text={item.description}
              rightIcon={item.type === "ref" ? ChevronDoubleRight : undefined}
            />
          )}
        </React.Fragment>
      )
    })
  }

  const getElms = (items?: SidebarItem[]) => {
    return onlyTopLevel ? getTopLevelElms(items) : getAllLevelsElms(items)
  }

  return {
    items: filteredItems,
    component: getElms(filteredItems?.default),
  }
}
