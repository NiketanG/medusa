/* eslint-disable @typescript-eslint/ban-ts-comment */
import AreaProvider from "@/providers/area"
import AdminContent from "@/markdown/admin.mdx"
import Tags from "@/components/Tags"
import PageTitleProvider from "@/providers/page-title"
import { getBaseSpecs } from "../../lib"
import BaseSpecsProvider from "../../providers/base-specs"
import React from "react"

const AdminPage = async () => {
  const data = await getBaseSpecs("admin")

  return (
    <BaseSpecsProvider baseSpecs={data}>
      <AreaProvider area={"admin"}>
        <PageTitleProvider>
          {/* @ts-ignore React v19 doesn't see MDX as valid component */}
          <AdminContent />
          <Tags tags={data?.tags} />
        </PageTitleProvider>
      </AreaProvider>
    </BaseSpecsProvider>
  )
}

export default AdminPage

export function generateMetadata() {
  return {
    title: `Medusa Admin API Reference`,
    description: `REST API reference for the Medusa v2 admin API, with code snippets and examples.`,
    metadataBase: process.env.NEXT_PUBLIC_BASE_URL,
  }
}
