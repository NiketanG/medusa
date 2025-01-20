  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import MediaPlay from "../media-play"

  describe("MediaPlay", () => {
    it("should render the icon without errors", async () => {
      render(<MediaPlay data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })