import { TransactionInstruction } from '@solana/web3.js'
import queryClient from '@hooks/queries/queryClient'
import { useConnection } from '@solana/wallet-adapter-react'
import { updateVoterWeight } from './updateVoterWeight'
import { createVoterWeight } from './createVoterWeight'
import { getPlugins } from './getPlugins'
import { useState, useEffect, useCallback } from 'react'
import {BN} from '@coral-xyz/anchor'
import { calculateVoterWeight } from './calculateVoterWeight'
import {usePluginsArgs, VoterWeightPluginInfo} from "./types";
import {createMaxVoterWeight} from "./createMaxVoterWeight";
import {updateMaxVoterWeight} from "./updateMaxVoterWeight";
import {calculateMaxVoterWeight} from "./calculateMaxVoterWeight";

export interface usePluginsReturnType {
  plugins: VoterWeightPluginInfo[]
  updateVoterWeightRecords: () => Promise<TransactionInstruction[]>
  createVoterWeightRecords: () => Promise<TransactionInstruction[]>
  updateMaxVoterWeightRecords: () => Promise<TransactionInstruction[]>
  createMaxVoterWeightRecords: () => Promise<TransactionInstruction[]>
  voterWeight: BN | undefined
  maxVoterWeight: BN | undefined
}

export const useVoterWeightPlugins = ({
  realmPublicKey,
  governanceMintPublicKey,
  walletPublicKey,
}: usePluginsArgs): usePluginsReturnType => {
  const { connection } = useConnection()
  const [plugins, setPlugins] = useState<Array<VoterWeightPluginInfo>>([])
  const [voterWeight, setVoterWeight] = useState<BN | undefined>()
  const [maxVoterWeight, setMaxVoterWeight] = useState<BN | undefined>()


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
          walletPublicKey,
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
      setPlugins(newPlugins)
    }

    fetchAndSetPlugins()
    // convert to strings to prevent unecessary re-runs when the same publickey but different object is passed to hook
  }, [
    realmPublicKey?.toBase58(),
    governanceMintPublicKey?.toBase58(),
    walletPublicKey?.toBase58(),
  ])

  useEffect(() => {
    // get calculated vote weight
    const fetchAndSetWeight = async () => {
      const weight = calculateVoterWeight(plugins)
      setVoterWeight(weight)

      const maxWeight = calculateMaxVoterWeight(plugins)
      setMaxVoterWeight(maxWeight)
    }

    if (plugins.length) {
      fetchAndSetWeight()
    }
  }, [plugins])

  const createVoterWeightRecords = (): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve([])
    }

    return queryClient.fetchQuery({
      queryKey: [
        'createVoterWeightRecords',
        realmPublicKey,
        walletPublicKey,
        governanceMintPublicKey,
      ],
      queryFn: () =>
        createVoterWeight({
          walletPublicKey,
          realmPublicKey,
          governanceMintPublicKey,
          connection,
        }),
    })
  }

  const updateVoterWeightRecords = (): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve([])
    }

    return queryClient.fetchQuery({
      queryKey: [
        'updateVoterWeightRecords',
        realmPublicKey,
        walletPublicKey,
        governanceMintPublicKey,
      ],
      queryFn: () =>
        updateVoterWeight({
          walletPublicKey,
          realmPublicKey,
          governanceMintPublicKey,
          connection,
        }),
    })
  }

  const createMaxVoterWeightRecords = (): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve([])
    }

    return queryClient.fetchQuery({
      queryKey: [
        'createMaxVoterWeightRecords',
        realmPublicKey,
        walletPublicKey,
        governanceMintPublicKey,
      ],
      queryFn: () =>
          createMaxVoterWeight({
            walletPublicKey,
            realmPublicKey,
            governanceMintPublicKey,
            connection,
          }),
    })
  }

  const updateMaxVoterWeightRecords = (): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve([])
    }

    return queryClient.fetchQuery({
      queryKey: [
        'updateMaxVoterWeightRecords',
        realmPublicKey,
        walletPublicKey,
        governanceMintPublicKey,
      ],
      queryFn: () =>
          updateMaxVoterWeight({
            walletPublicKey,
            realmPublicKey,
            governanceMintPublicKey,
            connection,
          }),
    })
  }

  return {
    updateVoterWeightRecords,
    createVoterWeightRecords,
    updateMaxVoterWeightRecords,
    createMaxVoterWeightRecords,
    plugins,
    voterWeight,
    maxVoterWeight
  }
}
