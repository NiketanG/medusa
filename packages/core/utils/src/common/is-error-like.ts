export function isErrorLike(value) {
  return (
    !!value &&
    typeof value === "object" &&
    "name" in value &&
    "message" in value &&
    "stack" in value
  )
}
