  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import HandTruck from "../hand-truck"

  describe("HandTruck", () => {
    it("should render the icon without errors", async () => {
      render(<HandTruck data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })