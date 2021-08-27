import BN from 'bn.js'
import moment from 'moment'

const votePrecision = 10000
export const calculatePct = (c: BN, total?: BN) =>
  c
    .mul(new BN(votePrecision))
    .div(total ?? new BN(1))
    .toNumber() *
  (100 / votePrecision)

export const fmtVoteCount = (c: BN, decimals?: number) =>
  c.div(new BN(10).pow(new BN(decimals ?? 0))).toNumber()

export const fmtUnixTime = (d: BN) => moment.unix(d.toNumber()).fromNow()
