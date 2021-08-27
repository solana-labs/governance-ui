import BN from 'bn.js'
import moment from 'moment'

const votePrecision = 10000
export const calculatePct = (c: BN, total: BN) =>
  c.mul(new BN(votePrecision)).div(total).toNumber() * (100 / votePrecision)

export const fmtUnixTime = (d: BN) => moment.unix(d.toNumber()).fromNow()
