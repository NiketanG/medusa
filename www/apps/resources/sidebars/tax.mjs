/** @type {import('types').RawSidebarItem[]} */
export const taxSidebar = [
  {
    type: "category",
    title: "Tax Module",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/commerce-modules/tax",
        title: "Overview",
      },
      {
        type: "link",
        path: "/commerce-modules/tax/module-options",
        title: "Module Options",
      },
      {
        type: "separator",
      },
      {
        type: "category",
        title: "Concepts",
        initialOpen: false,
        children: [
          {
            type: "link",
            path: "/commerce-modules/tax/tax-region",
            title: "Tax Region",
          },
          {
            type: "link",
            path: "/commerce-modules/tax/tax-rates-and-rules",
            title: "Tax Rates and Rules",
          },
          {
            type: "link",
            path: "/commerce-modules/tax/tax-calculation-with-provider",
            title: "Tax Calculation and Providers",
          },
        ],
      },
      {
        type: "category",
        title: "Server Guides",
        autogenerate_tags: "server+tax",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to use the Tax Module in your customizations on the Medusa application server.",
        children: [
          {
            type: "link",
            path: "/references/tax/provider",
            title: "Tax Provider Reference",
          },
        ],
      },
      {
        type: "category",
        title: "Storefront Guides",
        autogenerate_tags: "storefront+tax,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to integrate the Tax Module's features into your storefront.",
      },
      {
        type: "category",
        title: "Admin Guides",
        autogenerate_tags: "admin+tax,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize administative features of the Tax Module.",
      },
      {
        type: "category",
        title: "User Guides",
        autogenerate_tags: "userGuides+tax",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize and manage Tax features in the Medusa Admin dashboard.",
      },
      {
        type: "category",
        title: "References",
        initialOpen: false,
        description:
          "Find references for tools and resources related to the Tax Module, such as data models, methods, and more. These are useful for your customizations.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/tax/workflows",
            title: "Workflows",
            hideChildren: true,
            children: [
              {
                type: "category",
                title: "Workflows",
                autogenerate_tags: "workflow+tax",
                autogenerate_as_ref: true,
              },
              {
                type: "category",
                title: "Steps",
                autogenerate_tags: "step+tax",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/tax/js-sdk",
            title: "JS SDK",
            hideChildren: true,
            children: [
              {
                type: "sub-category",
                title: "Store",
                autogenerate_tags: "jsSdk+storefront+tax",
                description:
                  "The following methods or properties are used to send requests to Store API Routes related to the Tax Module.",
                autogenerate_as_ref: true,
              },
              {
                type: "sub-category",
                title: "Admin",
                autogenerate_tags: "jsSdk+admin+tax",
                description:
                  "The following methods or properties are used to send requests to Admin API Routes related to the Tax Module.",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/tax/admin-widget-zones",
            title: "Admin Widget Zones",
          },
          {
            type: "link",
            path: "/references/tax",
            title: "Main Service Reference",
            isChildSidebar: true,
            childSidebarTitle: "Tax Module's Main Service Reference",
            children: [
              {
                type: "category",
                title: "Methods",
                autogenerate_path: "/references/tax/ITaxModuleService/methods",
              },
            ],
          },
          {
            type: "link",
            path: "/references/tax/models",
            title: "Data Models Reference",
            isChildSidebar: true,
            childSidebarTitle: "Tax Module Data Models Reference",
            children: [
              {
                type: "category",
                title: "Data Models",
                autogenerate_path: "/references/tax_models/variables",
              },
            ],
          },
        ],
      },
    ],
  },
]
