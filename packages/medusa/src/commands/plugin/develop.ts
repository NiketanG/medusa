import * as yalc from "yalc"
import { logger } from "@medusajs/framework/logger"
import { Compiler } from "@medusajs/framework/build-tools"

export default async function developPlugin({
  directory,
}: {
  directory: string
}) {
  const compiler = new Compiler(directory, logger)
  await compiler.developPluginBackend(async () => {
    await yalc.publishPackage({
      push: true,
      workingDir: directory,
      changed: true,
      replace: true,
    })
  })
}
