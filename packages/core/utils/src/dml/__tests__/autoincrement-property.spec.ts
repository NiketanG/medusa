import { expectTypeOf } from "expect-type"
import { AutoIncrementProperty } from "../properties/autoincrement"

describe("Autoincrement property", () => {
  test("create autoincrement property type", () => {
    const property = new AutoIncrementProperty()

    expectTypeOf(property["$dataType"]).toEqualTypeOf<number>()
    expect(property.parse("display_id")).toEqual({
      fieldName: "display_id",
      dataType: {
        name: "serial",
        options: {},
      },
      nullable: false,
      computed: false,
      indexes: [],
      relationships: [],
    })
  })
})
