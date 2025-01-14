import {
  brokenLinkCheckerPlugin,
  localLinksRehypePlugin,
  prerequisitesLinkFixerPlugin,
  typeListLinkFixerPlugin,
  workflowDiagramLinkFixerPlugin,
} from "remark-rehype-plugins"

import bundleAnalyzer from "@next/bundle-analyzer"
import mdx from "@next/mdx"
import mdxPluginOptions from "./mdx-options.mjs"
import path from "node:path"

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [
      [
        brokenLinkCheckerPlugin,
        {
          crossProjects: {
            docs: {
              projectPath: path.resolve("..", "book"),
            },
            ui: {
              projectPath: path.resolve("..", "ui"),
              contentPath: "src/content/docs",
            },
          },
        },
      ],
      ...mdxPluginOptions.options.rehypePlugins,
      [localLinksRehypePlugin],
      [typeListLinkFixerPlugin],
      [
        workflowDiagramLinkFixerPlugin,
        {
          checkLinksType: "value",
        },
      ],
      [
        prerequisitesLinkFixerPlugin,
        {
          checkLinksType: "value",
        },
      ],
    ],
    remarkPlugins: mdxPluginOptions.options.remarkPlugins,
    jsx: true,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

  transpilePackages: ["docs-ui"],

  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/resources",
  async redirects() {
    return [
      {
        source: "/commerce-modules/order/relations-to-other-modules",
        destination: "/commerce-modules/order/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/payment/relations-to-other-modules",
        destination: "/commerce-modules/payment/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/api-key/relations-to-other-modules",
        destination: "/commerce-modules/api-key/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/cart/relations-to-other-modules",
        destination: "/commerce-modules/cart/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/fulfillment/relations-to-other-modules",
        destination: "/commerce-modules/fulfillment/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/inventory/relations-to-other-modules",
        destination: "/commerce-modules/inventory/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/region/relations-to-other-modules",
        destination: "/commerce-modules/region/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/sales-channel/relations-to-other-modules",
        destination: "/commerce-modules/sales-channel/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/stock-location/relations-to-other-modules",
        destination: "/commerce-modules/stock-location/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/pricing/relations-to-other-modules",
        destination: "/commerce-modules/pricing/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/product/relations-to-other-modules",
        destination: "/commerce-modules/product/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/commerce-modules/promotion/relations-to-other-modules",
        destination: "/commerce-modules/promotion/links-to-other-modules",
        permanent: true,
      },
      {
        source: "/deployment/admin/vercel",
        destination: "/deployment",
        permanent: true,
      },
    ]
  },
  outputFileTracingExcludes: {
    "*": ["node_modules/@medusajs/icons"],
  },
  experimental: {
    optimizePackageImports: ["@medusajs/icons", "@medusajs/ui"],
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

export default withMDX(withBundleAnalyzer(nextConfig))
