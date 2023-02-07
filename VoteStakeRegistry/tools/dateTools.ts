import { BN } from '@coral-xyz/anchor'
import { DepositWithMintAccount } from 'VoteStakeRegistry/sdk/accounts'

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
    years > 0 ? years + `${fullFormat ? yearSuffix : 'y'} ` : ''
  const monthsDisplay =
    months > 0 ? months + `${fullFormat ? monthSuffix : 'm'} ` : ''
  const daysDisplay = days > 0 ? days + `${fullFormat ? daysSuffix : 'd'} ` : ''
  const hoursDisplay = hours > 0 ? `${hoursInt}h ${minutes}min` : ''
  const text =
    !years && !months && days <= 1
      ? daysDisplay + hoursDisplay
      : yearsDisplay + monthsDisplay + daysDisplay
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

export const getMinDurationFmt = (deposit: DepositWithMintAccount) => {
  return getFormattedStringFromDays(getMinDurationInDays(deposit))
}
export const getTimeLeftFromNowFmt = (deposit: DepositWithMintAccount) => {
  const dateNowSecTimeStampBN = new BN(new Date().getTime() / 1000)
  return getFormattedStringFromDays(
    deposit.lockup.endTs.sub(dateNowSecTimeStampBN).toNumber() / SECS_PER_DAY
  )
}

export const getMinDurationInDays = (deposit: DepositWithMintAccount) => {
  return (
    deposit.lockup.endTs.sub(deposit.lockup.startTs).toNumber() / SECS_PER_DAY
  )
}
