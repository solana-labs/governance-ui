export function equalsIgnoreCase(
  str1: string | undefined,
  str2: string | undefined
) {
  return str1?.toUpperCase() === str2?.toUpperCase()
}
