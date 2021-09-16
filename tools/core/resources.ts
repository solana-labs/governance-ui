/// Returns resource path by replacing prohibited characters like white spaces  with '-'
export function getResourceName(name: string | undefined) {
  return name?.replace(' ', '-')
}
