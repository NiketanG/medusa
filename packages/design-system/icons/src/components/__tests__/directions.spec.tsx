  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import Directions from "../directions"

  describe("Directions", () => {
    it("should render the icon without errors", async () => {
      render(<Directions data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })