import {PublicKey} from "@solana/web3.js";
import {RealmConfig} from "@solana/spl-governance";
import {getMintMaxVoteWeight} from "@models/voteWeights";
import BN from "bn.js";
import {MintInfo} from "@solana/spl-token";

export const useMintConfiguredMaxVoteWeight = (
    governanceMint?: PublicKey,
    realmConfig?: RealmConfig,
    mintInfo?: MintInfo
): BN => {
    // this allows this hook to be set up before the realm config is loaded
    if (!governanceMint || !realmConfig || !mintInfo) return new BN(0);

    if (realmConfig.councilMint && governanceMint.equals(realmConfig.councilMint)) {
        return mintInfo?.supply || new BN(0);
    }

    return getMintMaxVoteWeight(mintInfo, realmConfig.communityMintMaxVoteWeightSource);
}