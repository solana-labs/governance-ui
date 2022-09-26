import BN from 'bn.js'
import dayjs from 'dayjs'
import type { BigNumber } from 'bignumber.js'
const relativeTime = require('dayjs/plugin/relativeTime')

import { abbreviateAddress } from '@hub/lib/abbreviateAddress'

const votePrecision = 10000
export const calculatePct = (c: BN, total?: BN) => {
  if (total?.isZero()) {
    return 0
  }

  return (
    c
      .mul(new BN(votePrecision))
      .div(total ?? new BN(1))
      .toNumber() *
    (100 / votePrecision)
  )
}

export const fmtTokenAmount = (c: BN, decimals?: number) =>
  c?.div(new BN(10).pow(new BN(decimals ?? 0))).toNumber() || 0

dayjs.extend(relativeTime)
export const fmtUnixTime = (d: BN | BigNumber | number) =>
  //@ts-ignore
  dayjs(typeof d === 'number' ? d * 1000 : d.toNumber() * 1000).fromNow()

export function precision(a) {
  if (!isFinite(a)) return 0
  let e = 1,
    p = 0
  while (Math.round(a * e) / e !== a) {
    e *= 10
    p++
  }
  return p
}

export { abbreviateAddress }
