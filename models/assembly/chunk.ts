export function chunk<T>(array: Array<T>, chunkLength: number) {
  const result: Array<T[]> = []
  let i, j
  for (i = 0, j = array.length; i < j; i += chunkLength) {
    result.push(array.slice(i, i + chunkLength))
  }
  return result
}
