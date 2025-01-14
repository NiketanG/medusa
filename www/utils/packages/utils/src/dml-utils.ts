import { DeclarationReflection, ReferenceType } from "typedoc"

export function isDmlEntity(reflection: DeclarationReflection) {
  if (reflection.type?.type !== "reference") {
    return false
  }

  return reflection.type.name === "DmlEntity"
}

export const RELATION_NAMES = [
  "HasOne",
  "HasMany",
  "BelongsTo",
  "ManyToMany",
  "HasOneWithForeignKey",
]

export function isDmlRelation(reflection: DeclarationReflection) {
  if (reflection.type?.type !== "reference") {
    return false
  }

  const reflectionType = reflection.type

  return RELATION_NAMES.some((relatioName) =>
    reflectionType.name.startsWith(relatioName)
  )
}

const MAX_LEVEL = 2

export function getDmlProperties(
  reflectionType: ReferenceType,
  level = 1
): DeclarationReflection[] {
  if (level > MAX_LEVEL) {
    return []
  }
  if (
    !reflectionType.typeArguments?.length ||
    reflectionType.typeArguments[0].type !== "reference" ||
    reflectionType.typeArguments[0].name !== "DMLEntitySchemaBuilder" ||
    !reflectionType.typeArguments[0].typeArguments?.length ||
    (reflectionType.typeArguments[0].typeArguments[0].type !== "reflection" &&
      reflectionType.typeArguments[0].typeArguments[0].type !== "reference")
  ) {
    return []
  }

  let schemaType: DeclarationReflection | undefined

  if (reflectionType.typeArguments[0].typeArguments[0].type === "reflection") {
    schemaType = reflectionType.typeArguments[0].typeArguments[0].declaration
  } else if (
    reflectionType.typeArguments[0].typeArguments[0].reflection instanceof
      DeclarationReflection &&
    reflectionType.typeArguments[0].typeArguments[0].reflection.type?.type ===
      "reflection"
  ) {
    schemaType =
      reflectionType.typeArguments[0].typeArguments[0].reflection.type
        .declaration
  }

  return schemaType?.children || []
}

export function getDmlRelationProperties(
  reflectionType: ReferenceType
): DeclarationReflection[] {
  if (
    !reflectionType.typeArguments?.length ||
    reflectionType.typeArguments[0].type !== "reference" ||
    !(
      reflectionType.typeArguments[0].reflection instanceof
      DeclarationReflection
    ) ||
    reflectionType.typeArguments[0].reflection.type?.type !== "reference"
  ) {
    return []
  }

  return getDmlProperties(reflectionType.typeArguments[0].reflection.type)
}
