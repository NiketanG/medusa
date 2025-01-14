/** @type {import('types').RawSidebarItem[]} */
export const salesChannelSidebar = [
  {
    type: "category",
    title: "Sales Channel Module",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/commerce-modules/sales-channel",
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
            path: "/commerce-modules/sales-channel/publishable-api-keys",
            title: "Publishable API Keys",
          },
          {
            type: "link",
            path: "/commerce-modules/sales-channel/links-to-other-modules",
            title: "Links to Modules",
          },
        ],
      },
      {
        type: "category",
        title: "Server Guides",
        autogenerate_tags: "server+salesChannel",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to use the Sales Channel Module in your customizations on the Medusa application server.",
      },
      {
        type: "category",
        title: "Storefront Guides",
        autogenerate_tags: "storefront+salesChannel,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to integrate the Sales Channel Module's features into your storefront.",
      },
      {
        type: "category",
        title: "Admin Guides",
        autogenerate_tags: "admin+salesChannel,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize administative features of the Sales Channel Module.",
      },
      {
        type: "category",
        title: "User Guides",
        autogenerate_tags: "userGuides+salesChannel",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize and manage Sales Channel features in the Medusa Admin dashboard.",
      },
      {
        type: "category",
        title: "References",
        initialOpen: false,
        description:
          "Find references for tools and resources related to the Sales Channel Module, such as data models, methods, and more. These are useful for your customizations.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/sales-channel/workflows",
            title: "Workflows",
            hideChildren: true,
            children: [
              {
                type: "category",
                title: "Workflows",
                autogenerate_tags: "workflow+salesChannel",
                autogenerate_as_ref: true,
              },
              {
                type: "category",
                title: "Steps",
                autogenerate_tags: "step+salesChannel",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/sales-channel/js-sdk",
            title: "JS SDK",
            hideChildren: true,
            children: [
              {
                type: "sub-category",
                title: "Store",
                autogenerate_tags: "jsSdk+storefront+salesChannel",
                description:
                  "The following methods or properties are used to send requests to Store API Routes related to the Sales Channel Module.",
                autogenerate_as_ref: true,
              },
              {
                type: "sub-category",
                title: "Admin",
                autogenerate_tags: "jsSdk+admin+salesChannel",
                description:
                  "The following methods or properties are used to send requests to Admin API Routes related to the Sales Channel Module.",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/sales-channel/events",
            title: "Events Reference",
          },
          {
            type: "link",
            path: "/commerce-modules/sales-channel/admin-widget-zones",
            title: "Admin Widget Zones",
          },
          {
            type: "link",
            path: "/references/sales-channel",
            title: "Main Service Reference",
            isChildSidebar: true,
            childSidebarTitle: "Sales Channel Module's Main Service Reference",
            children: [
              {
                type: "category",
                title: "Methods",
                autogenerate_path:
                  "/references/sales_channel/ISalesChannelModuleService/methods",
              },
            ],
          },
          {
            type: "link",
            path: "/references/sales-channel/models",
            title: "Data Models Reference",
            isChildSidebar: true,
            childSidebarTitle: "Sales Channel Module Data Models Reference",
            children: [
              {
                type: "category",
                title: "Data Models",
                autogenerate_path: "/references/sales_channel_models/variables",
              },
            ],
          },
        ],
      },
    ],
  },
]
