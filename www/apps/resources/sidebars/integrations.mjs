/** @type {import('types').RawSidebarItem[]} */
export const integrationsSidebar = [
  {
    type: "category",
    title: "Auth",
    children: [
      {
        type: "link",
        path: "/commerce-modules/auth/auth-providers/google",
        title: "Google",
      },
      {
        type: "link",
        path: "/commerce-modules/auth/auth-providers/github",
        title: "GitHub",
      },
    ],
  },
  {
    type: "category",
    title: "CMS",
    children: [
      {
        type: "link",
        path: "/integrations/guides/sanity",
        title: "Sanity",
      },
    ],
  },
  {
    type: "category",
    title: "File",
    children: [
      {
        type: "link",
        path: "/architectural-modules/file/s3",
        title: "AWS",
      },
    ],
  },
  {
    type: "category",
    title: "Fulfillment",
    children: [
      {
        type: "link",
        path: "/integrations/guides/shipstation",
        title: "ShipStation",
      },
    ],
  },
  {
    type: "category",
    title: "Notification",
    children: [
      {
        type: "link",
        path: "/architectural-modules/notification/sendgrid",
        title: "SendGrid",
      },
      {
        type: "link",
        path: "/integrations/guides/resend",
        title: "Resend",
      },
    ],
  },
  {
    type: "category",
    title: "Payment",
    children: [
      {
        type: "link",
        path: "/commerce-modules/payment/payment-provider/stripe",
        title: "Stripe",
      },
    ],
  },
]
