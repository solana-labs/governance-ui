export function getChangedValues<T extends Record<keyof T, any>>(
  originalValues: T,
  newValues: T,
  ignoredFields?: string[]
) {
  const values: any = {}
  for (const key of Object.keys(originalValues)) {
    const typeOfValue = typeof originalValues[key]
    if (
      (typeOfValue !== 'object' && originalValues[key] !== newValues[key]) ||
      (typeOfValue === 'object' &&
        JSON.stringify(originalValues[key]) !== JSON.stringify(newValues[key]))
    ) {
      values[key] = newValues[key]
    } else {
      values[key] = null
    }
    if (ignoredFields?.length && ignoredFields.find((x) => x === key)) {
      values[key] = newValues[key]
    }
  }
  return values as Partial<T>
}

export function getNullOrTransform<T>(
  val: any,
  classTransformer: (new (val: any) => T) | null,
  functionTransformer?: (val) => T
): T | null {
  if (val === null) {
    return null
  }
  if (typeof functionTransformer !== 'undefined') {
    return functionTransformer(val)
  }
  if (classTransformer !== null) {
    return new classTransformer(val)
  }
  return null
}
