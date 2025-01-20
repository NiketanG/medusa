  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import Amazon from "../amazon"

  describe("Amazon", () => {
    it("should render the icon without errors", async () => {
      render(<Amazon data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })