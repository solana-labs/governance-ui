export function capitalize(str?: string) {
  const lower = str?.toLowerCase()
  return lower ? str?.charAt(0).toUpperCase() + lower?.slice(1) : lower
}
