import { pluralize } from "../plurailze"

describe("pluralize", function () {
  it("should pluralize any words", function () {
    const words = [
      "apple",
      "box",
      "day",
      "country",
      "baby",
      "knife",
      "hero",
      "potato",
      "address",
      "info",
    ]

    const expectedOutput = [
      "apples",
      "boxes",
      "days",
      "countries",
      "babies",
      "knives",
      "heroes",
      "potatoes",
      "addresses",
      "info",
    ]

    words.forEach((word, index) => {
      expect(pluralize(word)).toBe(expectedOutput[index])
    })
  })
})
