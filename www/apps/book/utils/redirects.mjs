/**
 * @returns {Promise<import("next").Redirect[]>}
 */
const redirects = async () => {
  return [
    {
      source: "/v2/:path*",
      destination: "/:path*",
      permanent: true,
    },
    {
      source: "/recipes/:path*",
      destination: "/resources/recipes",
      permanent: true,
    },
    {
      source: "/plugins/:path*",
      destination: "/v1/plugins/:path*",
      permanent: true,
    },
    {
      source: "/medusa-react/:path*",
      destination: "/v1/medusa-react/:path*",
      permanent: true,
    },
    {
      source: "/learn/customization/extend-models/:path*",
      destination: "/learn/customization/extend-features/:path*",
      permanent: true,
    },
    {
      source: "/learn/advanced-development/architecture/overview",
      destination: "/learn/introduction/architecture",
      permanent: true,
    },
    {
      source: "/learn/first-customizations",
      destination: "/learn/customization",
      permanent: true,
    },
    {
      source: "/learn/basics/medusa-container",
      destination: "/learn/fundamentals/medusa-container",
      permanent: true,
    },
    {
      source: "/learn/basics/modules",
      destination: "/learn/fundamentals/modules",
      permanent: true,
    },
    {
      source: "/learn/basics/modules-directory-structure",
      destination: "/learn/fundamentals/modules/modules-directory-structure",
      permanent: true,
    },
    {
      source: "/learn/basics/loaders",
      destination: "/learn/fundamentals/modules/loaders",
      permanent: true,
    },
    {
      source: "/learn/basics/commerce-modules",
      destination: "/learn/fundamentals/modules/commerce-modules",
      permanent: true,
    },
    {
      source: "/learn/advanced-development/architecture/architectural-modules",
      destination: "/learn/fundamentals/modules/architectural-modules",
      permanent: true,
    },
    {
      source: "/learn/basics/api-routes",
      destination: "/learn/fundamentals/api-routes",
      permanent: true,
    },
    {
      source: "/learn/basics/workflows",
      destination: "/learn/fundamentals/workflows",
      permanent: true,
    },
    {
      source: "/learn/basics/events-and-subscribers",
      destination: "/learn/fundamentals/events-and-subscribers",
      permanent: true,
    },
    {
      source: "/learn/basics/scheduled-jobs",
      destination: "/learn/fundamentals/scheduled-jobs",
      permanent: true,
    },
    {
      source: "/learn/basics/project-directories-files",
      destination: "/learn/installation#project-files",
      permanent: true,
    },
    {
      source: "/learn/basics/admin-customizations",
      destination: "/learn/fundamentals/admin/widgets",
      permanent: true,
    },
    {
      source: "/learn/advanced-development/:path*",
      destination: "/learn/fundamentals/:path*",
      permanent: true,
    },
    {
      source: "/learn/storefront-development/nextjs-starter",
      destination: "/resources/nextjs-starter",
      permanent: true,
    },
    {
      source: "/learn/fundamentals/module-links/remote-link",
      destination: "/learn/fundamentals/module-links/link",
      permanent: true,
    },
  ]
}

export default redirects
