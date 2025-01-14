import path from "path"
import { defineConfig, FileSystem } from "@medusajs/framework/utils"
import { getResolvedPlugins } from "../helpers/resolve-plugins"

const BASE_DIR = path.join(__dirname, "sample-proj")
const fs = new FileSystem(BASE_DIR)

afterEach(async () => {
  await fs.cleanup()
})

describe("getResolvedPlugins | relative paths", () => {
  test("resolve configured plugins", async () => {
    await fs.createJson("plugins/dummy/package.json", {
      name: "my-dummy-plugin",
      version: "1.0.0",
    })

    const plugins = await getResolvedPlugins(
      fs.basePath,
      defineConfig({
        plugins: [
          {
            resolve: "./plugins/dummy",
            options: {
              apiKey: "asecret",
            },
          },
        ],
      }),
      false
    )

    expect(plugins).toEqual([
      {
        resolve: path.join(fs.basePath, "./plugins/dummy/.medusa/server/src"),
        name: "my-dummy-plugin",
        id: "my-dummy-plugin",
        options: { apiKey: "asecret" },
        version: "1.0.0",
        modules: [],
      },
    ])
  })

  test("scan plugin modules", async () => {
    await fs.createJson("plugins/dummy/package.json", {
      name: "my-dummy-plugin",
      version: "1.0.0",
    })
    await fs.create(
      "plugins/dummy/.medusa/server/src/modules/blog/index.js",
      ``
    )

    const plugins = await getResolvedPlugins(
      fs.basePath,
      defineConfig({
        plugins: [
          {
            resolve: "./plugins/dummy",
            options: {
              apiKey: "asecret",
            },
          },
        ],
      }),
      false
    )

    expect(plugins).toEqual([
      {
        resolve: path.join(fs.basePath, "./plugins/dummy/.medusa/server/src"),
        name: "my-dummy-plugin",
        id: "my-dummy-plugin",
        options: { apiKey: "asecret" },
        version: "1.0.0",
        modules: [
          {
            options: {
              apiKey: "asecret",
            },
            resolve: "./plugins/dummy/.medusa/server/src/modules/blog",
          },
        ],
      },
    ])
  })

  test("throw error when package.json file is missing", async () => {
    const resolvePlugins = async () =>
      getResolvedPlugins(
        fs.basePath,
        defineConfig({
          plugins: [
            {
              resolve: "./plugins/dummy",
              options: {
                apiKey: "asecret",
              },
            },
          ],
        }),
        false
      )

    await expect(resolvePlugins()).rejects.toThrow(
      `Unable to resolve plugin "./plugins/dummy". Make sure the plugin directory has a package.json file`
    )
  })
})

describe("getResolvedPlugins | package reference", () => {
  test("resolve configured plugins", async () => {
    await fs.createJson("package.json", {})
    await fs.createJson("node_modules/@plugins/dummy/package.json", {
      name: "my-dummy-plugin",
      version: "1.0.0",
    })

    const plugins = await getResolvedPlugins(
      fs.basePath,
      defineConfig({
        plugins: [
          {
            resolve: "@plugins/dummy",
            options: {
              apiKey: "asecret",
            },
          },
        ],
      }),
      false
    )

    expect(plugins).toEqual([
      {
        resolve: path.join(
          fs.basePath,
          "node_modules/@plugins/dummy/.medusa/server/src"
        ),
        name: "my-dummy-plugin",
        id: "my-dummy-plugin",
        options: { apiKey: "asecret" },
        version: "1.0.0",
        modules: [],
      },
    ])
  })

  test("scan plugin modules", async () => {
    await fs.createJson("package.json", {})
    await fs.createJson("node_modules/@plugins/dummy/package.json", {
      name: "my-dummy-plugin",
      version: "1.0.0",
    })
    await fs.create(
      "node_modules/@plugins/dummy/.medusa/server/src/modules/blog/index.js",
      ``
    )

    const plugins = await getResolvedPlugins(
      fs.basePath,
      defineConfig({
        plugins: [
          {
            resolve: "@plugins/dummy",
            options: {
              apiKey: "asecret",
            },
          },
        ],
      }),
      false
    )

    expect(plugins).toEqual([
      {
        resolve: path.join(
          fs.basePath,
          "node_modules/@plugins/dummy/.medusa/server/src"
        ),
        name: "my-dummy-plugin",
        id: "my-dummy-plugin",
        options: { apiKey: "asecret" },
        version: "1.0.0",
        modules: [
          {
            options: {
              apiKey: "asecret",
            },
            resolve: "@plugins/dummy/.medusa/server/src/modules/blog",
          },
        ],
      },
    ])
  })

  test("throw error when package.json file is missing", async () => {
    const resolvePlugins = async () =>
      getResolvedPlugins(
        fs.basePath,
        defineConfig({
          plugins: [
            {
              resolve: "@plugins/dummy",
              options: {
                apiKey: "asecret",
              },
            },
          ],
        }),
        false
      )

    await expect(resolvePlugins()).rejects.toThrow(
      `Unable to resolve plugin "@plugins/dummy". Make sure the plugin directory has a package.json file`
    )
  })
})
