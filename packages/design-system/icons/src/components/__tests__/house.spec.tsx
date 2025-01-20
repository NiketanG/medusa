  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import House from "../house"

  describe("House", () => {
    it("should render the icon without errors", async () => {
      render(<House data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })