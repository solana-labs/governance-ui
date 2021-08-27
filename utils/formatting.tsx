import BN from 'bn.js'
import moment from 'moment'

const votePrecision = 10000
export function calculatePct(c: BN, total: BN | undefined) {
  return total
    ? c.mul(new BN(votePrecision)).div(total).toNumber() * (100 / votePrecision)
    : undefined
}

export const fmtUnixTime = (d: BN) => moment.unix(d.toNumber()).fromNow()
