/** @type {import('types').RawSidebarItem[]} */
export const sdkToolsSidebar = [
  {
    type: "link",
    path: "/create-medusa-app",
    title: "create-medusa-app",
  },
  {
    type: "link",
    path: "/medusa-cli",
    title: "Medusa CLI",
    isChildSidebar: true,
    childSidebarTitle: "Medusa CLI Reference",
    children: [
      {
        type: "link",
        path: "/medusa-cli",
        title: "Overview",
      },
      {
        type: "separator",
      },
      {
        type: "category",
        title: "Commands",
        autogenerate_path: "medusa-cli/commands",
      },
    ],
  },
  {
    type: "link",
    path: "/js-sdk",
    title: "JS SDK",
    isChildSidebar: true,
    childSidebarTitle: "JS SDK Reference",
    children: [
      {
        type: "category",
        title: "Auth",
        autogenerate_path: "/references/js_sdk/auth/Auth/methods",
        initialOpen: true,
      },
      {
        type: "category",
        title: "Store",
        autogenerate_path: "/references/js_sdk/store/Store/properties",
        initialOpen: true,
      },
      {
        type: "category",
        title: "Admin",
        autogenerate_path: "/references/js_sdk/admin/Admin/properties",
        initialOpen: true,
      },
    ],
  },
  {
    type: "link",
    path: "/nextjs-starter",
    title: "Next.js Starter Storefront",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/nextjs-starter",
        title: "Overview",
      },
      {
        type: "category",
        title: "Payment",
        children: [
          {
            type: "link",
            path: "/nextjs-starter/guides/customize-stripe",
            title: "Customize Stripe Integration",
          },
        ],
      },
    ],
  },
]
