export function capitalize(str?: string) {
  const lower = str?.toLowerCase()
  return lower ? str?.charAt(0).toUpperCase() + lower?.slice(1) : lower
}

export function chunks<T>(array: T[], size: number): T[][] {
  const result: Array<T[]> = []
  let i, j
  for (i = 0, j = array.length; i < j; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

//SanitizedObject class helps prevent prototype pollution with creating obj without prototype
export class SanitizedObject {
  constructor(obj) {
    return Object.assign(Object.create(null), obj)
  }
}
