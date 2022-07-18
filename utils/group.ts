export default function group<T>(items: T[], groupSize = 100): T[][] {
  if (items.length <= groupSize) {
    return [items]
  }

  const some = items.slice(0, groupSize)
  const rest = items.slice(groupSize)

  return [some, ...group(rest, groupSize)]
}
