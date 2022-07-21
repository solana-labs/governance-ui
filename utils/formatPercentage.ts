export function formatPercentage(percentage: number) {
  if (percentage === 0 || percentage === Infinity) {
    return '0%'
  }

  if (percentage < 0.01) {
    return '<0.01%'
  }

  return `${+percentage.toFixed(2)}%`
}
