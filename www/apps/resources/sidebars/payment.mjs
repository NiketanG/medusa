/** @type {import('types').RawSidebarItem[]} */
export const paymentSidebar = [
  {
    type: "category",
    title: "Payment Module",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/commerce-modules/payment",
        title: "Overview",
      },
      {
        type: "link",
        path: "/commerce-modules/payment/module-options",
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
            path: "/commerce-modules/payment/payment-collection",
            title: "Payment Collections",
          },
          {
            type: "link",
            path: "/commerce-modules/payment/payment-session",
            title: "Payment Session",
          },
          {
            type: "link",
            path: "/commerce-modules/payment/payment",
            title: "Payment",
          },
          {
            type: "link",
            path: "/commerce-modules/payment/payment-provider",
            title: "Payment Provider Module",
          },
          {
            type: "link",
            path: "/commerce-modules/payment/webhook-events",
            title: "Webhook Events",
          },
          {
            type: "link",
            path: "/commerce-modules/payment/links-to-other-modules",
            title: "Links to Other Modules",
          },
        ],
      },
      {
        type: "category",
        title: "Server Guides",
        autogenerate_tags: "server+payment",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to use the Payment Module in your customizations on the Medusa application server.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/payment/payment-flow",
            title: "Accept Payment Flow",
          },
          {
            type: "link",
            path: "/references/payment/provider",
            title: "Create Payment Provider",
          },
        ],
      },
      {
        type: "category",
        title: "Storefront Guides",
        autogenerate_tags: "storefront+payment,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to integrate the Payment Module's features into your storefront.",
      },
      {
        type: "category",
        title: "Admin Guides",
        autogenerate_tags: "admin+payment,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize administative features of the Payment Module.",
      },
      {
        type: "category",
        title: "User Guides",
        autogenerate_tags: "userGuides+payment",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize and manage Payment features in the Medusa Admin dashboard.",
      },
      {
        type: "category",
        title: "Providers",
        initialOpen: false,
        children: [
          {
            type: "link",
            path: "/commerce-modules/payment/payment-provider/stripe",
            title: "Stripe",
          },
        ],
      },
      {
        type: "category",
        title: "References",
        initialOpen: false,
        description:
          "Find references for tools and resources related to the Payment Module, such as data models, methods, and more. These are useful for your customizations.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/payment/workflows",
            title: "Workflows",
            hideChildren: true,
            children: [
              {
                type: "category",
                title: "Workflows",
                autogenerate_tags: "workflow+payment",
                autogenerate_as_ref: true,
              },
              {
                type: "category",
                title: "Steps",
                autogenerate_tags: "step+payment",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/payment/js-sdk",
            title: "JS SDK",
            hideChildren: true,
            children: [
              {
                type: "sub-category",
                title: "Store",
                autogenerate_tags: "jsSdk+storefront+payment",
                description:
                  "The following methods or properties are used to send requests to Store API Routes related to the Payment Module.",
                autogenerate_as_ref: true,
              },
              {
                type: "sub-category",
                title: "Admin",
                autogenerate_tags: "jsSdk+admin+payment",
                description:
                  "The following methods or properties are used to send requests to Admin API Routes related to the Payment Module.",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/payment/events",
            title: "Events Reference",
          },
          {
            type: "link",
            path: "/references/payment",
            title: "Main Service Reference",
            isChildSidebar: true,
            childSidebarTitle: "Payment Module's Main Service Reference",
            children: [
              {
                type: "category",
                title: "Methods",
                autogenerate_path:
                  "/references/payment/IPaymentModuleService/methods",
              },
            ],
          },
          {
            type: "link",
            path: "/references/payment/models",
            title: "Data Models Reference",
            isChildSidebar: true,
            childSidebarTitle: "Payment Module Data Models Reference",
            children: [
              {
                type: "category",
                title: "Data Models",
                autogenerate_path: "/references/payment_models/variables",
              },
            ],
          },
        ],
      },
    ],
  },
]
