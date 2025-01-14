/** @type {import('types').RawSidebarItem[]} */
export const storefrontGuidesSidebar = [
  {
    type: "category",
    title: "General",
    children: [
      {
        type: "link",
        path: "/storefront-development/tips",
        title: "Tips",
      },
      {
        type: "link",
        path: "/storefront-development/publishable-api-keys",
        title: "Publishable API Key",
      },
    ],
  },
  {
    type: "category",
    title: "Regions",
    children: [
      {
        type: "link",
        path: "/storefront-development/regions",
        title: "Overview",
      },
      {
        type: "link",
        path: "/storefront-development/regions/list",
        title: "List Regions",
      },
      {
        type: "link",
        path: "/storefront-development/regions/store-retrieve-region",
        title: "Store and Retrieve Regions",
      },
      {
        type: "link",
        path: "/storefront-development/regions/context",
        title: "Region React Context",
      },
    ],
  },
  {
    type: "category",
    title: "Products",
    children: [
      {
        type: "link",
        path: "/storefront-development/products/list",
        title: "List Products",
      },
      {
        type: "link",
        path: "/storefront-development/products/retrieve",
        title: "Retrieve a Product",
      },
      {
        type: "link",
        path: "/storefront-development/products/variants",
        title: "Select a Variant",
      },
      {
        type: "link",
        path: "/storefront-development/products/price",
        title: "Retrieve Variant Prices",
        autogenerate_path: "storefront-development/products/price/examples",
      },
      {
        type: "link",
        path: "/storefront-development/products/inventory",
        title: "Retrieve Variant Inventory",
      },
    ],
  },
  {
    type: "category",
    title: "Product Categories",
    children: [
      {
        type: "link",
        path: "/storefront-development/products/categories/list",
        title: "List Categories",
      },
      {
        type: "link",
        path: "/storefront-development/products/categories/retrieve",
        title: "Retrieve a Category",
      },
      {
        type: "link",
        path: "/storefront-development/products/categories/products",
        title: "Retrieve a Category's Products",
      },
      {
        type: "link",
        path: "/storefront-development/products/categories/nested-categories",
        title: "Retrieve Nested Categories",
      },
    ],
  },
  {
    type: "category",
    title: "Product Collections",
    children: [
      {
        type: "link",
        path: "/storefront-development/products/collections/list",
        title: "List Collections",
      },
      {
        type: "link",
        path: "/storefront-development/products/collections/retrieve",
        title: "Retrieve a Collection",
      },
      {
        type: "link",
        path: "/storefront-development/products/collections/products",
        title: "Retrieve a Collection's Products",
      },
    ],
  },
  {
    type: "category",
    title: "Carts",
    children: [
      {
        type: "link",
        path: "/storefront-development/cart/create",
        title: "Create Cart",
      },
      {
        type: "link",
        path: "/storefront-development/cart/retrieve",
        title: "Retrieve Cart",
      },
      {
        type: "link",
        path: "/storefront-development/cart/context",
        title: "Cart React Context",
      },
      {
        type: "link",
        path: "/storefront-development/cart/update",
        title: "Update Cart",
      },
      {
        type: "link",
        path: "/storefront-development/cart/manage-items",
        title: "Manage Line Items",
      },
    ],
  },
  {
    type: "category",
    title: "Checkout",
    children: [
      {
        type: "link",
        path: "/storefront-development/checkout",
        title: "Overview",
      },
      {
        type: "link",
        path: "/storefront-development/checkout/email",
        title: "1. Enter Email",
      },
      {
        type: "link",
        path: "/storefront-development/checkout/address",
        title: "2. Enter Address",
      },
      {
        type: "link",
        path: "/storefront-development/checkout/shipping",
        title: "3. Choose Shipping Method",
      },
      {
        type: "link",
        path: "/storefront-development/checkout/payment",
        title: "4. Choose Payment Provider",
        children: [
          {
            type: "link",
            path: "/storefront-development/checkout/payment/stripe",
            title: "Example: Stripe",
          },
        ],
      },
      {
        type: "link",
        path: "/storefront-development/checkout/complete-cart",
        title: "5. Complete Cart",
      },
    ],
  },
  {
    type: "category",
    title: "Customers",
    children: [
      {
        type: "link",
        path: "/storefront-development/customers/register",
        title: "Register Customer",
      },
      {
        type: "link",
        path: "/storefront-development/customers/login",
        title: "Login Customer",
      },
      {
        type: "link",
        path: "/storefront-development/customers/third-party-login",
        title: "Third-Party (Social) Login",
      },
      {
        type: "link",
        path: "/storefront-development/customers/reset-password",
        title: "Reset Password",
      },
      {
        type: "link",
        path: "/storefront-development/customers/retrieve",
        title: "Retrieve Customer",
      },
      {
        type: "link",
        path: "/storefront-development/customers/context",
        title: "Customer React Context",
      },
      {
        type: "link",
        path: "/storefront-development/customers/profile",
        title: "Edit Customer Profile",
      },
      {
        type: "link",
        path: "/storefront-development/customers/addresses",
        title: "Manage Customer Addresses",
      },
      {
        type: "link",
        path: "/storefront-development/customers/log-out",
        title: "Log-out Customer",
      },
    ],
  },
]
