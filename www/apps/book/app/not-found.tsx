/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TightLayout } from "docs-ui"
import Feedback from "../components/Feedback"
import EditButton from "../components/EditButton"
import NotFoundContent from "./_not-found.mdx"
import Providers from "../providers"

const NotFoundPage = () => {
  return (
    <TightLayout
      sidebarProps={{
        expandItems: true,
      }}
      showPagination={true}
      feedbackComponent={<Feedback className="my-2" />}
      editComponent={<EditButton />}
      ProvidersComponent={Providers}
    >
      {/* @ts-ignore React v19 doesn't recognize MDX import as component */}
      <NotFoundContent />
    </TightLayout>
  )
}

export default NotFoundPage
