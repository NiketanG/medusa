  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import HouseStar from "../house-star"

  describe("HouseStar", () => {
    it("should render the icon without errors", async () => {
      render(<HouseStar data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })