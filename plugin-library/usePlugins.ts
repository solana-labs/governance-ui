import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import queryClient from '@hooks/queries/queryClient'
import { useConnection } from '@solana/wallet-adapter-react'
import { updateVoterWeightRecord } from './updateVoterWeightRecord'
import { PluginData, getPlugins } from './getPlugins'
import { useState, useEffect, useCallback } from 'react'
import { BN } from '@coral-xyz/anchor'

export interface usePluginsArgs {
  realmPublicKey: PublicKey | undefined
  governanceMintPublicKey: PublicKey | undefined
  walletPublicKey: PublicKey | undefined
}

export interface usePluginsReturnType {
  voterWeight: BN | undefined
  maxVoterWeight: BN | undefined
  plugins: Array<any>
  updateVoterWeight: () => Promise<TransactionInstruction[]>
  createVoterWeightRecords: () => void
}

export const usePlugins = ({
  realmPublicKey,
  governanceMintPublicKey,
  walletPublicKey,
}: usePluginsArgs): usePluginsReturnType => {
  const { connection } = useConnection()
  const [maxVoterWeight, setMaxVoterWeight] = useState<BN | undefined>()
  const [voterWeight, setVoterWeight] = useState<BN | undefined>()
  const [plugins, setPlugins] = useState<Array<PluginData>>([])

  const fetchPlugins = useCallback(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realmPublicKey, governanceMintPublicKey, walletPublicKey])

  useEffect(() => {
    // TODO implement getting and setting voterWeight, maxVoterWeightRecord, voterWeightRecord
    // from the plugin info object
    const fetchAndSetPlugins = async () => {
      if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
        return
      }
      const newPlugins = await fetchPlugins()
      console.log('plugins in fetch and set', newPlugins)
      setPlugins(newPlugins)
    }

    fetchAndSetPlugins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realmPublicKey, governanceMintPublicKey, walletPublicKey])

  const getVoteWeight = () => {}

  const createVoterWeightRecords = () => {
    return
  }

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
    plugins,
    createVoterWeightRecords,
    voterWeight,
    maxVoterWeight,
  }
}
