/** @type {import('types').RawSidebarItem[]} */
export const cartSidebar = [
  {
    type: "category",
    title: "Cart Module",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/commerce-modules/cart",
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
            path: "/commerce-modules/cart/concepts",
            title: "Cart Concepts",
          },
          {
            type: "link",
            path: "/commerce-modules/cart/promotions",
            title: "Promotion Adjustments",
          },
          {
            type: "link",
            path: "/commerce-modules/cart/tax-lines",
            title: "Tax Lines",
          },
          {
            type: "link",
            path: "/commerce-modules/cart/links-to-other-modules",
            title: "Links to Other Modules",
          },
        ],
      },
      {
        type: "category",
        title: "Server Guides",
        autogenerate_tags: "server+cart",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to use the Cart Module in your customizations on the Medusa application server.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/cart/extend",
            title: "Extend Module",
          },
        ],
      },
      {
        type: "category",
        title: "Storefront Guides",
        autogenerate_tags: "storefront+cart,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to integrate the Cart Module's features into your storefront.",
      },
      {
        type: "category",
        title: "Admin Guides",
        autogenerate_tags: "admin+cart,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize administative features of the Cart Module.",
      },
      {
        type: "category",
        title: "User Guides",
        autogenerate_tags: "userGuides+cart",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize and manage Cart features in the Medusa Admin dashboard.",
      },
      {
        type: "category",
        title: "References",
        initialOpen: false,
        description:
          "Find references for tools and resources related to the Cart Module, such as data models, methods, and more. These are useful for your customizations.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/cart/workflows",
            title: "Workflows",
            hideChildren: true,
            children: [
              {
                type: "category",
                title: "Workflows",
                autogenerate_tags: "workflow+cart",
                autogenerate_as_ref: true,
              },
              {
                type: "category",
                title: "Steps",
                autogenerate_tags: "step+cart",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/cart/js-sdk",
            title: "JS SDK",
            hideChildren: true,
            children: [
              {
                type: "sub-category",
                title: "Store",
                autogenerate_tags: "jsSdk+storefront+cart",
                description:
                  "The following methods or properties are used to send requests to Store API Routes related to the Cart Module.",
                autogenerate_as_ref: true,
              },
              {
                type: "sub-category",
                title: "Admin",
                autogenerate_tags: "jsSdk+admin+cart",
                description:
                  "The following methods or properties are used to send requests to Admin API Routes related to the Cart Module.",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/cart/events",
            title: "Events Reference",
          },
          {
            type: "link",
            path: "/references/cart",
            title: "Main Service Reference",
            isChildSidebar: true,
            childSidebarTitle: "Cart Module's Main Service Reference",
            children: [
              {
                type: "category",
                title: "Methods",
                autogenerate_path:
                  "/references/cart/ICartModuleService/methods",
              },
            ],
          },
          {
            type: "link",
            path: "/references/cart/models",
            title: "Data Models Reference",
            isChildSidebar: true,
            childSidebarTitle: "Cart Module Data Models Reference",
            children: [
              {
                type: "category",
                title: "Data Models",
                autogenerate_path: "/references/cart_models/variables",
              },
            ],
          },
        ],
      },
    ],
  },
]
