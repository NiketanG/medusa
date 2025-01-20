/** @type {import('types').RawSidebarItem[]} */
export const fulfillmentSidebar = [
  {
    type: "category",
    title: "Fulfillment Module",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/commerce-modules/fulfillment",
        title: "Overview",
      },
      {
        type: "link",
        path: "/commerce-modules/fulfillment/module-options",
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
            path: "/commerce-modules/fulfillment/concepts",
            title: "Fulfillment Concepts",
          },
          {
            type: "link",
            path: "/commerce-modules/fulfillment/fulfillment-provider",
            title: "Fulfillment Provider",
          },
          {
            type: "link",
            path: "/commerce-modules/fulfillment/shipping-option",
            title: "Shipping Option",
          },
          {
            type: "link",
            path: "/commerce-modules/fulfillment/item-fulfillment",
            title: "Item Fulfillment",
          },
          {
            type: "link",
            path: "/commerce-modules/fulfillment/links-to-other-modules",
            title: "Links to Other Modules",
          },
        ],
      },
      {
        type: "category",
        title: "Server Guides",
        autogenerate_tags: "server+fulfillment",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to use the Fulfillment Module in your customizations on the Medusa application server.",
        children: [
          {
            type: "link",
            path: "/references/fulfillment/provider",
            title: "Create Fulfillment Provider Module",
          },
          {
            type: "ref",
            path: "/integrations/guides/shipstation",
            title: "Integrate ShipStation",
          },
        ],
      },
      {
        type: "category",
        title: "Storefront Guides",
        autogenerate_tags: "storefront+fulfillment,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to integrate the Fulfillment Module's features into your storefront.",
      },
      {
        type: "category",
        title: "Admin Guides",
        autogenerate_tags: "admin+fulfillment,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize administative features of the Fulfillment Module.",
      },
      {
        type: "category",
        title: "User Guides",
        autogenerate_tags: "userGuides+fulfillment",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize and manage Fulfillment features in the Medusa Admin dashboard.",
      },
      {
        type: "category",
        title: "References",
        initialOpen: false,
        description:
          "Find references for tools and resources related to the Fulfillment Module, such as data models, methods, and more. These are useful for your customizations.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/fulfillment/workflows",
            title: "Workflows",
            hideChildren: true,
            children: [
              {
                type: "category",
                title: "Workflows",
                autogenerate_tags: "workflow+fulfillment",
                autogenerate_as_ref: true,
              },
              {
                type: "category",
                title: "Steps",
                autogenerate_tags: "step+fulfillment",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/fulfillment/js-sdk",
            title: "JS SDK",
            hideChildren: true,
            children: [
              {
                type: "sub-category",
                title: "Store",
                autogenerate_tags: "jsSdk+storefront+fulfillment",
                description:
                  "The following methods or properties are used to send requests to Store API Routes related to the Fulfillment Module.",
                autogenerate_as_ref: true,
              },
              {
                type: "sub-category",
                title: "Admin",
                autogenerate_tags: "jsSdk+admin+fulfillment",
                description:
                  "The following methods or properties are used to send requests to Admin API Routes related to the Fulfillment Module.",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/fulfillment/events",
            title: "Events Reference",
          },
          {
            type: "link",
            path: "/commerce-modules/fulfillment/admin-widget-zones",
            title: "Admin Widget Zones",
          },
          {
            type: "link",
            path: "/references/fulfillment",
            title: "Main Service Reference",
            isChildSidebar: true,
            childSidebarTitle: "Fulfillment Module's Main Service Reference",
            children: [
              {
                type: "category",
                title: "Methods",
                autogenerate_path:
                  "/references/fulfillment/IFulfillmentModuleService/methods",
              },
            ],
          },
          {
            type: "link",
            path: "/references/fulfillment/models",
            title: "Data Models Reference",
            isChildSidebar: true,
            childSidebarTitle: "Fulfillment Module Data Models Reference",
            children: [
              {
                type: "category",
                title: "Data Models",
                hasTitleStyling: true,
                autogenerate_path: "/references/fulfillment_models/variables",
              },
            ],
          },
        ],
      },
    ],
  },
]
