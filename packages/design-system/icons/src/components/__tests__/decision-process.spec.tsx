  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import DecisionProcess from "../decision-process"

  describe("DecisionProcess", () => {
    it("should render the icon without errors", async () => {
      render(<DecisionProcess data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })