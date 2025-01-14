import * as yalc from "yalc"

/**
 * Publish the plugin to the local packages registry
 */
export default async function localPublishPlugin({
  directory,
}: {
  directory: string
}) {
  await yalc.publishPackage({
    push: true,
    workingDir: directory,
    changed: true,
    replace: true,
  })
}
