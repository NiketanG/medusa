  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import CaretMinimizeDiagonal from "../caret-minimize-diagonal"

  describe("CaretMinimizeDiagonal", () => {
    it("should render the icon without errors", async () => {
      render(<CaretMinimizeDiagonal data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })