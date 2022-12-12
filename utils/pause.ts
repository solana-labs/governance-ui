export function pause(ms: number) {
  return new Promise<true>((resolve) => {
    setTimeout(() => resolve(true), ms)
  })
}
