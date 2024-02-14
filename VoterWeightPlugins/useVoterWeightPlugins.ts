import { TransactionInstruction } from '@solana/web3.js'
import queryClient from '@hooks/queries/queryClient'
import { useConnection } from '@solana/wallet-adapter-react'
import { updateVoterWeight } from './updateVoterWeight'
import { createVoterWeight } from './createVoterWeight'
import { getPlugins } from './getPlugins'
import { useState, useEffect, useCallback } from 'react'
import { BN } from '@coral-xyz/anchor'
import { calculateVoterWeight } from './calculateVoterWeight'
import { usePluginsArgs, VoterWeightPluginInfo } from './types'
import { createMaxVoterWeight } from './createMaxVoterWeight'
import { updateMaxVoterWeight } from './updateMaxVoterWeight'
import { calculateMaxVoterWeight } from './calculateMaxVoterWeight'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'

export interface usePluginsReturnType {
  isReady: boolean
  plugins: VoterWeightPluginInfo[] | undefined // undefined means we are still loading
  updateVoterWeightRecords: () => Promise<TransactionInstruction[]>
  createVoterWeightRecords: () => Promise<TransactionInstruction[]>
  updateMaxVoterWeightRecords: () => Promise<TransactionInstruction[]>
  createMaxVoterWeightRecords: () => Promise<TransactionInstruction[]>
  voterWeight: BN | null // null means "something went wrong", if we are not still loading
  maxVoterWeight: BN | null // null means "something went wrong", if we are not still loading
}

export interface useVoterWeightPluginReadinessReturnType {
  isReady: boolean //defines if the plugin is loading
  isEnabled: boolean //defines if the plugin is enabled in the realm
}

export const useVoterWeightPlugins = ({
  realmPublicKey,
  governanceMintPublicKey,
  walletPublicKey,
}: usePluginsArgs): usePluginsReturnType => {
  const { connection } = useConnection()
  const [isReady, setIsReady] = useState(false)
  const [plugins, setPlugins] = useState<Array<VoterWeightPluginInfo>>()
  const [voterWeight, setVoterWeight] = useState<BN | null>(null)
  const [maxVoterWeight, setMaxVoterWeight] = useState<BN | null>(null)
  const tokenOwnerRecord = useUserCommunityTokenOwnerRecord().data?.result
  const mintInfo = useRealmCommunityMintInfoQuery().data?.result

  // we should reload whenever any of these change.
  // convert to strings to prevent unecessary re-runs
  // when the same publickey but different object is passed to the hook
  const dependencies = [
    realmPublicKey?.toBase58(),
    governanceMintPublicKey?.toBase58(),
    walletPublicKey?.toBase58(),
  ]

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
  }, dependencies)

  useEffect(() => {
    const fetchAndSetPlugins = async () => {
      if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
        return
      }
      const newPlugins = await fetchPlugins()
      setPlugins(newPlugins)
      setIsReady(true)
    }

    fetchAndSetPlugins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  useEffect(() => {
    const tokenOwnerRecordPower =
      tokenOwnerRecord?.account.governingTokenDepositAmount
    const tokenSupply = mintInfo?.supply

    if (
      !realmPublicKey ||
      !governanceMintPublicKey ||
      !walletPublicKey ||
      !plugins ||
      !tokenOwnerRecordPower ||
      !tokenSupply
    ) {
      return
    }

    // get calculated vote weight
    const fetchAndSetWeight = async () => {
      const weight = await calculateVoterWeight({
        voter: walletPublicKey,
        realm: realmPublicKey,
        mint: governanceMintPublicKey,
        plugins,
        tokenOwnerRecordPower,
      })
      setVoterWeight(weight)

      const maxWeight = await calculateMaxVoterWeight({
        realm: realmPublicKey,
        mint: governanceMintPublicKey,
        plugins,
        tokenSupply,
      })
      setMaxVoterWeight(maxWeight)
    }

    fetchAndSetWeight()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plugins, ...dependencies])

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
    isReady,
    updateVoterWeightRecords,
    createVoterWeightRecords,
    updateMaxVoterWeightRecords,
    createMaxVoterWeightRecords,
    plugins,
    voterWeight,
    maxVoterWeight,
  }
}
