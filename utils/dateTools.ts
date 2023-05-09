import { BN } from '@coral-xyz/anchor'

export const DAYS_PER_YEAR = 365
export const SECS_PER_DAY = 86400
export const DAYS_PER_MONTH = DAYS_PER_YEAR / 12
export const SECS_PER_MONTH = DAYS_PER_MONTH * SECS_PER_DAY
export const HOURS_PER_DAY = 24
export const MINS_PER_HOUR = 60

export function getFormattedStringFromDays(
  numberOfDays: number,
  fullFormat = false
) {
  const years = Math.floor(numberOfDays / DAYS_PER_YEAR)
  const months = Math.floor((numberOfDays % DAYS_PER_YEAR) / DAYS_PER_MONTH)
  const days = Math.floor((numberOfDays % DAYS_PER_YEAR) % DAYS_PER_MONTH)
  const hours = (numberOfDays - Math.floor(numberOfDays)) * HOURS_PER_DAY
  const hoursInt = Math.floor(hours)
  const minutes = Math.floor((hours - hoursInt) * MINS_PER_HOUR)
  const yearSuffix = years > 1 ? ' years' : ' year'
  const monthSuffix = months > 1 ? ' months' : ' month'
  const daysSuffix = days > 1 ? ' days' : ' day'
  const yearsDisplay =
    years > 0 ? years + `${fullFormat ? yearSuffix : 'y'}` : null
  const monthsDisplay =
    months > 0 ? months + `${fullFormat ? monthSuffix : 'm'}` : null
  const daysDisplay =
    days > 0 ? days + `${fullFormat ? daysSuffix : 'd'}` : null
  const hoursDisplay = hours > 0 ? `${hoursInt}h ${minutes}min` : null
  const text =
    !years && !months && days <= 1
      ? [daysDisplay, hoursDisplay].filter(Boolean).join(' ')
      : [yearsDisplay, monthsDisplay, daysDisplay].filter(Boolean).join(' ')
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

export const daysToSecs = (days: number) => {
  return days * SECS_PER_DAY
}

export const secsToDays = (secs: number) => {
  return secs / SECS_PER_DAY
}

export const daysToMonths = (days: number) => {
  return days / DAYS_PER_MONTH
}

export const getMinDurationFmt = (startTs: BN, endTs: BN) => {
  return getFormattedStringFromDays(getMinDurationInDays(startTs, endTs))
}
export const getTimeLeftFromNowFmt = (ts: BN) => {
  const dateNowSecTimeStampBN = new BN(new Date().getTime() / 1000)
  return getFormattedStringFromDays(
    ts.sub(dateNowSecTimeStampBN).toNumber() / SECS_PER_DAY
  )
}

export const getMinDurationInDays = (startTs: BN, endTs: BN) => {
  return endTs.sub(startTs).toNumber() / SECS_PER_DAY
}
