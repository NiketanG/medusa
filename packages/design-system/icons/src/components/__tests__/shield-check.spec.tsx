  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import ShieldCheck from "../shield-check"

  describe("ShieldCheck", () => {
    it("should render the icon without errors", async () => {
      render(<ShieldCheck data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })