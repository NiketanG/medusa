import { Tag, Tags } from "types"
import * as tags from "../tags/index.js"

export const getTagItems = (tagName: string): Tag | undefined => {
  if (!Object.hasOwn(tags, tagName)) {
    return
  }
  return tags[tagName as keyof typeof tags]
}

export const getAllTags = (): Tags => {
  return tags
}
