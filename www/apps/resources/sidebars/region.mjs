/** @type {import('types').RawSidebarItem[]} */
export const regionSidebar = [
  {
    type: "category",
    title: "Region Module",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/commerce-modules/region",
        title: "Overview",
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
            path: "/commerce-modules/region/links-to-other-modules",
            title: "Links to Modules",
          },
        ],
      },
      {
        type: "category",
        title: "Server Guides",
        autogenerate_tags: "server+region",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to use the Region Module in your customizations on the Medusa application server.",
      },
      {
        type: "category",
        title: "Storefront Guides",
        autogenerate_tags: "storefront+region,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to integrate the Region Module's features into your storefront.",
      },
      {
        type: "category",
        title: "Admin Guides",
        autogenerate_tags: "admin+region,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize administative features of the Region Module.",
      },
      {
        type: "category",
        title: "User Guides",
        autogenerate_tags: "userGuides+region",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize and manage Region features in the Medusa Admin dashboard.",
      },
      {
        type: "category",
        title: "References",
        initialOpen: false,
        description:
          "Find references for tools and resources related to the Region Module, such as data models, methods, and more. These are useful for your customizations.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/region/workflows",
            title: "Workflows",
            hideChildren: true,
            children: [
              {
                type: "category",
                title: "Workflows",
                autogenerate_tags: "workflow+region",
                autogenerate_as_ref: true,
              },
              {
                type: "category",
                title: "Steps",
                autogenerate_tags: "step+region",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/region/js-sdk",
            title: "JS SDK",
            hideChildren: true,
            children: [
              {
                type: "sub-category",
                title: "Store",
                autogenerate_tags: "jsSdk+storefront+region",
                description:
                  "The following methods or properties are used to send requests to Store API Routes related to the Region Module.",
                autogenerate_as_ref: true,
              },
              {
                type: "sub-category",
                title: "Admin",
                autogenerate_tags: "jsSdk+admin+region",
                description:
                  "The following methods or properties are used to send requests to Admin API Routes related to the Region Module.",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/region/events",
            title: "Events Reference",
          },
          {
            type: "link",
            path: "/commerce-modules/region/admin-widget-zones",
            title: "Admin Widget Zones",
          },
          {
            type: "link",
            path: "/references/region",
            title: "Main Service Reference",
            isChildSidebar: true,
            childSidebarTitle: "Region Module's Main Service Reference",
            children: [
              {
                type: "category",
                title: "Methods",
                autogenerate_path:
                  "/references/region/IRegionModuleService/methods",
              },
            ],
          },
          {
            type: "link",
            path: "/references/region/models",
            title: "Data Models Reference",
            isChildSidebar: true,
            childSidebarTitle: "Region Module Data Models Reference",
            children: [
              {
                type: "category",
                title: "Data Models",
                autogenerate_path: "/references/region_models/variables",
              },
            ],
          },
        ],
      },
    ],
  },
]
