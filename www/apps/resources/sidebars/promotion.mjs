/** @type {import('types').RawSidebarItem[]} */
export const promotionSidebar = [
  {
    type: "category",
    title: "Promotion Module",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/commerce-modules/promotion",
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
            path: "/commerce-modules/promotion/concepts",
            title: "Promotion",
          },
          {
            type: "link",
            path: "/commerce-modules/promotion/application-method",
            title: "Application Method",
          },
          {
            type: "link",
            path: "/commerce-modules/promotion/campaign",
            title: "Campaign",
          },
          {
            type: "link",
            path: "/commerce-modules/promotion/actions",
            title: "Promotion Actions",
          },
          {
            type: "link",
            path: "/commerce-modules/promotion/links-to-other-modules",
            title: "Links to Modules",
          },
        ],
      },
      {
        type: "category",
        title: "Server Guides",
        autogenerate_tags: "server+promotion",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to use the Promotion Module in your customizations on the Medusa application server.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/promotion/extend",
            title: "Extend Module",
          },
        ],
      },
      {
        type: "category",
        title: "Storefront Guides",
        autogenerate_tags: "storefront+promotion,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to integrate the Promotion Module's features into your storefront.",
      },
      {
        type: "category",
        title: "Admin Guides",
        autogenerate_tags: "admin+promotion,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize administative features of the Promotion Module.",
      },
      {
        type: "category",
        title: "User Guides",
        autogenerate_tags: "userGuides+promotion",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize and manage Promotion features in the Medusa Admin dashboard.",
      },
      {
        type: "category",
        title: "References",
        initialOpen: false,
        description:
          "Find references for tools and resources related to the Promotion Module, such as data models, methods, and more. These are useful for your customizations.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/promotion/workflows",
            title: "Workflows",
            hideChildren: true,
            children: [
              {
                type: "category",
                title: "Workflows",
                autogenerate_tags: "workflow+promotion",
                autogenerate_as_ref: true,
              },
              {
                type: "category",
                title: "Steps",
                autogenerate_tags: "step+promotion",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/promotion/js-sdk",
            title: "JS SDK",
            hideChildren: true,
            children: [
              {
                type: "sub-category",
                title: "Store",
                autogenerate_tags: "jsSdk+storefront+promotion",
                description:
                  "The following methods or properties are used to send requests to Store API Routes related to the Promotion Module.",
                autogenerate_as_ref: true,
              },
              {
                type: "sub-category",
                title: "Admin",
                autogenerate_tags: "jsSdk+admin+promotion",
                description:
                  "The following methods or properties are used to send requests to Admin API Routes related to the Promotion Module.",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/promotion/admin-widget-zones",
            title: "Admin Widget Zones",
          },
          {
            type: "link",
            path: "/references/promotion",
            title: "Main Service Reference",
            isChildSidebar: true,
            childSidebarTitle: "Promotion Module's Main Service Reference",
            children: [
              {
                type: "category",
                title: "Methods",
                hasTitleStyling: true,
                autogenerate_path:
                  "/references/promotion/IPromotionModuleService/methods",
              },
            ],
          },
          {
            type: "link",
            path: "/references/promotion/models",
            title: "Data Models Reference",
            isChildSidebar: true,
            childSidebarTitle: "Promotion Module Data Models Reference",
            children: [
              {
                type: "category",
                title: "Data Models",
                hasTitleStyling: true,
                autogenerate_path: "/references/promotion_models/variables",
              },
            ],
          },
        ],
      },
    ],
  },
]
