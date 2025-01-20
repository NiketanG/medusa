import { expectTypeOf } from "expect-type"
import { TextProperty } from "../properties/text"
import { HasOne } from "../relations/has-one"
import { HasOneWithForeignKey } from "../relations/has-one-fk"

describe("HasOne relationship", () => {
  test("define hasOne relationship", () => {
    const user = {
      username: new TextProperty(),
    }

    const entityRef = () => user
    const relationship = new HasOne(entityRef, {})

    expectTypeOf(relationship["$dataType"]).toEqualTypeOf<() => typeof user>()
    expect(relationship.parse("user")).toEqual({
      name: "user",
      type: "hasOne",
      nullable: false,
      options: {},
      searchable: false,
      entity: entityRef,
    })
  })

  test("mark relationship as nullable", () => {
    const user = {
      username: new TextProperty(),
    }

    const entityRef = () => user
    const relationship = new HasOne(entityRef, {}).nullable()

    expectTypeOf(relationship["$dataType"]).toEqualTypeOf<
      (() => typeof user) | null
    >()
    expect(relationship.parse("user")).toEqual({
      name: "user",
      type: "hasOne",
      nullable: true,
      options: {},
      searchable: false,
      entity: entityRef,
    })
  })

  test("should identify has one relationship", () => {
    const user = {
      username: new TextProperty(),
    }

    const entityRef = () => user
    let relationship = new HasOne(entityRef, {})

    expect(HasOne.isHasOne(relationship)).toEqual(true)

    relationship = {} as any

    expect(HasOne.isHasOne(relationship)).toEqual(false)
  })

  test("enable foreign keys for has one relationship", () => {
    const user = {
      username: new TextProperty(),
    }

    const entityRef = () => user
    const relationship = new HasOneWithForeignKey(entityRef, {})

    expectTypeOf(relationship["$dataType"]).toEqualTypeOf<() => typeof user>()
    expect(relationship.parse("user")).toEqual({
      name: "user",
      type: "hasOneWithFK",
      nullable: false,
      options: {},
      searchable: false,
      entity: entityRef,
    })
  })
})
