import * as yalc from "yalc"

/**
 * Add the specified plugins to the project from the local packages registry
 */
export default async function localAddPlugin({
  directory,
  plugin_names,
}: {
  directory: string
  plugin_names: string[]
}) {
  await yalc.addPackages(plugin_names, {
    workingDir: directory,
    replace: true,
  })
}
