import { BN } from '@coral-xyz/anchor'
import {VoterWeightPluginInfo} from "./types";
import {reduceAsync} from "./utils";
import {PublicKey} from "@solana/web3.js";
import {MintInfo} from "@solana/spl-token";

type CalculateMaxVoterWeightParams = {
  realmPublicKey: PublicKey,
  governanceMintPublicKey: PublicKey
  plugins: VoterWeightPluginInfo[],
  mintInfo: MintInfo,
  useOnChainWeight?: boolean
}

export const calculateMaxVoterWeight = async ({
  realmPublicKey,
  governanceMintPublicKey,
  plugins,
  mintInfo,
  useOnChainWeight = false
 }: CalculateMaxVoterWeightParams): Promise<BN | null> => {
  // if useOnChainWeight is true, we just return the currently stored voter weight on chain (which may be out of date)
  if (useOnChainWeight) {
    return plugins[plugins.length - 1].maxVoterWeight ?? null
  }

    const tokenSupply = mintInfo?.supply

  const reducer = async (inputVoterWeight: BN | null, nextPlugin: VoterWeightPluginInfo) => {
    // short-circuit if any of the plugins return null
    if (inputVoterWeight === null) return null;
    return nextPlugin.client.calculateMaxVoterWeight(realmPublicKey, governanceMintPublicKey, inputVoterWeight);
  };

  return reduceAsync<VoterWeightPluginInfo, BN | null>(plugins, reducer, tokenSupply);
}
