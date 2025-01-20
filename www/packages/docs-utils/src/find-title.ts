import { readFileSync } from "fs"

const REGEX = /export const metadata = {[\s\S]*title: `(?<title>.*)`/

export function findMetadataTitle(content: string): string | undefined {
  const headingMatch = REGEX.exec(content)

  return headingMatch?.groups?.title
}

const HEADING_REGEX = /# (?<title>.*)/

export function findPageHeading(content: string): string | undefined {
  const headingMatch = HEADING_REGEX.exec(content)

  return headingMatch?.groups?.title
}

export function findPageTitle(filePath: string): string | undefined {
  const content = readFileSync(filePath, "utf-8")

  return findMetadataTitle(content) || findPageHeading(content)
}
