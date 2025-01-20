import { join } from "path"
import type { LoadedModule } from "@medusajs/types"
import { FileSystem } from "../common/file-system"
import { toCamelCase } from "../common/to-camel-case"
import { upperCaseFirst } from "../common/upper-case-first"

/**
 * Modules registered inside the config file points to one
 * of the following paths.
 *
 * - A package name
 * - A relative application import
 * - Or an absolute path using `require.resolve`
 *
 * In case of a relative import, we mutate the path to resolve properly
 * when the output file is inside the ".medusa/types" directory.
 * For example:
 *
 * => "./src/modules/brand" will become "../../src/modules/brand"
 *
 * Package names and absolute paths are left as it is.
 */
function normalizeModuleResolvePath(modulePath: string) {
  return modulePath.startsWith("./") || modulePath.startsWith("../")
    ? join("../", "../", modulePath)
    : modulePath
}

/**
 * Creates the "modules-bindings.d.ts" file with container mappings
 * for the modules enabled inside a user's project.
 */
export async function generateContainerTypes(
  modules: Record<string, LoadedModule | LoadedModule[]>,
  {
    outputDir,
    interfaceName,
  }: {
    outputDir: string
    interfaceName: string
  }
) {
  const { imports, mappings } = Object.keys(modules).reduce(
    (result, key) => {
      const services = Array.isArray(modules[key])
        ? modules[key]
        : [modules[key]]

      services.forEach((service) => {
        if (!service.__definition.resolvePath) {
          return
        }

        /**
         * Key registered within the container
         */
        const key = service.__definition.key

        /**
         * @todo. The property should exist on "LoadedModule"
         */
        let servicePath: string = normalizeModuleResolvePath(
          service.__definition.resolvePath
        )

        /**
         * We create the service name (aka default import name) from the
         * service key that is registered inside the container.
         */
        const serviceName = upperCaseFirst(toCamelCase(key))

        result.imports.push(`import type ${serviceName} from '${servicePath}'`)
        result.mappings.push(
          `${key}: InstanceType<(typeof ${serviceName})['service']>`
        )
      })
      return result
    },
    {
      imports: [],
      mappings: [],
    } as {
      imports: string[]
      mappings: string[]
    }
  )

  const fileSystem = new FileSystem(outputDir)
  const fileName = "modules-bindings.d.ts"
  const fileContents = `${imports.join(
    "\n"
  )}\n\ndeclare module '@medusajs/framework/types' {
  interface ${interfaceName} {
    ${mappings.join(",\n    ")}
  }
}`

  await fileSystem.create(fileName, fileContents)
}
