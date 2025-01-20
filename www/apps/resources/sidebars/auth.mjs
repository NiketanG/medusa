/** @type {import('types').RawSidebarItem[]} */
export const authSidebar = [
  {
    type: "category",
    title: "Auth Module",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/commerce-modules/auth",
        title: "Overview",
      },
      {
        type: "link",
        path: "/commerce-modules/auth/module-options",
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
            path: "/commerce-modules/auth/auth-identity-and-actor-types",
            title: "Identity and Actor Types",
          },
          {
            type: "link",
            path: "/commerce-modules/auth/auth-providers",
            title: "Auth Providers",
          },
          {
            type: "link",
            path: "/commerce-modules/auth/auth-flows",
            title: "Auth Flow with Module",
          },
          {
            type: "link",
            path: "/commerce-modules/auth/authentication-route",
            title: "Auth Flow with Routes",
          },
        ],
      },
      {
        type: "category",
        title: "Server Guides",
        autogenerate_tags: "server+auth",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to use the Auth Module in your customizations on the Medusa application server.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/auth/create-actor-type",
            title: "Create an Actor Type",
          },
          {
            type: "link",
            path: "/commerce-modules/auth/reset-password",
            title: "Handle Password Reset Event",
          },
          {
            type: "link",
            path: "/references/auth/provider",
            title: "Create Auth Provider Module",
          },
        ],
      },
      {
        type: "category",
        title: "Storefront Guides",
        autogenerate_tags: "storefront+auth,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to integrate the Auth Module's features into your storefront.",
      },
      {
        type: "category",
        title: "Admin Guides",
        autogenerate_tags: "admin+auth,-jsSdk",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize administative features of the Auth Module.",
      },
      {
        type: "category",
        title: "User Guides",
        autogenerate_tags: "userGuides+auth",
        initialOpen: false,
        autogenerate_as_ref: true,
        description:
          "Learn how to utilize and manage Auth features in the Medusa Admin dashboard.",
      },
      {
        type: "category",
        title: "Providers",
        initialOpen: false,
        children: [
          {
            type: "link",
            path: "/commerce-modules/auth/auth-providers/emailpass",
            title: "Emailpass Provider",
          },
          {
            type: "link",
            path: "/commerce-modules/auth/auth-providers/google",
            title: "Google Provider",
          },
          {
            type: "link",
            path: "/commerce-modules/auth/auth-providers/github",
            title: "GitHub Provider",
          },
        ],
      },
      {
        type: "category",
        title: "References",
        initialOpen: false,
        description:
          "Find references for tools and resources related to the Auth Module, such as data models, methods, and more. These are useful for your customizations.",
        children: [
          {
            type: "link",
            path: "/commerce-modules/auth/workflows",
            title: "Workflows",
            hideChildren: true,
            children: [
              {
                type: "category",
                title: "Workflows",
                autogenerate_tags: "workflow+auth",
                autogenerate_as_ref: true,
              },
              {
                type: "category",
                title: "Steps",
                autogenerate_tags: "step+auth",
                autogenerate_as_ref: true,
              },
            ],
          },
          {
            type: "link",
            path: "/commerce-modules/auth/js-sdk",
            title: "JS SDK",
            hideChildren: true,
            autogenerate_tags: "jsSdk+auth",
            autogenerate_as_ref: true,
          },
          {
            type: "link",
            path: "/commerce-modules/auth/events",
            title: "Events Reference",
          },
          {
            type: "link",
            path: "/commerce-modules/auth/admin-widget-zones",
            title: "Admin Widget Zones",
          },
          {
            type: "link",
            path: "/references/auth",
            title: "Main Service Reference",
            isChildSidebar: true,
            childSidebarTitle: "Auth Module's Main Service Reference",
            children: [
              {
                type: "category",
                title: "Methods",
                autogenerate_path:
                  "/references/auth/IAuthModuleService/methods",
              },
            ],
          },
          {
            type: "link",
            path: "/references/auth/models",
            title: "Data Models Reference",
            isChildSidebar: true,
            childSidebarTitle: "Auth Module Data Models Reference",
            children: [
              {
                type: "category",
                title: "Data Models",
                autogenerate_path: "/references/auth_models/variables",
              },
            ],
          },
        ],
      },
    ],
  },
]
