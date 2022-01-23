export const DAYS_PER_YEAR = 365
export const SECS_PER_DAY = 86400
export const DAYS_PER_MONTH = DAYS_PER_YEAR / 12
export const SECS_PER_MONTH = DAYS_PER_MONTH * SECS_PER_DAY

export function getFormattedStringFromDays(numberOfDays: number) {
  const years = Math.floor(numberOfDays / DAYS_PER_YEAR)
  const months = Math.floor((numberOfDays % DAYS_PER_YEAR) / DAYS_PER_MONTH)
  const days = Math.floor((numberOfDays % DAYS_PER_YEAR) % DAYS_PER_MONTH)

  const yearsDisplay = years > 0 ? years + (years == 1 ? ' yr ' : ' yrs ') : ''
  const monthsDisplay =
    months > 0 ? months + (months == 1 ? ' mth ' : ' mths ') : ''
  const daysDisplay = days > 0 ? days + (days == 1 ? ' d' : ' days') : ''
  const text = yearsDisplay + monthsDisplay + daysDisplay
  return text ? text : 0
}

export const yearsToDays = (years: number) => {
  return DAYS_PER_YEAR * years
}
export const daysToYear = (days: number) => {
  return days / DAYS_PER_YEAR
}
export const yearsToSecs = (years: number) => {
  return DAYS_PER_YEAR * years * SECS_PER_DAY
}

export const secsToDays = (secs: number) => {
  return secs / SECS_PER_DAY
}

export const daysToMonths = (days: number) => {
  return days / DAYS_PER_MONTH
}
