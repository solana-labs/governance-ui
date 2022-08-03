import { gistApi } from './github'

export function capitalize(str?: string) {
  return str ? str?.charAt(0).toUpperCase() + str?.slice(1) : str
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

export async function resolveProposalDescription(descriptionLink: string) {
  try {
    gistApi.cancel()
    const url = new URL(descriptionLink)
    const desc =
      (await gistApi.fetchGistFile(url.toString())) ?? descriptionLink
    return desc
  } catch {
    return descriptionLink
  }
}

export function preventNegativeNumberInput(ev) {
  const value = ev.target.value
  if (!isNaN(value) && value < 0) {
    ev.target.value = 0
  } else if (isNaN(value)) {
    ev.target.value = value.slice(0, value.length - 1)
  }
}

export const firstOrNull = <T>(
  arr: ReadonlyArray<T> | null | undefined
): T | null => {
  if (arr !== null && arr !== undefined) {
    return arr[0] ?? null
  }
  return null
}
