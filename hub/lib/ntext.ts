export function ntext(count: number, singular: string, plural?: string) {
  if (count === 1) {
    return singular;
  }

  return plural || `${singular}s`;
}
