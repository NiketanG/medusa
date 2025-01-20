export function getBrowser():
  | "Chrome"
  | "Safari"
  | "Firefox"
  | "Internet Explorer"
  | "Edge"
  | "unknown" {
  if (typeof navigator === "undefined") {
    return "unknown"
  }

  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.indexOf("chrome") > -1) {
    return "Chrome"
  } else if (userAgent.indexOf("safari") > -1) {
    return "Safari"
  } else if (userAgent.indexOf("firefox") > -1) {
    return "Firefox"
  } else if (
    userAgent.indexOf("msie") > -1 ||
    userAgent.indexOf("trident") > -1
  ) {
    return "Internet Explorer"
  } else if (userAgent.indexOf("edge") > -1) {
    return "Edge"
  } else {
    return "unknown"
  }
}

export function getOsShortcut() {
  const isMacOs =
    typeof navigator !== "undefined"
      ? navigator.userAgent.toLowerCase().indexOf("mac") !== 0
      : true

  return isMacOs ? "⌘" : "Ctrl"
}
