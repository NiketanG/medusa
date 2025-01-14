  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import Webshipper from "../webshipper"

  describe("Webshipper", () => {
    it("should render the icon without errors", async () => {
      render(<Webshipper data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })