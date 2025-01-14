import react from "@vitejs/plugin-react"
import { readFileSync } from "fs"
import { rm } from "fs/promises"
import { glob } from "glob"
import path from "path"
import { UserConfig } from "vite"

interface PluginOptions {
  root: string
  outDir: string
}

export async function plugin(options: PluginOptions) {
  const vite = await import("vite")
  const entries = await glob(`${options.root}/src/admin/**/*.{ts,tsx,js,jsx}`)

  /**
   * If there is no entry point, we can skip the build
   */
  if (entries.length === 0) {
    return
  }

  const entryPoints = entries.reduce((acc, entry) => {
    const outPath = entry
      .replace(/^src\//, "")
      .replace(/\.(ts|tsx|js|jsx)$/, "")

    acc[outPath] = path.resolve(options.root, entry)
    return acc
  }, {} as Record<string, string>)

  const pkg = JSON.parse(
    readFileSync(path.resolve(options.root, "package.json"), "utf-8")
  )
  const external = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react-router-dom",
    "@medusajs/admin-sdk",
  ])

  /**
   * We need to ensure that the NODE_ENV is set to production,
   * otherwise Vite will build the dev version of React.
   */
  const originalNodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = "production"

  const pluginConfig: UserConfig = {
    build: {
      lib: {
        entry: entryPoints,
        formats: ["es"],
      },
      emptyOutDir: false,
      minify: false,
      outDir: path.resolve(options.root, options.outDir),
      rollupOptions: {
        external: [...external],
        output: {
          globals: {
            react: "React",
            "react-dom": "React-dom",
            "react/jsx-runtime": "react/jsx-runtime",
          },
          preserveModules: true,
          entryFileNames: (chunkInfo) => {
            return `${chunkInfo.name.replace(`${options.root}/`, "")}.js`
          },
        },
      },
    },
    plugins: [
      react(),
      {
        name: "clear-admin-plugin",
        buildStart: async () => {
          const adminDir = path.join(options.root, options.outDir, "admin")
          try {
            await rm(adminDir, { recursive: true, force: true })
          } catch (e) {
            // Directory might not exist, ignore
          }
        },
      },
    ],
    logLevel: "silent",
    clearScreen: false,
  }

  await vite.build(pluginConfig)

  /**
   * Restore the original NODE_ENV
   */
  process.env.NODE_ENV = originalNodeEnv
}
