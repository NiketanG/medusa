const PROJECT_REGEX = /^!(?<area>[\w-]+)!/

export const parseCrossProjectLink = (
  link: string
):
  | {
      area: string
      path: string
    }
  | undefined => {
  const projectArea = PROJECT_REGEX.exec(link)

  if (!projectArea?.groups?.area) {
    return undefined
  }

  return {
    area: projectArea.groups.area,
    path: link.replace(PROJECT_REGEX, ""),
  }
}
