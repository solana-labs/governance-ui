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
  CalculatedWeight, PluginType,
  UseVoterWeightPluginsArgs,
  VoterWeightPlugins,
} from './lib/types'
import { createMaxVoterWeight } from './lib/createMaxVoterWeight'
import { updateMaxVoterWeight } from './lib/updateMaxVoterWeight'
import {useMintInfoByPubkeyQuery} from '@hooks/queries/mintInfo'
import { useCalculatedVoterWeights } from './hooks/useCalculatedVoterWeights'
import { useCalculatedMaxVoterWeight } from './hooks/useCalculatedMaxVoterWeight'
import { usePlugins } from './hooks/usePlugins'
import { queryKeys } from './lib/utils'
import { useVoterWeightPks } from './hooks/useVoterWeightPks'
import { PluginName } from '@constants/plugins'
import {ProgramAccount, TokenOwnerRecord, VoterWeightAction} from "@solana/spl-governance";
import {useTokenOwnerRecordsDelegatedToUser} from "@hooks/queries/tokenOwnerRecord";
import {useTokenOwnerRecord} from "./hooks/useTokenOwnerRecord";

/**
 * Represents the return type of the `useVoterWeightPlugins` hook.
 */
export interface UseVoterWeightPluginsReturnType {
  isReady: boolean
  plugins: VoterWeightPlugins | undefined // undefined means we are still loading
  updateVoterWeightRecords: (walletPk: PublicKey, action?: VoterWeightAction, target?: PublicKey) => Promise<{
    pre: TransactionInstruction[]
    post: TransactionInstruction[]
  }>
  createVoterWeightRecords: (walletPk: PublicKey) => Promise<TransactionInstruction[]>
  updateMaxVoterWeightRecords: () => Promise<TransactionInstruction[]>
  createMaxVoterWeightRecords: () => Promise<TransactionInstruction[]>
  calculatedVoterWeights: CalculatedWeight[] | undefined // undefined means we are still loading
  calculatedMaxVoterWeight: CalculatedWeight | undefined // undefined means we are still loading
  voterWeightPks: PublicKey[] | undefined // the voter weight pubkeys to be used in the governance instruction itself
  maxVoterWeightPk: PublicKey | undefined // the max voter weight pubkey to be used in the governance instruction itself

  //auxiliary functions to the ui
  includesPlugin: (name: PluginName) => boolean
}

/**
 * Retrieves voter weight plugin information, calculated voter weights and provides functions to create/update voter weight records.
 *
 * @returns {UseVoterWeightPluginsReturnType}
 * @param args
 */
export const useVoterWeightPlugins = (
  args: UseVoterWeightPluginsArgs
): UseVoterWeightPluginsReturnType => {
  const { realmPublicKey, governanceMintPublicKey, walletPublicKeys } = args
  const mintInfo = useMintInfoByPubkeyQuery(args.governanceMintPublicKey).data?.result;
  const walletTokenOwnerRecord = useTokenOwnerRecord(args.governanceMintPublicKey);
  const delegatedTokenOwnerRecords = useTokenOwnerRecordsDelegatedToUser().data;
  const { data: plugins } = usePlugins(args)
  const { result: calculatedVoterWeights} = useCalculatedVoterWeights({
    ...args,
    plugins: plugins?.voterWeight,
    tokenOwnerRecords: [walletTokenOwnerRecord, ...(delegatedTokenOwnerRecords || [])].filter(Boolean) as ProgramAccount<TokenOwnerRecord>[],
  })
  const { result: calculatedMaxVoterWeight} = useCalculatedMaxVoterWeight({
    ...args,
    plugins: plugins?.maxVoterWeight,
    mintInfo,
    realmConfig: args.realmConfig
  })
  const pks = useVoterWeightPks({
    ...args,
    plugins: plugins?.voterWeight,
  }).result ?? { voterWeightPks: undefined, maxVoterWeightPk: undefined }

  const createVoterWeightRecords = (walletPublicKey: PublicKey): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey) {
      return Promise.resolve([])
    }

    const queryArgs = {
        realmPublicKey,
        governanceMintPublicKey,
        walletPublicKey,
    }

    return queryClient.fetchQuery({
      queryKey: ['createVoterWeightRecords', ...queryKeys(queryArgs)],
      queryFn: () =>
        createVoterWeight({
          walletPublicKey,
          realmPublicKey,
          governanceMintPublicKey,
          plugins: plugins?.voterWeight,
        }),
    })
  }

  const updateVoterWeightRecords = (walletPublicKey: PublicKey, action?: VoterWeightAction, target?: PublicKey): Promise<{
    pre: TransactionInstruction[]
    post: TransactionInstruction[]
  }> => {
    if (!realmPublicKey || !governanceMintPublicKey) {
      return Promise.resolve({ pre: [], post: [] })
    }

    const queryArgs = {
      realmPublicKey,
      governanceMintPublicKey,
      walletPublicKey,
    }

    return queryClient.fetchQuery({
      queryKey: ['updateVoterWeightRecords', ...queryKeys(queryArgs), action],
      queryFn: () =>
        updateVoterWeight({
          walletPublicKey,
          realmPublicKey,
          governanceMintPublicKey,
          plugins: plugins?.voterWeight,
          action,
          target
        }),
    })
  }

  const createMaxVoterWeightRecords = (): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKeys) {
      return Promise.resolve([])
    }

    const queryArgs = {
      realmPublicKey,
      governanceMintPublicKey,
    }

    return queryClient.fetchQuery({
      queryKey: ['createMaxVoterWeightRecords', ...queryKeys(queryArgs)],
      queryFn: () =>
        createMaxVoterWeight({
          realmPublicKey,
          governanceMintPublicKey,
          plugins: plugins?.maxVoterWeight,
        }),
    })
  }

  const updateMaxVoterWeightRecords = (): Promise<TransactionInstruction[]> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKeys) {
      return Promise.resolve([])
    }

    const queryArgs = {
      realmPublicKey,
      governanceMintPublicKey,
    }

    return queryClient.fetchQuery({
      queryKey: ['updateMaxVoterWeightRecords', ...queryKeys(queryArgs)],
      queryFn: () =>
        updateMaxVoterWeight({
          realmPublicKey,
          governanceMintPublicKey,
          plugins: plugins?.maxVoterWeight,
        }),
    })
  }

  const includesPlugin = (pluginName: PluginName, type: PluginType = 'voterWeight') =>
    plugins?.[type]?.some((plugin) => plugin.name === pluginName) || false

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
    calculatedVoterWeights,
    calculatedMaxVoterWeight,
    ...pks,
    includesPlugin,
  }
}
