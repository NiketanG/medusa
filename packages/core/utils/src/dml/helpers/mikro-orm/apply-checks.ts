import { Check, CheckOptions } from "@mikro-orm/core"
import { CheckConstraint, EntityConstructor } from "@medusajs/types"

/**
 * Defines PostgreSQL constraints using the MikrORM's "@Check"
 * decorator
 */
export function applyChecks(
  MikroORMEntity: EntityConstructor<any>,
  entityChecks: CheckConstraint<any>[] = []
) {
  entityChecks.forEach((check) => {
    Check(
      typeof check === "function"
        ? {
            expression: check as CheckOptions["expression"],
          }
        : (check as CheckOptions)
    )(MikroORMEntity)
  })
}
