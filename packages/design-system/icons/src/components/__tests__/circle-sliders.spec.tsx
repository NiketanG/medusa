  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import CircleSliders from "../circle-sliders"

  describe("CircleSliders", () => {
    it("should render the icon without errors", async () => {
      render(<CircleSliders data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })