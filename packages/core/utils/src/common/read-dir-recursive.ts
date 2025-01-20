import { Dirent } from "fs"
import { readdir } from "fs/promises"
import { join } from "path"

const MISSING_NODE_ERRORS = ["ENOTDIR", "ENOENT"]

export async function readDir(
  dir: string,
  options?: {
    ignoreMissing?: boolean
  }
) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries
  } catch (error) {
    if (options?.ignoreMissing && MISSING_NODE_ERRORS.includes(error.code)) {
      return []
    }
    throw error
  }
}

export async function readDirRecursive(
  dir: string,
  options?: {
    ignoreMissing?: boolean
  }
): Promise<Dirent[]> {
  let allEntries: Dirent[] = []
  const readRecursive = async (dir: string) => {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        Object.defineProperty(entry, "path", {
          value: dir,
        })
        allEntries.push(entry)

        if (entry.isDirectory()) {
          await readRecursive(fullPath)
        }
      }
    } catch (error) {
      if (options?.ignoreMissing && error.code === "ENOENT") {
        return
      }
      throw error
    }
  }

  await readRecursive(dir)
  return allEntries
}
