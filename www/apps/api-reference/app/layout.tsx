import "./globals.css"
import Providers from "../providers"
import { BareboneLayout, WideLayout } from "docs-ui"
import { Inter, Roboto_Mono } from "next/font/google"
import clsx from "clsx"
import { Metadata } from "next"

const ogImage =
  "https://res.cloudinary.com/dza7lstvk/image/upload/v1732200992/Medusa%20Resources/opengraph-image_daq6nx.jpg"

export const metadata: Metadata = {
  title: "Medusa API Reference",
  description: "Check out Medusa's API reference",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  openGraph: {
    images: [
      {
        url: ogImage,
        type: "image/jpeg",
        height: "1260",
        width: "2400",
      },
    ],
  },
  twitter: {
    images: [
      {
        url: ogImage,
        type: "image/jpeg",
        height: "1260",
        width: "2400",
      },
    ],
  },
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BareboneLayout
      htmlClassName={clsx(inter.variable, robotoMono.variable)}
      gaId={process.env.NEXT_PUBLIC_GA_ID}
    >
      <WideLayout
        sidebarProps={{
          expandItems: false,
        }}
        showToc={false}
        showBreadcrumbs={false}
        ProvidersComponent={Providers}
      >
        {children}
      </WideLayout>
    </BareboneLayout>
  )
}
