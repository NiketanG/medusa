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
    workingDir: directory,
    changed: true,
    replace: true,
    scripts: true,
  })
}
