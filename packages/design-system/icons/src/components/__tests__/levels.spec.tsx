  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import Levels from "../levels"

  describe("Levels", () => {
    it("should render the icon without errors", async () => {
      render(<Levels data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })