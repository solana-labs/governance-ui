import moment from 'moment'
import useWalletStore from '../stores/useWalletStore'

export default function usePool() {
  const pool = useWalletStore((s) => s.pool)

  const startIdo = pool ? moment.unix(pool.startIdoTs.toNumber()) : undefined
  const endIdo = pool ? moment.unix(pool.endIdoTs.toNumber()) : undefined
  const endDeposits = pool
    ? moment.unix(pool.endDepositsTs.toNumber())
    : undefined

  /*
  // override for announcement
  const unixTs = 1628553600
  const startIdo = moment.unix(unixTs)
  const endDeposits = moment.unix(unixTs).add(1, 'days')
  const endIdo = moment.unix(unixTs).add(2, 'days')
  */

  return { pool, startIdo, endIdo, endDeposits }
}
