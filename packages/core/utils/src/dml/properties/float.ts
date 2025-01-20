import { BaseProperty } from "./base"

/**
 * The FloatProperty is used to define values with decimal
 * places.
 */
export class FloatProperty extends BaseProperty<number> {
  protected dataType = {
    name: "float",
  } as const

  static isFloatProperty(obj: any): obj is FloatProperty {
    return obj?.dataType?.name === "float"
  }
}
