  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import Sendgrid from "../sendgrid"

  describe("Sendgrid", () => {
    it("should render the icon without errors", async () => {
      render(<Sendgrid data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })