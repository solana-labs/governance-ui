import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { determineVotingPowerType } from '@hooks/queries/governancePower'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { useConnection } from '@solana/wallet-adapter-react'
import { useAsync } from 'react-async-hook'
import { useQuery } from '@tanstack/react-query'
import { StakeConnection } from '@parcl-oss/staking'

/**
 * Returns undefined for everything except the Parcl DAO
 */
export default function useParclScalingFactor(): number | undefined {
  const realm = useSelectedRealmPubkey()
  const { connection } = useConnection()
  const { result: plugin } = useAsync(
    async () =>
      realm && determineVotingPowerType(connection, realm, 'community'),
    [connection, realm]
  )

  const { data: scalingFactor } = useQuery(
    ['parcl-scaling-factor'],
    async (): Promise<number> => {
      const parclClient = await StakeConnection.connect(
        connection,
        {} as NodeWallet
      )
      return parclClient.getScalingFactor()
    },
    { enabled: plugin == 'parcl' }
  )

  if (plugin == 'parcl') {
    return scalingFactor
  } else {
    return undefined
  }
}
