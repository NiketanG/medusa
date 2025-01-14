import {
  Application,
  Context,
  Converter,
  DeclarationReflection,
  ParameterType,
  ProjectReflection,
  ReferenceType,
  ReflectionKind,
  UnknownType,
} from "typedoc"
import { RELATION_NAMES, getDmlProperties, isDmlEntity } from "utils"

export class DmlRelationsResolver {
  private app: Application
  private dmlReflectionsAndProperties: {
    reflection: DeclarationReflection
    properties: DeclarationReflection[]
  }[]
  private relationProperties: {
    property: DeclarationReflection
    target: DeclarationReflection
  }[]

  constructor(app: Application) {
    this.app = app
    this.dmlReflectionsAndProperties = []
    this.relationProperties = []

    this.app.options.addDeclaration({
      name: "resolveDmlRelations",
      help: "Whether to enable resolving DML relations.",
      type: ParameterType.Boolean,
      defaultValue: false,
    })

    this.app.converter.on(
      Converter.EVENT_RESOLVE_BEGIN,
      this.resolveRelationReferences.bind(this),
      1
    )
  }

  resolveRelationReferences(context: Context) {
    if (!this.app.options.getValue("resolveDmlRelations")) {
      return
    }

    for (const reflection of context.project.getReflectionsByKind(
      ReflectionKind.Variable
    )) {
      if (
        !(reflection instanceof DeclarationReflection) ||
        !isDmlEntity(reflection) ||
        reflection.type?.type !== "reference"
      ) {
        continue
      }

      const properties = getDmlProperties(reflection.type)
      this.dmlReflectionsAndProperties.push({
        reflection,
        properties,
      })
    }

    this.dmlReflectionsAndProperties.forEach(({ properties }) => {
      properties.forEach((property) => {
        if (
          property.type?.type !== "reference" ||
          !RELATION_NAMES.includes(property.type.name)
        ) {
          return
        }

        // try to find the reflection that this relation points to
        const relatedReflectionType = property.type.typeArguments?.[0]
        if (
          relatedReflectionType?.type !== "reflection" ||
          !relatedReflectionType.declaration.signatures?.length ||
          !relatedReflectionType.declaration.signatures[0].type
        ) {
          return
        }

        const reflectionType =
          relatedReflectionType.declaration.signatures[0].type.type ===
          "unknown"
            ? this.tryToParseUnknownType(
                relatedReflectionType.declaration.signatures[0].type,
                context.project
              )?.type
            : relatedReflectionType.declaration.signatures[0].type

        if (
          reflectionType?.type !== "reference" &&
          (reflectionType?.type !== "query" ||
            !(
              reflectionType.queryType.reflection instanceof
              DeclarationReflection
            ) ||
            reflectionType.queryType.reflection.type?.type !== "reference")
        ) {
          return
        }

        const relatedReflection = this.findReflectionMatchingProperties(
          getDmlProperties(
            reflectionType.type === "reference"
              ? reflectionType
              : ((reflectionType.queryType.reflection as DeclarationReflection)
                  .type as ReferenceType)
          )
        )

        if (!relatedReflection) {
          return
        }

        // replace type argument with reference to related reflection
        property.type.typeArguments = [
          ReferenceType.createResolvedReference(
            relatedReflection.name,
            relatedReflection,
            context.project
          ),
        ]
        this.relationProperties.push({
          property,
          target: relatedReflection,
        })
      })
    })
  }

  findReflectionMatchingProperties(
    properties: DeclarationReflection[]
  ): DeclarationReflection | undefined {
    return this.dmlReflectionsAndProperties.find(({ properties: refProps }) => {
      return properties.every((property) => {
        return refProps.find(
          (refProp) =>
            refProp.name === property.name &&
            (refProp.type as ReferenceType).name ===
              (property.type as ReferenceType).name
        )
      })
    })?.reflection
  }

  tryToParseUnknownType(
    unknownType: UnknownType,
    project: ProjectReflection
  ): DeclarationReflection | undefined {
    const regex =
      /^DmlEntity<DMLEntitySchemaBuilder.+>, "(?<modelName>[a-zA-Z]+)">$/

    const regexMatches = regex.exec(unknownType.name)

    if (!regexMatches?.groups?.modelName) {
      return
    }

    const reflection = project.getChildByName(regexMatches.groups.modelName)

    return reflection instanceof DeclarationReflection ? reflection : undefined
  }
}
