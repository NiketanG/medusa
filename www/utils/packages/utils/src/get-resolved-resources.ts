import ts from "typescript"
import { getUniqueStrArray } from "./str-utils.js"
import { camelToWords } from "./str-formatting.js"

const RESOLVE_EXPRESSIONS = [`container.resolve`, `req.scope.resolve`]

export const getResolvedResources = (
  functionExpression: ts.ArrowFunction | ts.FunctionDeclaration
): string[] => {
  const resources: string[] = []

  if (!functionExpression.body) {
    return resources
  }

  const body = ts.isBlock(functionExpression.body)
    ? functionExpression.body
    : getBlockFromNode(functionExpression.body)

  if (!body) {
    return resources
  }

  body.statements.forEach((statement) => {
    if (!ts.isVariableStatement(statement)) {
      return
    }

    statement.declarationList.declarations.forEach((declaration) => {
      if (
        !declaration.initializer ||
        !ts.isCallExpression(declaration.initializer) ||
        !declaration.initializer.arguments.length ||
        !("name" in declaration.initializer.arguments[0])
      ) {
        return
      }

      const initializerText = declaration.initializer.getText()
      const isContainerExpression = RESOLVE_EXPRESSIONS.some((exp) =>
        initializerText.startsWith(exp)
      )

      if (!isContainerExpression) {
        return
      }

      const resourceName = normalizeResolvedResourceName(
        declaration.initializer.arguments[0]
      )
      if (!resourceName.length) {
        return
      }

      resources.push(resourceName)
    })
  })

  return resources
}

export const getResolvedResourcesOfStep = (
  expression: ts.CallExpression,
  stepId?: string
): string[] => {
  if (
    !expression.arguments ||
    expression.arguments.length < 2 ||
    (!ts.isArrowFunction(expression.arguments[1]) &&
      !ts.isFunctionDeclaration(expression.arguments[1]))
  ) {
    return stepId ? getResolvedResourcesByStepId(stepId) : []
  }
  const stepFunction: ts.ArrowFunction | ts.FunctionDeclaration =
    expression.arguments[1]

  let resources = getResolvedResources(stepFunction)

  if (
    expression.arguments.length === 3 &&
    (ts.isArrowFunction(expression.arguments[2]) ||
      ts.isFunctionDeclaration(expression.arguments[2]))
  ) {
    // get resolved resources of compensation function
    resources.push(...getResolvedResources(expression.arguments[2]))

    // make resources unique
    resources = getUniqueStrArray(resources)
  }

  if (!resources.length && stepId) {
    return getResolvedResourcesByStepId(stepId)
  }

  return resources
}

const normalizeResolvedResourceName = (expression: ts.Expression): string => {
  let name = ""
  switch (true) {
    case ts.isPropertyAccessExpression(expression):
      name = expression.name.getText()
      break
    case ts.isStringLiteral(expression):
      name = camelToWords(expression.getText())
  }
  return name.toLowerCase().replaceAll("_", " ")
}

const getBlockFromNode = (node: ts.Node): ts.Block | undefined => {
  if ("body" in node) {
    if (ts.isBlock(node.body as ts.Node)) {
      return node.body as ts.Block
    }
    return getBlockFromNode(node.body as ts.Node)
  }

  if ("expression" in node) {
    return getBlockFromNode(node.expression as ts.Node)
  }

  return undefined
}

/**
 * Some steps like useQueryGraphStep are not possible
 * to detect due to their implementation. For those,
 * we have static resolutions
 */
const STEPS_RESOLVED_RESOURCES: Record<string, string[]> = {
  "use-query-graph-step": ["query"],
}

export const getResolvedResourcesByStepId = (stepId: string): string[] => {
  return STEPS_RESOLVED_RESOURCES[stepId] || []
}
