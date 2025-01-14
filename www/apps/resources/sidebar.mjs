import { apiKeySidebar } from "./sidebars/api-key.mjs"
import { architecturalModulesSidebar } from "./sidebars/architectural-modules.mjs"
import { authSidebar } from "./sidebars/auth.mjs"
import { cartSidebar } from "./sidebars/cart.mjs"
import { currencySidebar } from "./sidebars/currency.mjs"
import { customerSidebar } from "./sidebars/customer.mjs"
import { fulfillmentSidebar } from "./sidebars/fulfillment.mjs"
import { integrationsSidebar } from "./sidebars/integrations.mjs"
import { inventorySidebar } from "./sidebars/inventory.mjs"
import { orderSidebar } from "./sidebars/order-module.mjs"
import { paymentSidebar } from "./sidebars/payment.mjs"
import { pricingSidebar } from "./sidebars/pricing.mjs"
import { productSidebar } from "./sidebars/product.mjs"
import { promotionSidebar } from "./sidebars/promotion.mjs"
import { recipesSidebar } from "./sidebars/recipes.mjs"
import { referencesSidebar } from "./sidebars/references.mjs"
import { regionSidebar } from "./sidebars/region.mjs"
import { salesChannelSidebar } from "./sidebars/sales-channel.mjs"
import { sdkToolsSidebar } from "./sidebars/sdk-tools.mjs"
import { stockLocationSidebar } from "./sidebars/stock-location.mjs"
import { storeSidebar } from "./sidebars/store.mjs"
import { storefrontGuidesSidebar } from "./sidebars/storefront.mjs"
import { taxSidebar } from "./sidebars/tax.mjs"
import { troubleshootingSidebar } from "./sidebars/troubleshooting.mjs"
import { userSidebar } from "./sidebars/user.mjs"
import { sidebarAttachHrefCommonOptions } from "./utils/sidebar-attach-common-options.mjs"

/** @type {import('types').RawSidebarItem[]} */
export const sidebar = sidebarAttachHrefCommonOptions([
  {
    type: "link",
    path: "/",
    title: "Overview",
  },
  {
    type: "link",
    path: "/examples",
    title: "Examples",
  },
  {
    type: "link",
    path: "/recipes",
    title: "Recipes",
    isChildSidebar: true,
    children: recipesSidebar,
  },
  {
    type: "separator",
  },
  {
    type: "link",
    path: "/commerce-modules",
    title: "Commerce Modules",
    hideChildren: true,
    children: [
      ...apiKeySidebar,
      ...authSidebar,
      ...cartSidebar,
      ...currencySidebar,
      ...customerSidebar,
      ...fulfillmentSidebar,
      ...inventorySidebar,
      ...orderSidebar,
      ...paymentSidebar,
      ...pricingSidebar,
      ...productSidebar,
      ...promotionSidebar,
      ...regionSidebar,
      ...salesChannelSidebar,
      ...stockLocationSidebar,
      ...storeSidebar,
      ...taxSidebar,
      ...userSidebar,
    ],
  },
  {
    type: "link",
    path: "/architectural-modules",
    title: "Architectural Modules",
    isChildSidebar: true,
    children: architecturalModulesSidebar,
  },
  {
    type: "link",
    path: "/integrations",
    title: "Integrations",
    isChildSidebar: true,
    children: integrationsSidebar,
  },
  {
    type: "link",
    path: "/storefront-development",
    title: "Storefront Development",
    isChildSidebar: true,
    children: storefrontGuidesSidebar,
  },
  {
    type: "separator",
  },
  {
    type: "category",
    title: "SDKs and Tools",
    children: sdkToolsSidebar,
  },
  {
    type: "category",
    title: "General",
    children: [
      {
        type: "link",
        path: "/references/medusa-config",
        title: "Medusa Configurations",
      },
      {
        type: "link",
        path: "/deployment",
        title: "Deployment Guides",
        isChildSidebar: true,
        children: [
          {
            type: "link",
            title: "Medusa Cloud",
            path: "https://medusajs.com/contact",
          },
          {
            type: "separator",
          },
          {
            type: "category",
            title: "Self-Hosting",
            children: [
              {
                type: "link",
                path: "https://docs.medusajs.com/learn/deployment/general",
                title: "General",
              },
              {
                type: "link",
                path: "/deployment/medusa-application/railway",
                title: "Railway",
              },
            ],
          },
          {
            type: "category",
            title: "Next.js Starter",
            autogenerate_path: "/deployment/storefront",
          },
        ],
      },
      {
        type: "link",
        path: "/troubleshooting",
        title: "Troubleshooting Guides",
        isChildSidebar: true,
        children: troubleshootingSidebar,
      },
    ],
  },
  {
    type: "category",
    title: "Admin",
    children: [
      {
        type: "link",
        path: "/admin-widget-injection-zones",
        title: "Admin Widget Injection Zones",
      },
      {
        type: "link",
        path: "/admin-components",
        title: "Admin Components",
        isChildSidebar: true,
        children: [
          {
            type: "category",
            title: "Layouts",
            autogenerate_path: "/admin-components/layouts",
          },
          {
            type: "category",
            title: "Components",
            autogenerate_path: "/admin-components/components",
          },
        ],
      },
    ],
  },
  {
    type: "category",
    title: "Lists",
    children: [
      {
        type: "link",
        path: "/medusa-container-resources",
        title: "Container Dependencies",
      },
      {
        type: "link",
        path: "/events-reference",
        title: "Events List",
      },
    ],
  },
  {
    type: "category",
    title: "References",
    children: referencesSidebar,
  },
  {
    type: "category",
    title: "Other",
    children: [
      {
        type: "sub-category",
        title: "Contribution Guidelines",
        children: [
          {
            type: "link",
            path: "/contribution-guidelines/docs",
            title: "Docs",
          },
          {
            type: "link",
            path: "/contribution-guidelines/admin-translations",
            title: "Admin Translations",
          },
        ],
      },
      {
        type: "link",
        path: "/usage",
        title: "Usage",
      },
    ],
  },
])
