export function equalsIgnoreCase(
  str1: string | undefined,
  str2: string | undefined
) {
  return str1?.toUpperCase() === str2?.toUpperCase()
}

export function endsWithIgnoreCase(string: string, searchString: string) {
  return string.toUpperCase().endsWith(searchString.toUpperCase())
}

export function replaceIgnoreCase(
  string: string,
  searchString: string,
  replaceValue: string
) {
  const pattern = new RegExp(searchString, 'gi')
  return string.replace(pattern, replaceValue)
}
