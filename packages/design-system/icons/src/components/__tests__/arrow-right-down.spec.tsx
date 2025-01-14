  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import ArrowRightDown from "../arrow-right-down"

  describe("ArrowRightDown", () => {
    it("should render the icon without errors", async () => {
      render(<ArrowRightDown data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })