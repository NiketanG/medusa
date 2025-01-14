/* eslint-disable @typescript-eslint/ban-ts-comment */
import AreaProvider from "@/providers/area"
import StoreContent from "@/markdown/store.mdx"
import Tags from "@/components/Tags"
import PageTitleProvider from "@/providers/page-title"
import { getBaseSpecs } from "../../lib"
import BaseSpecsProvider from "../../providers/base-specs"

const StorePage = async () => {
  const data = await getBaseSpecs("store")

  return (
    <BaseSpecsProvider baseSpecs={data}>
      <AreaProvider area={"store"}>
        <PageTitleProvider>
          {/* @ts-ignore React v19 doesn't see MDX as valid component */}
          <StoreContent />
          <Tags tags={data?.tags} />
        </PageTitleProvider>
      </AreaProvider>
    </BaseSpecsProvider>
  )
}

export default StorePage

export function generateMetadata() {
  return {
    title: `Medusa Store API Reference`,
    description: `REST API reference for the Medusa v2 store API, with code snippets and examples.`,
    metadataBase: process.env.NEXT_PUBLIC_BASE_URL,
  }
}
