  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import TextHighlight from "../text-highlight"

  describe("TextHighlight", () => {
    it("should render the icon without errors", async () => {
      render(<TextHighlight data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })