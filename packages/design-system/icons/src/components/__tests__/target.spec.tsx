  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import Target from "../target"

  describe("Target", () => {
    it("should render the icon without errors", async () => {
      render(<Target data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })