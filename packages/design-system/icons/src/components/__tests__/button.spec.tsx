  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import Button from "../button"

  describe("Button", () => {
    it("should render the icon without errors", async () => {
      render(<Button data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })