import { BN } from '@coral-xyz/anchor'
import {VoterWeightPluginInfo} from "./types";
import {reduceAsync} from "./utils";
import {PublicKey} from "@solana/web3.js";

type CalculateVoterWeightParams = {
  voter: PublicKey,
  realm: PublicKey,
  mint: PublicKey
  plugins: VoterWeightPluginInfo[],
  tokenOwnerRecordPower: BN,
  useOnChainWeight?: boolean
}

export const calculateVoterWeight = async ({
    voter,
    realm,
    mint,
    plugins,
    tokenOwnerRecordPower,
    useOnChainWeight = false
}: CalculateVoterWeightParams): Promise<BN | null> => {
  // if useOnChainWeight is true, we just return the currently stored voter weight on chain (which may be out of date)
  if (useOnChainWeight) {
    return plugins[plugins.length - 1].voterWeight
  }

  const reducer = async (inputVoterWeight: BN | null, nextPlugin: VoterWeightPluginInfo) => {
    // short-circuit if any of the plugins return null
    if (inputVoterWeight === null) return null;
    return nextPlugin.client.calculateVoterWeight(voter, realm, mint, inputVoterWeight);
  };

  return reduceAsync<VoterWeightPluginInfo, BN | null>(plugins, reducer, tokenOwnerRecordPower);
}
