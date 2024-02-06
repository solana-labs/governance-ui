import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import queryClient from '@hooks/queries/queryClient'
import { useConnection } from '@solana/wallet-adapter-react'
import { updateVoterWeightRecord } from './updateVoterWeightRecord'
import { getPlugins } from './getPlugins'
import { useState, useEffect, useCallback } from 'react'
import { BN } from '@coral-xyz/anchor'
import { PluginName } from '@constants/plugins'

export interface usePluginsArgs {
  realmPublicKey: PublicKey | undefined
  governanceMintPublicKey: PublicKey | undefined
  walletPublicKey: PublicKey | undefined
}

export interface usePluginsReturnType {
  isLoading: boolean
  initilizerError: Error | undefined
  plugins: PluginName[]
  voterWeightRecord: PublicKey | undefined
  maxVoterWeightRecord: PublicKey | undefined
  voterWeight: BN | undefined
  updateVoterWeight: () => Promise<TransactionInstruction[]>
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
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [plugins, setPlugins] = useState<PluginName[]>([])
  const [initilizerError, setInitilizeError] = useState<Error>()

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
  }, [connection, governanceMintPublicKey, realmPublicKey, walletPublicKey])

  useEffect(() => {
    setIsLoading(true)
    fetchPlugins()
      .then((plugins) => {
        setPlugins(plugins)
      })
      .catch((err) => {
        setInitilizeError(err as Error)
      })
      .finally(() => {
        setIsLoading(false)
      })

    // TODO implement getting and setting voterWeight, maxVoterWeightRecord, voterWeightRecord
    // from the plugin info object
  }, [realmPublicKey, governanceMintPublicKey, walletPublicKey, fetchPlugins])

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
    isLoading,
    initilizerError,
    plugins,
    updateVoterWeight,
    getVoterWeightRecord,
    getMaxVoteWeightRecord,
    createVoterWeightRecord,
    voterWeight,
    voterWeightRecord,
    maxVoterWeightRecord,
  }
}
