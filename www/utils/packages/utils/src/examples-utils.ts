import { faker } from "@faker-js/faker"
import {
  DeclarationReflection,
  LiteralType,
  ReflectionFlags,
  SomeType,
} from "typedoc"
import * as prettier from "prettier"
import { getTypeChildren } from "./get-type-children.js"

const MAX_LEVEL = 7

export function isReflectionTypeOptional(
  reflection: DeclarationReflection
): boolean {
  return "flags" in reflection
    ? (reflection.flags as ReflectionFlags).isOptional
    : false
}

function getReflectionTypeFakeValue({
  reflectionType,
  name,
  level = 1,
}: {
  reflectionType: SomeType
  name: string
  level?: number
}): unknown {
  if (reflectionType.type === "literal") {
    return getFakeStrValue({
      name,
      type: typeof reflectionType.value,
    })
  }

  if (reflectionType.type === "intrinsic") {
    return getFakeStrValue({
      name,
      type: reflectionType.name,
    })
  }

  if (level > MAX_LEVEL) {
    return reflectionType.type === "array" ? [] : {}
  }

  if (reflectionType.type === "array") {
    return new Array(
      getReflectionTypeFakeValue({
        reflectionType: reflectionType.elementType,
        name,
        level: level + 1,
      })
    )
  }

  if (reflectionType.type === "reflection") {
    if (reflectionType.declaration.type) {
      return getReflectionTypeFakeValue({
        reflectionType: reflectionType.declaration.type,
        name,
        level: level + 1,
      })
    }

    if (reflectionType.declaration.children) {
      const obj: Record<string, unknown> = {}

      reflectionType.declaration.children.forEach((child) => {
        if (!child.type || isReflectionTypeOptional(child)) {
          return
        }

        obj[child.name] = getReflectionTypeFakeValue({
          reflectionType: child.type,
          name: child.name,
          level: level + 1,
        })
      })

      return obj
    }

    return {}
  }

  if (
    reflectionType.type === "reference" &&
    reflectionType.reflection instanceof DeclarationReflection
  ) {
    if (reflectionType.reflection.name === "BigNumberInput") {
      return getFakeStrValue({
        name,
        type: "number",
      })
    } else if (reflectionType.reflection.name === "Record") {
      return getFakeStrValue({
        name,
        type: "object",
      })
    }
    const obj: Record<string, unknown> = {}
    const children = getTypeChildren({
      reflectionType: reflectionType,
      project: reflectionType.reflection.project,
    })
    if (!children.length) {
      // check whether type is enum
      if (reflectionType.reflection.type?.type === "union") {
        const isEnum = reflectionType.reflection.type.types.every((type) => {
          return type.type === "literal" && typeof type.value === "string"
        })

        if (isEnum) {
          return getFakeStrValue({
            name,
            type: "enum",
            data: {
              enum: (
                reflectionType.reflection.type.types as LiteralType[]
              ).reduce(
                (acc, type) => {
                  acc[type.value as string] = type.value as string
                  return acc
                },
                {} as Record<string, string>
              ),
            },
          })
        }
      }

      // try to retrieve the type from the reflection
      if (reflectionType.reflection.type) {
        return getReflectionTypeFakeValue({
          reflectionType: reflectionType.reflection.type,
          name,
          level: level + 1,
        })
      }
    }

    children.forEach((child) => {
      if (!child.type || isReflectionTypeOptional(child)) {
        return
      }

      obj[child.name] = getReflectionTypeFakeValue({
        reflectionType: child.type,
        name: child.name,
        level: level + 1,
      })
    })

    return obj
  }

  if (reflectionType.type === "intersection") {
    const obj: Record<string, unknown> = {}

    reflectionType.types?.forEach((type) => {
      const value = getReflectionTypeFakeValue({
        reflectionType: type,
        name,
        level: level + 1,
      })

      if (typeof value === "object") {
        Object.assign(obj, value)
      } else {
        obj[name] = value
      }
    })

    return obj
  }

  if (reflectionType.type === "union" && reflectionType.types.length) {
    // check if it's type Record<>
    const isRecord =
      reflectionType.types[0].type === "reference" &&
      reflectionType.types[0].name === "Record"

    if (isRecord) {
      return getFakeStrValue({
        name,
        type: "object",
      })
    }

    return getReflectionTypeFakeValue({
      reflectionType: reflectionType.types[0],
      name,
      level: level + 1,
    })
  }

  // TODO: handle more types
  return "{value}"
}

