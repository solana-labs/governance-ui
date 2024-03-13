import {UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import {PublicKey} from "@solana/web3.js";
import {getTokenOwnerRecordAddressSync} from "../lib/utils";

type Args = UseVoterWeightPluginsArgs & {
    plugins?: VoterWeightPluginInfo[]
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKeys !== undefined &&
    args.plugins !== undefined

export const useVoterWeightPks = (args: Args): {
    voterWeightPks: PublicKey[] | undefined,
    maxVoterWeightPk: PublicKey | undefined
} => {
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

    const voterWeightPks = walletPublicKeys.map(walletPublicKey => lastPlugin.client.getVoterWeightRecordPDA(realmPublicKey, governanceMintPublicKey, walletPublicKey).voterWeightPk);
    const { maxVoterWeightPk} = lastPlugin.client.getMaxVoterWeightRecordPDA(realmPublicKey, governanceMintPublicKey) || {};

    return {
        voterWeightPks,
        maxVoterWeightPk
    }
}