import { ProgramAccount, TokenOwnerRecord } from '@solana/spl-governance'
import {
  CalculatedWeight,
  UseVoterWeightPluginsArgs,
  VoterWeightPluginInfo,
} from '../lib/types'
import { calculateVoterWeight } from '../lib/calculateVoterWeights'
import { useAsync, UseAsyncReturn } from 'react-async-hook'
import {PublicKey} from "@solana/web3.js";

type Args = UseVoterWeightPluginsArgs & {
  realmPublicKey?: PublicKey
  governanceMintPublicKey?: PublicKey
  walletPublicKeys?: PublicKey[]
  plugins?: VoterWeightPluginInfo[]
  tokenOwnerRecords?: ProgramAccount<TokenOwnerRecord>[]
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKeys !== undefined &&
    args.plugins !== undefined && args.tokenOwnerRecords !== undefined

export const useCalculatedVoterWeights = (args: Args) : UseAsyncReturn<CalculatedWeight[] | undefined> =>
    useAsync(
        async () => {
            if (!argsAreSet(args)) return undefined;

            const voterWeights = args.walletPublicKeys?.map(wallet => {
                const tokenOwnerRecord = args.tokenOwnerRecords?.find(tor => tor.account.governingTokenOwner.equals(wallet));
                return calculateVoterWeight({
                    ...args as Required<Args>,
                    walletPublicKey: wallet,
                    tokenOwnerRecord,
                });
            });
            return Promise.all(voterWeights);
        },
        [
            args.realmPublicKey?.toString(),
            args.governanceMintPublicKey?.toString(),
            args.walletPublicKeys?.map(pubkey => pubkey.toString()).join(","),
            args.tokenOwnerRecords?.map(tor => tor.account.governingTokenDepositAmount).join(","),
            args.plugins?.length
        ]
    )