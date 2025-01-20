  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import ScrollText from "../scroll-text"

  describe("ScrollText", () => {
    it("should render the icon without errors", async () => {
      render(<ScrollText data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })