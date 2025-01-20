  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import TaxInclusive from "../tax-inclusive"

  describe("TaxInclusive", () => {
    it("should render the icon without errors", async () => {
      render(<TaxInclusive data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })