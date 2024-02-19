import {UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import {PublicKey} from "@solana/web3.js";
import {getTokenOwnerRecordAddressSync} from "../lib/utils";

type Args = UseVoterWeightPluginsArgs & {
    plugins?: VoterWeightPluginInfo[]
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKey !== undefined &&
    args.plugins !== undefined

export const useVoterWeightPks = (args: Args): {
    voterWeightPk: PublicKey | undefined,
    maxVoterWeightPk: PublicKey | undefined
} => {
    // still loading
    if (!argsAreSet(args)) return {
        voterWeightPk: undefined,
        maxVoterWeightPk: undefined
    };

    const {realmPublicKey, governanceMintPublicKey, walletPublicKey, plugins} = args;

    // no plugins - return the token owner record and null
    if (plugins.length === 0) {
        const [tokenOwnerRecord] = getTokenOwnerRecordAddressSync(realmPublicKey, governanceMintPublicKey, walletPublicKey);
        return {
            voterWeightPk: tokenOwnerRecord,
            maxVoterWeightPk: undefined
        }
    }

    const lastPlugin = plugins[plugins.length - 1];
    const { voterWeightPk} = lastPlugin.client.getVoterWeightRecordPDA(realmPublicKey, governanceMintPublicKey, walletPublicKey);
    const { maxVoterWeightPk} = lastPlugin.client.getMaxVoterWeightRecordPDA(realmPublicKey, governanceMintPublicKey) || {};

    return {
        voterWeightPk,
        maxVoterWeightPk
    }
}