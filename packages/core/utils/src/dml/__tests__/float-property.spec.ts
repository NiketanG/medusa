import { expectTypeOf } from "expect-type"
import { FloatProperty } from "../properties"

describe("Float property", () => {
  test("create float property type", () => {
    const property = new FloatProperty()

    expectTypeOf(property["$dataType"]).toEqualTypeOf<number>()
    expect(property.parse("rate")).toEqual({
      fieldName: "rate",
      dataType: {
        name: "float",
      },
      nullable: false,
      computed: false,
      indexes: [],
      relationships: [],
    })
  })
})
