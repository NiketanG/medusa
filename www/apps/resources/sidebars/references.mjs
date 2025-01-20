/** @type {import('types').RawSidebarItem[]} */
export const referencesSidebar = [
  {
    type: "link",
    path: "/references/workflows",
    title: "Workflows SDK",
    childSidebarTitle: "Workflows SDK Reference",
    isChildSidebar: true,
    children: [
      {
        type: "category",
        title: "Functions",
        autogenerate_path: "/references/workflows/functions",
      },
    ],
  },
  {
    type: "link",
    path: "/references/data-model",
    title: "Data Model Language",
    childSidebarTitle: "Data Model Language Reference",
    isChildSidebar: true,
    children: [
      {
        type: "link",
        path: "/references/data-model/define",
        title: "Define Method",
      },
      {
        type: "separator",
      },
      {
        type: "category",
        title: "Property Types",
        autogenerate_path: "/references/dml/Property_Types/methods",
      },
      {
        type: "category",
        title: "Relationship Methods",
        autogenerate_path: "/references/dml/Relationship_Methods/methods",
      },
      {
        type: "category",
        title: "Model Methods",
        autogenerate_path: "/references/dml/Model_Methods/methods",
      },
      {
        type: "category",
        title: "Property Configuration Methods",
        autogenerate_path:
          "/references/dml/Property_Configuration_Methods/methods",
      },
    ],
  },
  {
    type: "link",
    path: "/service-factory-reference",
    title: "Service Factory",
    isChildSidebar: true,
    children: [
      {
        type: "category",
        title: "Methods",
        autogenerate_path: "/service-factory-reference/methods",
      },
      {
        type: "category",
        title: "Tips",
        autogenerate_path: "/service-factory-reference/tips",
      },
    ],
  },
  {
    type: "link",
    path: "/references/helper-steps",
    title: "Helper Steps",
    isChildSidebar: true,
    autogenerate_path: "/references/helper_steps/functions",
  },
  {
    type: "link",
    title: "Core Workflows",
    path: "/medusa-workflows-reference",
    isChildSidebar: true,
    custom_autogenerate: "core-flows",
  },
  {
    type: "link",
    title: "Testing Framework",
    path: "/test-tools-reference",
    isChildSidebar: true,
    children: [
      {
        type: "category",
        title: "Functions",
        children: [
          {
            type: "link",
            title: "medusaIntegrationTestRunner",
            path: "/test-tools-reference/medusaIntegrationTestRunner",
          },
          {
            type: "link",
            title: "moduleIntegrationTestRunner",
            path: "/test-tools-reference/moduleIntegrationTestRunner",
          },
        ],
      },
    ],
  },
]
