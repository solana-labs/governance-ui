export function getChangedValues<T extends Record<keyof T, any>>(
  originalValues: T,
  newValues: T
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
  }
  return values
}

export function getNullOrTransform<T>(
  val: string | null,
  classTransformer: (new (val: string) => T) | null,
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
