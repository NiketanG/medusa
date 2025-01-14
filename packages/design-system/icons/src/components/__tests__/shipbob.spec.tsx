  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import Shipbob from "../shipbob"

  describe("Shipbob", () => {
    it("should render the icon without errors", async () => {
      render(<Shipbob data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })