"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Card,
  CardList,
  getLocalSearch,
  H2,
  H3,
  H4,
  Hr,
  isSidebarItemLink,
  LocalSearch,
  MarkdownContent,
  SearchInput,
  useIsBrowser,
  useSidebar,
} from "../.."
import { InteractiveSidebarItem, SidebarItem, SidebarItemLink } from "types"
import slugify from "slugify"
import { MDXComponents } from "../.."
import { ChevronDoubleRight, ExclamationCircle } from "@medusajs/icons"

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
  search?: {
    enable: boolean
    storageKey?: string
    placeholder?: string
  }
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
  search: {
    enable: enableSearch = false,
    storageKey = "child-docs",
    ...searchProps
  } = { enable: false },
}: UseChildDocsProps) => {
  const { currentItems, activeItem } = useSidebar()
  const { isBrowser } = useIsBrowser()
  const [searchQuery, setSearchQuery] = useState("")
  const [localSearch, setLocalSearch] = useState<
    LocalSearch<SidebarItemLink> | undefined
  >()
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

  const filterItems = (items: SidebarItem[]): InteractiveSidebarItem[] => {
    return (items.filter(filterCondition) as InteractiveSidebarItem[])
      .map((item) => Object.assign({}, item))
      .map((item) => {
        if (item.children && filterType === "hide") {
          item.children = filterItems(item.children)
        }

        return item
      })
  }

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

  const filteredItems = useMemo(() => {
    let targetItems =
      type === "sidebar"
        ? currentItems
          ? Object.assign({}, currentItems)
          : undefined
        : {
            default: [...(activeItem?.children || [])],
          }
    if (filterType !== "all" && targetItems) {
      targetItems = {
        ...targetItems,
        default: filterItems(targetItems.default),
      }
    }

    return targetItems
      ? {
          ...targetItems,
          default: filterNonInteractiveItems(targetItems?.default),
        }
      : undefined
  }, [currentItems, type, activeItem, filterType])

  const searchableItems = useMemo(() => {
    const searchableItems: SidebarItemLink[] = []
    if (!enableSearch) {
      return searchableItems
    }
    if (onlyTopLevel) {
      filteredItems?.default?.forEach((item) => {
        if (isSidebarItemLink(item)) {
          searchableItems.push(item)
        } else {
          const firstChild = item.children?.find((child) =>
            isSidebarItemLink(child)
          )
          if (firstChild) {
            searchableItems.push(firstChild as SidebarItemLink)
          }
        }
      })
    } else {
      filteredItems?.default?.forEach((item) => {
        const childItems: SidebarItemLink[] =
          (getChildrenForLevel(item)?.filter((childItem) => {
            return isSidebarItemLink(childItem)
          }) as SidebarItemLink[]) || []
        searchableItems.push(...childItems)
      })
    }

    return searchableItems
  }, [filteredItems, onlyTopLevel, enableSearch])

  useEffect(() => {
    if (!enableSearch && localSearch) {
      setLocalSearch(undefined)
      return
    }
    if (!enableSearch || !searchableItems?.length || localSearch) {
      return
    }

    setLocalSearch(
      getLocalSearch<SidebarItemLink>({
        docs: searchableItems,
        searchableFields: ["title", "description"],
        options: {
          storeFields: ["title", "description", "path", "type"],
          searchOptions: {
            boost: { title: 2 },
            prefix: true,
            fuzzy: 0.2,
          },
          idField: "path",
        },
      })
    )
  }, [searchableItems, enableSearch, localSearch])

  const searchResult = useMemo(() => {
    return localSearch?.search(searchQuery) || []
  }, [localSearch, searchQuery])

  useEffect(() => {
    if (!isBrowser || !enableSearch) {
      return
    }

    const storedQuery = localStorage.getItem(`${storageKey}-query`)
    if (storedQuery) {
      setSearchQuery(storedQuery)
    }
  }, [isBrowser, storageKey, enableSearch])

  useEffect(() => {
    if (!isBrowser || !enableSearch) {
      return
    }

    localStorage.setItem(`${storageKey}-query`, searchQuery)
  }, [isBrowser, searchQuery, storageKey, enableSearch])

  const getTopLevelElms = (items?: InteractiveSidebarItem[]) => {
    return (
      <CardList
        items={
          items?.map((childItem) => {
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
    items?: InteractiveSidebarItem[],
    headerLevel = titleLevel
  ) => {
    return items?.map((item, key) => {
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
              {key !== items.length - 1 && headerLevel === 2 && <Hr />}
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

  const getSearchResultElms = () => {
    const Heading = TitleHeaderComponent(titleLevel)
    return (
      <>
        <Heading>Search Results</Heading>
        {searchResult.length > 0 && (
          <CardList
            items={searchResult.map((item) => ({
              title: item.title,
              href: item.path,
              text: item.description,
              rightIcon: item.type === "ref" ? ChevronDoubleRight : undefined,
              highlightText: item.terms,
            }))}
            itemsPerRow={itemsPerRow}
            defaultItemsPerRow={defaultItemsPerRow}
            className="my-docs_2"
          />
        )}
        {!searchResult.length && (
          <div className="flex flex-col justify-center items-center gap-docs_0.75">
            <ExclamationCircle className="text-medusa-fg-subtle" />
            <span className="text-compact-small-plus text-medusa-fg-subtle text-center">
              No results found matching your query.
            </span>
            <span className="text-compact-small text-medusa-fg-muted text-center">
              Try searching with another term or clearing the search.
            </span>
          </div>
        )}
      </>
    )
  }

  const getElms = () => {
    return (
      <>
        {enableSearch && (
          <SearchInput
            value={searchQuery || ""}
            onChange={setSearchQuery}
            {...searchProps}
          />
        )}
        {searchQuery && getSearchResultElms()}
        {!searchQuery && (
          <>
            {onlyTopLevel
              ? getTopLevelElms(filteredItems?.default)
              : getAllLevelsElms(filteredItems?.default)}
          </>
        )}
      </>
    )
  }

  return {
    items: filteredItems,
    component: getElms(),
  }
}
