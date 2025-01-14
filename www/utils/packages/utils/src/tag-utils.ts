import { Comment, CommentTag, DeclarationReflection, Reflection } from "typedoc"
import { getUniqueStrArray } from "./str-utils.js"

export const getTagsAsArray = (
  tag: CommentTag,
  makeUnique = true
): string[] => {
  const tags = tag.content
    .map((content) => content.text)
    .join("")
    .split(",")
    .map((value) => value.trim())

  return makeUnique ? getUniqueStrArray(tags) : tags
}

export const getTagComments = (reflection: Reflection): CommentTag[] => {
  const tagComments: CommentTag[] = []

  reflection.comment?.blockTags
    .filter((tag) => tag.tag === `@tags`)
    .forEach((tag) => tagComments.push(tag))

  if (reflection instanceof DeclarationReflection) {
    reflection.signatures?.forEach((signature) =>
      tagComments.push(...getTagComments(signature))
    )
  }

  return tagComments
}

export const getTagsAsValue = (tags: string[]): string => {
  return tags.join(",")
}

export const addTagsToReflection = (
  reflection: Reflection,
  tags: string[]
): string[] => {
  let tempTags = [...tags]
  // check if reflection has an existing tag
  const existingTag = reflection.comment?.blockTags.find(
    (tag) => tag.tag === `@tags`
  )
  if (existingTag) {
    tempTags.push(...getTagsAsArray(existingTag))
  }

  if (!tags.length) {
    return tempTags
  }

  // make tags unique
  tempTags = getUniqueStrArray(tempTags)

  if (!reflection.comment) {
    reflection.comment = new Comment()
  }
  reflection.comment.blockTags.push(
    new CommentTag(`@tags`, [
      {
        kind: "text",
        text: getTagsAsValue(tempTags),
      },
    ])
  )

  return tempTags
}
