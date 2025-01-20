import path from "path"
import { fileURLToPath } from "url"

export const getDirname = (currentFile = import.meta.url) => {
  const __filename = fileURLToPath(currentFile)
  return path.dirname(__filename)
}
