import { logger } from "@medusajs/framework/logger"
import {
  defineMikroOrmCliConfig,
  DmlEntity,
  dynamicImport,
} from "@medusajs/framework/utils"
import { dirname, join } from "path"

import { MetadataStorage } from "@mikro-orm/core"
import { MikroORM } from "@mikro-orm/postgresql"
import { glob } from "glob"

const TERMINAL_SIZE = process.stdout.columns

/**
 * Generate migrations for all scanned modules in a plugin
 */
const main = async function ({ directory }) {
  try {
    const moduleDescriptors = [] as {
      serviceName: string
      migrationsPath: string
      entities: any[]
    }[]

    const modulePaths = glob.sync(
      join(directory, "src", "modules", "*", "index.ts")
    )

    for (const path of modulePaths) {
      const moduleDirname = dirname(path)
      const serviceName = await getModuleServiceName(path)
      const entities = await getEntitiesForModule(moduleDirname)

      moduleDescriptors.push({
        serviceName,
        migrationsPath: join(moduleDirname, "migrations"),
        entities,
      })
    }

    /**
     * Generating migrations
     */
    logger.info("Generating migrations...")

    await generateMigrations(moduleDescriptors)

    console.log(new Array(TERMINAL_SIZE).join("-"))
    logger.info("Migrations generated")

    process.exit()
  } catch (error) {
    console.log(new Array(TERMINAL_SIZE).join("-"))

    logger.error(error.message, error)
    process.exit(1)
  }
}

async function getEntitiesForModule(path: string) {
  const entities = [] as any[]

  const entityPaths = glob.sync(join(path, "models", "*.ts"), {
    ignore: ["**/index.{js,ts}"],
  })

  for (const entityPath of entityPaths) {
    const entityExports = await dynamicImport(entityPath)

    const validEntities = Object.values(entityExports).filter(
      (potentialEntity) => {
        return (
          DmlEntity.isDmlEntity(potentialEntity) ||
          !!MetadataStorage.getMetadataFromDecorator(potentialEntity as any)
        )
      }
    )
    entities.push(...validEntities)
  }

  return entities
}

async function getModuleServiceName(path: string) {
  const moduleExport = await dynamicImport(path)
  if (!moduleExport.default) {
    throw new Error("The module should default export the `Module()`")
  }
  return (moduleExport.default.service as any).prototype.__joinerConfig()
    .serviceName
}

async function generateMigrations(
  moduleDescriptors: {
    serviceName: string
    migrationsPath: string
    entities: any[]
  }[] = []
) {
  const DB_HOST = process.env.DB_HOST ?? "localhost"
  const DB_USERNAME = process.env.DB_USERNAME ?? ""
  const DB_PASSWORD = process.env.DB_PASSWORD ?? ""

  for (const moduleDescriptor of moduleDescriptors) {
    logger.info(
      `Generating migrations for module ${moduleDescriptor.serviceName}...`
    )

    const mikroOrmConfig = defineMikroOrmCliConfig(
      moduleDescriptor.serviceName,
      {
        entities: moduleDescriptor.entities,
        host: DB_HOST,
        user: DB_USERNAME,
        password: DB_PASSWORD,
        migrations: {
          path: moduleDescriptor.migrationsPath,
        },
      }
    )

    const orm = await MikroORM.init(mikroOrmConfig)
    const migrator = orm.getMigrator()
    const result = await migrator.createMigration()

    if (result.fileName) {
      logger.info(`Migration created: ${result.fileName}`)
    } else {
      logger.info(`No migration created`)
    }
  }
}

export default main
