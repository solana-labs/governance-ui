import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import queryClient from '@hooks/queries/queryClient'
import { useConnection } from '@solana/wallet-adapter-react'
import { updateVoterWeightRecord } from './updateVoterWeightRecord'
import { getPlugins } from './getPlugins'
import { useState, useEffect } from 'react'
import { BN } from '@coral-xyz/anchor'

export interface usePluginsArgs {
  realmPublicKey: PublicKey | undefined
  governanceMintPublicKey: PublicKey | undefined
  walletPublicKey: PublicKey | undefined
}

export interface usePluginsReturnType {
  voterWeightRecord: PublicKey | undefined
  maxVoterWeightRecord: PublicKey | undefined
  voterWeight: BN | undefined
  updateVoterWeight: () => Promise<TransactionInstruction[]>
  fetchPlugins: () => void
  getVoterWeightRecord: () => void
  getMaxVoteWeightRecord: () => void
  createVoterWeightRecord: () => void
}

export const usePlugins = ({
  realmPublicKey,
  governanceMintPublicKey,
  walletPublicKey,
}: usePluginsArgs): usePluginsReturnType => {
  const { connection } = useConnection()
  const [voterWeightRecord, setVoterWeightRecord] = useState<PublicKey>()
  const [maxVoterWeightRecord, setMaxVoterWeightRecord] = useState<
    PublicKey | undefined
  >()
  const [voterWeight, setVoterWeight] = useState<BN | undefined>()

  useEffect(() => {
    // TODO implement getting and setting voterWeight, maxVoterWeightRecord, voterWeightRecord
    // from the plugin info object
  }, [realmPublicKey, governanceMintPublicKey, walletPublicKey])

  const fetchPlugins = () => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve([])
    }

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

  const createVoterWeightRecord = () => {}

  const getMaxVoteWeightRecord = () => {}

  const getVoterWeightRecord = () => {}

  // TODO: make sure to handle no plugin case
  // default voteWeight is defaultTokenOwnerRecord

  const updateVoterWeight = (): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve([])
    }

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

  return {
    updateVoterWeight,
    fetchPlugins,
    getVoterWeightRecord,
    getMaxVoteWeightRecord,
    createVoterWeightRecord,
    voterWeight,
    voterWeightRecord,
    maxVoterWeightRecord,
  }
}
