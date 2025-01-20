/** @type {import('types').RawSidebarItem[]} */
export const troubleshootingSidebar = [
  {
    type: "category",
    title: "Installation",
    children: [
      {
        type: "link",
        path: "/troubleshooting/create-medusa-app-errors",
        title: "Create Medusa App Errors",
      },
      {
        type: "link",
        path: "/troubleshooting/errors-installing-cli",
        title: "Errors Installing CLI",
      },
      {
        type: "link",
        path: "/troubleshooting/general-errors",
        title: "General Errors",
      },
    ],
  },
  {
    type: "category",
    title: "Medusa Application",
    children: [
      {
        type: "link",
        path: "/troubleshooting/eaddrinuse",
        title: "EADDRINUSE Error",
      },
      {
        type: "link",
        path: "/troubleshooting/database-errors",
        title: "Database Errors",
      },
      {
        type: "link",
        path: "/troubleshooting/dist-imports",
        title: "Importing from /dist",
      },
      {
        type: "link",
        path: "/troubleshooting/workflow-errors",
        title: "Workflow Errors",
      },
    ],
  },
  {
    type: "category",
    title: "Admin Development",
    children: [
      {
        type: "link",
        path: "/troubleshooting/medusa-admin/no-widget-route",
        title: "Widget or Route not Showing",
      },
    ],
  },
  {
    type: "category",
    title: "Upgrade",
    children: [
      {
        type: "link",
        path: "/troubleshooting/errors-after-upgrading",
        title: "Errors After Upgrading",
      },
    ],
  },
  {
    type: "category",
    title: "Frontend",
    children: [
      {
        type: "link",
        path: "/troubleshooting/cors-errors",
        title: "CORS Errors",
      },
    ],
  },
  {
    type: "category",
    title: "Integrations",
    hasTitleStyling: true,
    children: [
      {
        type: "link",
        path: "/troubleshooting/s3",
        title: "S3 Module Provider Errors",
      },
    ],
  },
]
