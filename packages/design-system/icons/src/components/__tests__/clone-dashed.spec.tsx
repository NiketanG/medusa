  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import CloneDashed from "../clone-dashed"

  describe("CloneDashed", () => {
    it("should render the icon without errors", async () => {
      render(<CloneDashed data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })