/**
 * This is the *main* voter weight plugin hook. It exposes everything the rest of the code should need to know about voter weight plugins, including:
 * - the calculated voter weights based on the realm's plugin configuration
 * - the list of plugins, their names and details
 * - a number of functions for creating plugin instructions (e.g. updateVoterWeightRecord etc)
 * Notably not included in here are functions to cast vote or any other instructions on the spl-governance program.
 * Although these occasionally differ per plugin (castNftVote), they are typically generic and receive a voter weight record as an input.
 *
 * This hook deliberately avoids using other hooks in the realms UI. In principle, this allows it to be exported to a separate npm library and used in other SPL-Governance UIs in the future.
 *
 * Realms itself should prefer useRealmVoterWeightPlugins which is a convenience wrapper for this hook.
 */
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import queryClient from '@hooks/queries/queryClient'
import { updateVoterWeight } from './lib/updateVoterWeight'
import { createVoterWeight } from './lib/createVoterWeight'
import {
  CalculatedWeight,
  UseVoterWeightPluginsArgs,
  VoterWeightPluginInfo,
} from './lib/types'
import { createMaxVoterWeight } from './lib/createMaxVoterWeight'
import { updateMaxVoterWeight } from './lib/updateMaxVoterWeight'
import {useMintInfoByPubkeyQuery} from '@hooks/queries/mintInfo'
import { useCalculatedVoterWeight } from './hooks/useCalculatedVoterWeight'
import { useCalculatedMaxVoterWeight } from './hooks/useCalculatedMaxVoterWeight'
import { usePlugins } from './hooks/usePlugins'
import { queryKeys } from './lib/utils'
import { useVoterWeightPks } from './hooks/useVoterWeightPks'
import { PluginName } from '@constants/plugins'
import {VoterWeightAction} from "@solana/spl-governance";
import {useTokenOwnerRecord} from "./hooks/useTokenOwnerRecord";

/**
 * Represents the return type of the `useVoterWeightPlugins` hook.
 */
export interface UseVoterWeightPluginsReturnType {
  isReady: boolean
  plugins: VoterWeightPluginInfo[] | undefined // undefined means we are still loading
  updateVoterWeightRecords: (action?: VoterWeightAction) => Promise<{
    pre: TransactionInstruction[]
    post: TransactionInstruction[]
  }>
  createVoterWeightRecords: () => Promise<TransactionInstruction[]>
  updateMaxVoterWeightRecords: () => Promise<TransactionInstruction[]>
  createMaxVoterWeightRecords: () => Promise<TransactionInstruction[]>
  calculatedVoterWeight: CalculatedWeight | undefined // undefined means we are still loading
  calculatedMaxVoterWeight: CalculatedWeight | undefined // undefined means we are still loading
  voterWeightPk: PublicKey | undefined // the voter weight pubkey to be used in the governance instruction itself
  maxVoterWeightPk: PublicKey | undefined // the max voter weight pubkey to be used in the governance instruction itself

  //auxiliary functions to the ui
  includesPlugin: (name: PluginName) => boolean
}

/**
 * Retrieves voter weight plugin information, calculated voter weights and provides functions to create/update voter weight records.
 *
 * @param {UseVoterWeightPluginsArgs}
 * @returns {UseVoterWeightPluginsReturnType}
 */
export const useVoterWeightPlugins = (
  args: UseVoterWeightPluginsArgs
): UseVoterWeightPluginsReturnType => {
  const { realmPublicKey, governanceMintPublicKey, walletPublicKey } = args
  const mintInfo = useMintInfoByPubkeyQuery(args.governanceMintPublicKey).data?.result;
  const tokenOwnerRecord = useTokenOwnerRecord(args.governanceMintPublicKey);
  const { data: plugins } = usePlugins(args)
  const { result: calculatedVoterWeight} = useCalculatedVoterWeight({
    ...args,
    plugins,
    tokenOwnerRecord,
  })
  const { data: calculatedMaxVoterWeight} = useCalculatedMaxVoterWeight({
    ...args,
    plugins,
    mintInfo,
  })
  const pks = useVoterWeightPks({
    ...args,
    plugins,
  })

  const createVoterWeightRecords = (): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve([])
    }

    return queryClient.fetchQuery({
      queryKey: ['createVoterWeightRecords', ...queryKeys(args)],
      queryFn: () =>
        createVoterWeight({
          walletPublicKey,
          realmPublicKey,
          governanceMintPublicKey,
          plugins,
        }),
    })
  }

  const updateVoterWeightRecords = (action?: VoterWeightAction): Promise<{
    pre: TransactionInstruction[]
    post: TransactionInstruction[]
  }> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve({ pre: [], post: [] })
    }

    return queryClient.fetchQuery({
      queryKey: ['updateVoterWeightRecords', ...queryKeys(args), action],
      queryFn: () =>
        updateVoterWeight({
          walletPublicKey,
          realmPublicKey,
          governanceMintPublicKey,
          plugins,
          action
        }),
    })
  }

  const createMaxVoterWeightRecords = (): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve([])
    }

    return queryClient.fetchQuery({
      queryKey: ['createMaxVoterWeightRecords', ...queryKeys(args)],
      queryFn: () =>
        createMaxVoterWeight({
          realmPublicKey,
          governanceMintPublicKey,
          plugins,
        }),
    })
  }

  const updateMaxVoterWeightRecords = (): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve([])
    }

    return queryClient.fetchQuery({
      queryKey: ['updateMaxVoterWeightRecords', ...queryKeys(args)],
      queryFn: () =>
        updateMaxVoterWeight({
          realmPublicKey,
          governanceMintPublicKey,
          plugins,
        }),
    })
  }

  const includesPlugin = (pluginName: PluginName) =>
    plugins?.some((plugin) => plugin.name === pluginName) || false

  // if we have the plugins, we are ready
  // otherwise, if the realm exists, and the governance mint does not, we have nothing to load
  // an example of this is a realm with no council token.
  const isReady = plugins !== undefined || (!!realmPublicKey && !governanceMintPublicKey)

  return {
    isReady,
    updateVoterWeightRecords,
    createVoterWeightRecords,
    updateMaxVoterWeightRecords,
    createMaxVoterWeightRecords,
    plugins,
    calculatedVoterWeight,
    calculatedMaxVoterWeight,
    ...pks,
    includesPlugin,
  }
}
