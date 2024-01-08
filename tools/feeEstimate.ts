import {
  Connection,
  PublicKey,
  RecentPrioritizationFees,
} from '@solana/web3.js'
import { getClient, getGroupForClient } from '@utils/mangoV4Tools'
import { groupBy, mapValues, maxBy, sampleSize } from 'lodash'

export const getFeeEstimate = async (connection: Connection) => {
  const defaultFee = 5000
  try {
    //Use mango client to find good fee
    const MAINNET_MANGO_GROUP = new PublicKey(
      '78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX'
    )
    const MAX_PRIORITY_FEE_KEYS = 128
    const client = await getClient(connection)
    const group = await getGroupForClient(client, MAINNET_MANGO_GROUP)
    const feeMultiplier = 1.2
    const altResponse = await connection.getAddressLookupTable(
      group.addressLookupTables[0]
    )
    const altKeys = altResponse.value?.state.addresses
    if (!altKeys) return defaultFee

    const addresses = sampleSize(altKeys, MAX_PRIORITY_FEE_KEYS)
    const fees = await connection.getRecentPrioritizationFees({
      lockedWritableAccounts: addresses,
    })

    if (fees.length < 1) return defaultFee

    // get max priority fee per slot (and sort by slot from old to new)
    const maxFeeBySlot = mapValues(groupBy(fees, 'slot'), (items) =>
      maxBy(items, 'prioritizationFee')
    )
    const maximumFees = Object.values(maxFeeBySlot).sort(
      (a, b) => a!.slot - b!.slot
    ) as RecentPrioritizationFees[]

    // get median of last 20 fees
    const recentFees = maximumFees.slice(Math.max(maximumFees.length - 20, 0))
    const mid = Math.floor(recentFees.length / 2)
    const medianFee =
      recentFees.length % 2 !== 0
        ? recentFees[mid].prioritizationFee
        : (recentFees[mid - 1].prioritizationFee +
            recentFees[mid].prioritizationFee) /
          2
    const feeEstimate = Math.ceil(medianFee * feeMultiplier)
    return feeEstimate
  } catch (e) {
    return defaultFee
  }
}
