import {UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import {PublicKey} from "@solana/web3.js";
import {getTokenOwnerRecordAddressSync} from "../lib/utils";
import {useAsync, UseAsyncReturn} from "react-async-hook";

type Args = UseVoterWeightPluginsArgs & {
    plugins?: VoterWeightPluginInfo[]
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKeys !== undefined &&
    args.plugins !== undefined

export const useVoterWeightPks = (args: Args): UseAsyncReturn<{
    voterWeightPks: PublicKey[] | undefined,
    maxVoterWeightPk: PublicKey | undefined
}> =>
    useAsync(async () => {
        // still loading
        if (!argsAreSet(args)) return {
            voterWeightPks: undefined,
            maxVoterWeightPk: undefined
        };

        const {realmPublicKey, governanceMintPublicKey, walletPublicKeys, plugins} = args;

        // no plugins - return the token owner record and null
        if (plugins.length === 0) {
            const tokenOwnerRecords = walletPublicKeys.map(walletPublicKey => getTokenOwnerRecordAddressSync(realmPublicKey, governanceMintPublicKey, walletPublicKey));
            return {
                voterWeightPks: tokenOwnerRecords.map(([tokenOwnerRecord]) => tokenOwnerRecord),
                maxVoterWeightPk: undefined
            }
        }

        const lastPlugin = plugins[plugins.length - 1];

        const voterWeightPks = await Promise.all(walletPublicKeys.map(walletPublicKey =>
            lastPlugin.client.getVoterWeightRecordPDA(realmPublicKey, governanceMintPublicKey, walletPublicKey)
                .then(pda => pda.voterWeightPk)
        ));
        const {maxVoterWeightPk} = await lastPlugin.client.getMaxVoterWeightRecordPDA(realmPublicKey, governanceMintPublicKey) || {};

        return {
            voterWeightPks,
            maxVoterWeightPk
        }
    }, [
        args.plugins?.length,
        args.walletPublicKeys?.map((pk) => pk.toBase58()).join(','),
      ])