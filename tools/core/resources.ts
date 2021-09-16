/// Returns resource path part by replacing prohibited characters like white spaces with '-'
export function getResourcePathPart(name: string | undefined) {
  return name?.replace(' ', '-')?.toLowerCase()
}
