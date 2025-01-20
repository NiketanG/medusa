  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import TagIllustration from "../tag-illustration"

  describe("TagIllustration", () => {
    it("should render the icon without errors", async () => {
      render(<TagIllustration data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })