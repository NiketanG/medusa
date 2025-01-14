/** @type {import('types').RawSidebarItem[]} */
export const storeSidebar = [
  {
    type: "category",
    title: "Store Module",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/commerce-modules/store",
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
            path: "/commerce-modules/store/links-to-other-modules",
            title: "Link to Modules",
          },
        ],
      },
      {
        type: "category",
        title: "Server Guides",
        autogenerate_tags: "server+store",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to use the Store Module in your customizations on the Medusa application server.",
      },
      {
        type: "category",
        title: "Storefront Guides",
        autogenerate_tags: "storefront+store,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to integrate the Store Module's features into your storefront.",
      },
      {
        type: "category",
        title: "Admin Guides",
        autogenerate_tags: "admin+store,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize administative features of the Store Module.",
      },
      {
        type: "category",
        title: "User Guides",
        autogenerate_tags: "userGuides+store",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize and manage Store features in the Medusa Admin dashboard.",
      },
      {
        type: "category",
        title: "References",
        initialOpen: false,
        description:
          "Find references for tools and resources related to the Store Module, such as data models, methods, and more. These are useful for your customizations.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/store/workflows",
            title: "Workflows",
            hideChildren: true,
            children: [
              {
                type: "category",
                title: "Workflows",
                autogenerate_tags: "workflow+store",
                autogenerate_as_ref: true,
              },
              {
                type: "category",
                title: "Steps",
                autogenerate_tags: "step+store",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/store/js-sdk",
            title: "JS SDK",
            hideChildren: true,
            children: [
              {
                type: "sub-category",
                title: "Store",
                autogenerate_tags: "jsSdk+storefront+store",
                description:
                  "The following methods or properties are used to send requests to Store API Routes related to the Store Module.",
                autogenerate_as_ref: true,
              },
              {
                type: "sub-category",
                title: "Admin",
                autogenerate_tags: "jsSdk+admin+store",
                description:
                  "The following methods or properties are used to send requests to Admin API Routes related to the Store Module.",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/store/admin-widget-zones",
            title: "Admin Widget Zones",
          },
          {
            type: "link",
            path: "/references/store",
            title: "Main Service Reference",
            isChildSidebar: true,
            childSidebarTitle: "Store Module's Main Service Reference",
            children: [
              {
                type: "category",
                title: "Methods",
                autogenerate_path:
                  "/references/store/IStoreModuleService/methods",
              },
            ],
          },
          {
            type: "link",
            path: "/references/store/models",
            title: "Data Models Reference",
            isChildSidebar: true,
            childSidebarTitle: "Store Module Data Models Reference",
            children: [
              {
                type: "category",
                title: "Data Models",
                autogenerate_path: "/references/store_models/variables",
              },
            ],
          },
        ],
      },
    ],
  },
]
