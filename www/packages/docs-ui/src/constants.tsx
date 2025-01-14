import { OptionType } from "@/hooks"
import { NavigationItem } from "types"

export const GITHUB_ISSUES_LINK =
  "https://github.com/medusajs/medusa/issues/new/choose"

export const navDropdownItems: NavigationItem[] = [
  {
    type: "link",
    path: `/learn`,
    title: "Get Started",
    project: "book",
  },
  {
    type: "dropdown",
    title: "Product",
    children: [
      {
        type: "link",
        title: "Commerce Modules",
        link: "/resources/commerce-modules",
      },
      {
        type: "link",
        title: "Architectural Modules",
        link: "/resources/architectural-modules",
      },
    ],
  },
  {
    type: "dropdown",
    title: "Resources",
    children: [
      {
        type: "link",
        title: "Guides",
        link: "/resources",
        useAsFallback: true,
      },
      {
        type: "link",
        title: "Examples",
        link: "/resources/examples",
      },
      {
        type: "link",
        title: "Recipes",
        link: "/resources/recipes",
      },
      {
        type: "divider",
      },
      {
        type: "link",
        title: "Admin Components",
        link: "/resources/admin-components",
      },
      {
        type: "link",
        title: "Storefront Development",
        link: "/resources/storefront-development",
      },
      {
        type: "link",
        title: "UI Library",
        link: "/ui",
      },
    ],
  },
  {
    type: "dropdown",
    title: "Tools & SDKs",
    children: [
      {
        type: "link",
        title: "Medusa CLI",
        link: "/resources/medusa-cli",
      },
      {
        type: "link",
        title: "JS SDK",
        link: "/resources/js-sdk",
      },
      {
        type: "link",
        title: "Next.js Starter",
        link: "/resources/nextjs-starter",
      },
      {
        type: "link",
        title: "create-medusa-app",
        link: "/resources/create-medusa-app",
      },
      {
        type: "divider",
      },
      {
        type: "link",
        title: "Integrations",
        link: "/resources/integrations",
      },
    ],
  },
  {
    type: "dropdown",
    title: "Framework",
    children: [
      {
        type: "link",
        title: "Modules",
        link: "/learn/fundamentals/modules",
      },
      {
        type: "link",
        title: "API Routes",
        link: "/learn/fundamentals/api-routes",
      },
      {
        type: "link",
        title: "Workflows",
        link: "/learn/fundamentals/workflows",
      },
      {
        type: "link",
        title: "Data Models",
        link: "/learn/fundamentals/data-models",
      },
      {
        type: "link",
        title: "Subscribers",
        link: "/learn/fundamentals/events-and-subscribers",
      },
      {
        type: "link",
        title: "Scheduled Jobs",
        link: "/learn/fundamentals/scheduled-jobs",
      },
      {
        type: "link",
        title: "Loaders",
        link: "/learn/fundamentals/modules/loaders",
      },
      {
        type: "link",
        title: "Admin Customizations",
        link: "/learn/fundamentals/admin",
      },
      {
        type: "divider",
      },
      {
        type: "link",
        title: "Links",
        link: "/learn/fundamentals/module-links",
      },
      {
        type: "link",
        title: "Query",
        link: "/learn/fundamentals/module-links/query",
      },
    ],
  },
  {
    type: "dropdown",
    title: "Reference",
    children: [
      {
        type: "link",
        title: "Admin API",
        link: "/api/admin",
      },
      {
        type: "link",
        title: "Store API",
        link: "/api/store",
      },
      {
        type: "divider",
      },
      {
        type: "link",
        title: "Core Workflows",
        link: "/resources/medusa-workflows-reference",
      },
      {
        type: "link",
        title: "Data Model Language",
        link: "/resources/references/data-model",
      },
      {
        type: "link",
        title: "Service Factory",
        link: "/resources/service-factory-reference",
      },
      {
        type: "link",
        title: "Events Reference",
        link: "/resources/events-reference",
      },
      {
        type: "link",
        title: "Admin Widget Injection Zones",
        link: "/resources/admin-widget-injection-zones",
      },
    ],
  },
]

export const searchFilters: OptionType[] = [
  {
    value: "guides",
    label: "Guides",
  },
  {
    value: "references-v2",
    label: "References",
  },
  {
    value: "admin-v2",
    label: "Admin API (v2)",
  },
  {
    value: "store-v2",
    label: "Store API (v2)",
  },
  {
    value: "ui",
    label: "Medusa UI",
  },
  // TODO add more filters
]
