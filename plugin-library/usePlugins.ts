import { PublicKey } from '@solana/web3.js'
import queryClient from '@hooks/queries/queryClient'
import { useConnection } from '@solana/wallet-adapter-react'
import { updateVoterWeightRecord } from './updateVoterWeightRecord'
import { getPlugins } from './getPlugins'

export const usePlugins = () => {
  const { connection } = useConnection()

  const fetchPlugins = ({
    realmPublicKey,
    governanceMintPublicKey,
  }: {
    realmPublicKey: PublicKey
    governanceMintPublicKey: PublicKey
  }) => {
    return queryClient.fetchQuery({
      queryKey: ['fetchPlugins', realmPublicKey, governanceMintPublicKey],
      queryFn: () =>
        getPlugins({
          realmPublicKey,
          governanceMintPublicKey,
          connection,
        }),
    })
  }

  const updateVoterWeight = ({
    realmPublicKey,
    walletPublicKey,
    governanceMintPublicKey,
  }: {
    realmPublicKey: PublicKey
    walletPublicKey: PublicKey
    governanceMintPublicKey: PublicKey
  }) => {
    return queryClient.fetchQuery({
      queryKey: [
        'updateVoteWeight',
        realmPublicKey,
        walletPublicKey,
        governanceMintPublicKey,
      ],
      queryFn: () =>
        updateVoterWeightRecord({
          walletPublicKey,
          realmPublicKey,
          governanceMintPublicKey,
          connection,
        }),
    })
  }

  return { updateVoterWeight, fetchPlugins }
}
