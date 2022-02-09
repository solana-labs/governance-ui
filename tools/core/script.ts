export function mapEntries(xs: any, mapFn: (kv: [string, any]) => any) {
  return Object.entries(xs).map(mapFn)
}

export function mapFromEntries(
  xs: any,
  mapFn: (kv: [string, any]) => [string, any]
) {
  return Object.fromEntries(mapEntries(xs, mapFn))
}

// Converts array of items to a Map
export function arrayToMap<T, K>(source: readonly T[], getKey: (item: T) => K) {
  return new Map(source.map((item) => [getKey(item), item] as [K, T]))
}

// Returns unique elements from the given source array and using the provided key selector
export function arrayToUnique<T, K>(
  source: readonly T[],
  getKey: (item: T) => K
) {
  return Array.from(arrayToMap(source, getKey).values())
}

export function arrayToRecord<T>(
  source: readonly T[],
  getKey: (item: T) => string
) {
  return source.reduce((all, a) => ({ ...all, [getKey(a)]: a }), {}) as Record<
    string,
    T
  >
}

export function getNameOf<T>() {
  return (name: keyof T) => name
}
