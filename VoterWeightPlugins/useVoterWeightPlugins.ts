import {PublicKey, TransactionInstruction} from '@solana/web3.js'
import queryClient from '@hooks/queries/queryClient'
import {useConnection} from '@solana/wallet-adapter-react'
import {updateVoterWeight} from './lib/updateVoterWeight'
import {createVoterWeight} from './lib/createVoterWeight'
import {CalculatedWeight, UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from './lib/types'
import {createMaxVoterWeight} from './lib/createMaxVoterWeight'
import {updateMaxVoterWeight} from './lib/updateMaxVoterWeight'
import {useUserCommunityTokenOwnerRecord} from '@hooks/queries/tokenOwnerRecord'
import {useRealmCommunityMintInfoQuery} from '@hooks/queries/mintInfo'
import {useCalculatedVoterWeight} from "./hooks/useCalculatedVoterWeight";
import {useCalculatedMaxVoterWeight} from "./hooks/useCalculatedMaxVoterWeight";
import {usePlugins} from "./hooks/usePlugins";
import {queryKeys} from "./lib/utils";
import {useVoterWeightPks} from "./hooks/useVoterWeightPks";

export interface UsePluginsReturnType {
  isReady: boolean
  plugins: VoterWeightPluginInfo[] | undefined // undefined means we are still loading
  updateVoterWeightRecords: () => Promise<{ pre: TransactionInstruction[], post: TransactionInstruction[]}>
  createVoterWeightRecords: () => Promise<TransactionInstruction[]>
  updateMaxVoterWeightRecords: () => Promise<TransactionInstruction[]>
  createMaxVoterWeightRecords: () => Promise<TransactionInstruction[]>
  calculatedVoterWeight: CalculatedWeight | undefined, // undefined means we are still loading
  calculatedMaxVoterWeight: CalculatedWeight | undefined, // undefined means we are still loading
  voterWeightPk: PublicKey | undefined // the voter weight pubkey to be used in the governance instruction itself
  maxVoterWeightPk: PublicKey | undefined // the max voter weight pubkey to be used in the governance instruction itself
}

export const useVoterWeightPlugins = (args: UseVoterWeightPluginsArgs): UsePluginsReturnType => {
  const { realmPublicKey, governanceMintPublicKey, walletPublicKey } = args
  const { connection } = useConnection()
  const tokenOwnerRecord = useUserCommunityTokenOwnerRecord().data?.result
  const mintInfo = useRealmCommunityMintInfoQuery().data?.result
  const plugins = usePlugins(args);
  const calculatedVoterWeight = useCalculatedVoterWeight({
    ...args,
    plugins,
    tokenOwnerRecord
  });
  const calculatedMaxVoterWeight = useCalculatedMaxVoterWeight({
    ...args,
    plugins,
    mintInfo
  });
  const pks = useVoterWeightPks({
    ...args,
    plugins
  });

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
          connection,
        }),
    })
  }

  const updateVoterWeightRecords = (): Promise<{ pre: TransactionInstruction[], post: TransactionInstruction[] }> => {
    if (!realmPublicKey || !governanceMintPublicKey || !walletPublicKey) {
      return Promise.resolve({ pre: [], post: [] })
    }

    return queryClient.fetchQuery({
      queryKey: ['updateVoterWeightRecords', ...queryKeys(args)],
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
      queryKey: ['createMaxVoterWeightRecords', ...queryKeys(args)],
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
      queryKey: ['updateMaxVoterWeightRecords', ...queryKeys(args)],
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
    isReady: plugins !== undefined,
    updateVoterWeightRecords,
    createVoterWeightRecords,
    updateMaxVoterWeightRecords,
    createMaxVoterWeightRecords,
    plugins,
    calculatedVoterWeight,
    calculatedMaxVoterWeight,
    ...pks
  }
}
