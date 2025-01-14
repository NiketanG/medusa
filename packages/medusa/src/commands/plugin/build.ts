import { plugin } from "@medusajs/admin-bundler"
import { Compiler } from "@medusajs/framework/build-tools"
import { logger } from "@medusajs/framework/logger"
export default async function build({
  directory,
}: {
  directory: string
}): Promise<boolean> {
  logger.info("Starting build...")
  const compiler = new Compiler(directory, logger)

  const tsConfig = await compiler.loadTSConfigFile()
  if (!tsConfig) {
    logger.error("Unable to compile plugin")
    return false
  }

  await compiler.buildPluginBackend(tsConfig)
  await compiler.buildPluginAdminExtensions({
    plugin,
  })
  return true
}
