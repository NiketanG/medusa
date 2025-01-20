  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import CaretMaximizeDiagonal from "../caret-maximize-diagonal"

  describe("CaretMaximizeDiagonal", () => {
    it("should render the icon without errors", async () => {
      render(<CaretMaximizeDiagonal data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })