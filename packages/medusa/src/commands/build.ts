import { logger } from "@medusajs/framework/logger"
import { Compiler } from "@medusajs/framework/build-tools"

export default async function build({
  directory,
  adminOnly,
}: {
  directory: string
  adminOnly: boolean
}): Promise<boolean> {
  logger.info("Starting build...")
  const compiler = new Compiler(directory, logger)

  const tsConfig = await compiler.loadTSConfigFile()
  if (!tsConfig) {
    logger.error("Unable to compile application")
    return false
  }

  const promises: Promise<any>[] = []
  if (!adminOnly) {
    promises.push(compiler.buildAppBackend(tsConfig))
  }

  const bundler = await import("@medusajs/admin-bundler")
  promises.push(compiler.buildAppFrontend(adminOnly, tsConfig, bundler))
  await Promise.all(promises)
  return true
}
