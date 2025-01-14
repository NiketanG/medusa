import { DeclarationReflection, ParameterReflection } from "typedoc"

export default class Examples {
  generateHookExample({
    hookName,
    workflowName,
    parameter,
  }: {
    hookName: string
    workflowName: string
    parameter: ParameterReflection
  }): string {
    let str = `import { ${workflowName} } from "@medusajs/medusa/core-flows"\n\n`

    str += `${workflowName}.hooks.${hookName}(\n\t(async ({`

    if (
      parameter.type?.type === "reference" &&
      parameter.type.reflection instanceof DeclarationReflection &&
      parameter.type.reflection.children
    ) {
      parameter.type.reflection.children.forEach((childParam, index) => {
        if (index > 0) {
          str += `,`
        }

        str += ` ${childParam.name}`
      })
    }

    str += ` }, { container }) => {\n\t\t//TODO\n\t})\n)`

    return str
  }
}
