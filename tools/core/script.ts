export function mapEntries(xs: any, mapFn: (kv: [string, any]) => any) {
  return Object.entries(xs).map(mapFn)
}

export function mapFromEntries(
  xs: any,
  mapFn: (kv: [string, any]) => [string, any]
) {
  return Object.fromEntries(mapEntries(xs, mapFn))
}