export function getReflectionTypeFakeValueStr({
  reflectionType,
  name,
}: {
  reflectionType: SomeType
  name: string
}): string {
  const value = getReflectionTypeFakeValue({
    reflectionType,
    name,
  })

  return JSON.stringify(value, null, 2)
}

export function getFakeStrValue({
  name,
  type,
  format,
  data,
}: {
  /**
   * The name of the property. It can help when generating the fake value.
   * For example, if the name is `id`, the fake value generated will be of the format `id_<randomstring>`.
   */
  name: string
  /**
   * The type of the property, such as `string` or `boolean`.
   */
  type: string
  /**
   * The format of the property, useful for OAS. For example, `date-time`.
   */
  format?: string
  /**
   * Additional data to help generate the fake value.
   */
  data?: {
    enum: Record<string, string>
  }
}): unknown {
  let value: unknown
  if (!format && name.endsWith("_at")) {
    format = "date-time"
  }

  switch (true) {
    case type === "string" && format === "date-time":
      value = faker.date.future().toISOString()
      break
    case type === "boolean":
      value = faker.datatype.boolean()
      break
    case type === "integer" || type === "number":
      value = faker.number.int({ min: 0, max: 50 })
      break
    case type === "array":
      value = []
      break
    case type === "enum" && data?.enum !== undefined:
      value = faker.helpers.enumValue(data.enum)
      break
    case type === "object":
      value = {}
      break
    case type === "string":
      value = faker.helpers.mustache(`{{${name}}}`, {
        id: () =>
          `id_${faker.string.alphanumeric({
            length: { min: 10, max: 20 },
          })}`,
        ids: () =>
          `id_${faker.string.alphanumeric({
            length: { min: 10, max: 20 },
          })}`,
        region_id: "reg_123",
        product_id: "prod_123",
        cart_id: "cart_123",
        order_id: "order_123",
        name: () => faker.person.firstName(),
        email: () => faker.internet.email(),
        password: () => faker.internet.password({ length: 8 }),
        currency_code: () => faker.finance.currencyCode().toLowerCase(),
        country_code: () => faker.location.countryCode().toLowerCase(),
        title: () => faker.lorem.word(),
        description: () => faker.lorem.sentence(),
        url: () => faker.internet.url(),
        phone: () => faker.phone.number(),
        created_by: () =>
          `user_${faker.string.alphanumeric({
            length: { min: 10, max: 20 },
          })}`,
        updated_by: () =>
          `user_${faker.string.alphanumeric({
            length: { min: 10, max: 20 },
          })}`,
        rejected_by: () =>
          `user_${faker.string.alphanumeric({
            length: { min: 10, max: 20 },
          })}`,
        canceled_by: () =>
          `user_${faker.string.alphanumeric({
            length: { min: 10, max: 20 },
          })}`,
        price: () => faker.commerce.price(),
        quantity: () => `${faker.number.int({ min: 1, max: 10 })}`,
      })
      try {
        value = faker.helpers.fake(value as string)
      } catch (e) {
        // Ignore error
      }
      value = (value as string).replace(`{{${name}}}`, "{value}")
  }

  return value !== undefined ? value : "{value}"
}

export async function formatWithPrettier(
  content: string,
  fileName: string
): Promise<string> {
  // load config of the file
  const prettierConfig = (await prettier.resolveConfig(fileName)) || undefined

  if (prettierConfig && !prettierConfig.parser) {
    prettierConfig.parser = "babel-ts"
  }

  return await prettier.format(content, prettierConfig)
}
