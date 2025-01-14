/** @type {import('types').RawSidebarItem[]} */
export const orderSidebar = [
  {
    type: "category",
    title: "Order Module",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/commerce-modules/order",
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
            path: "/commerce-modules/order/concepts",
            title: "Order Concepts",
          },
          {
            type: "link",
            path: "/commerce-modules/order/promotion-adjustments",
            title: "Promotions Adjustments",
          },
          {
            type: "link",
            path: "/commerce-modules/order/tax-lines",
            title: "Tax Lines",
          },
          {
            type: "link",
            path: "/commerce-modules/order/transactions",
            title: "Transactions",
          },
          {
            type: "link",
            path: "/commerce-modules/order/order-versioning",
            title: "Order Versioning",
          },
          {
            type: "link",
            path: "/commerce-modules/order/return",
            title: "Return",
          },
          {
            type: "link",
            path: "/commerce-modules/order/exchange",
            title: "Exchange",
          },
          {
            type: "link",
            path: "/commerce-modules/order/claim",
            title: "Claim",
          },
          {
            type: "link",
            path: "/commerce-modules/order/edit",
            title: "Order Edit",
          },
          {
            type: "link",
            path: "/commerce-modules/order/order-change",
            title: "Order Change",
          },
          {
            type: "link",
            path: "/commerce-modules/order/links-to-other-modules",
            title: "Links to Other Modules",
          },
        ],
      },
      {
        type: "category",
        title: "Server Guides",
        autogenerate_tags: "server+order",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to use the Order Module in your customizations on the Medusa application server.",
      },
      {
        type: "category",
        title: "Storefront Guides",
        autogenerate_tags: "storefront+order,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to integrate the Order Module's features into your storefront.",
      },
      {
        type: "category",
        title: "Admin Guides",
        autogenerate_tags: "admin+order,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize administative features of the Order Module.",
      },
      {
        type: "category",
        title: "User Guides",
        autogenerate_tags: "userGuides+order",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize and manage Order features in the Medusa Admin dashboard.",
      },
      {
        type: "category",
        title: "References",
        initialOpen: false,
        description:
          "Find references for tools and resources related to the Order Module, such as data models, methods, and more. These are useful for your customizations.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/order/workflows",
            title: "Workflows",
            hideChildren: true,
            children: [
              {
                type: "category",
                title: "Workflows",
                autogenerate_tags: "workflow+order",
                autogenerate_as_ref: true,
              },
              {
                type: "category",
                title: "Steps",
                autogenerate_tags: "step+order",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/order/js-sdk",
            title: "JS SDK",
            hideChildren: true,
            children: [
              {
                type: "sub-category",
                title: "Store",
                autogenerate_tags: "jsSdk+storefront+order",
                description:
                  "The following methods or properties are used to send requests to Store API Routes related to the Order Module.",
                autogenerate_as_ref: true,
              },
              {
                type: "sub-category",
                title: "Admin",
                autogenerate_tags: "jsSdk+admin+order",
                description:
                  "The following methods or properties are used to send requests to Admin API Routes related to the Order Module.",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/order/events",
            title: "Events Reference",
          },
          {
            type: "link",
            path: "/commerce-modules/order/admin-widget-zones",
            title: "Admin Widget Zones",
          },
          {
            type: "link",
            path: "/references/order",
            title: "Main Service Reference",
            isChildSidebar: true,
            childSidebarTitle: "Order Module's Main Service Reference",
            children: [
              {
                type: "category",
                title: "Methods",
                autogenerate_path:
                  "/references/order/IOrderModuleService/methods",
              },
            ],
          },
          {
            type: "link",
            path: "/references/order/models",
            title: "Data Models Reference",
            isChildSidebar: true,
            childSidebarTitle: "Order Module Data Models Reference",
            children: [
              {
                type: "category",
                title: "Data Models",
                hasTitleStyling: true,
                autogenerate_path: "/references/order_models/classes",
              },
            ],
          },
        ],
      },
    ],
  },
]
