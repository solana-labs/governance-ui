import { BN } from '@coral-xyz/anchor'
import {VoterWeightPluginInfo} from "./types";
import {reduceAsync} from "./utils";
import {PublicKey} from "@solana/web3.js";
import {ProgramAccount, TokenOwnerRecord} from "@solana/spl-governance";

type CalculateVoterWeightParams = {
  walletPublicKey: PublicKey,
  realmPublicKey: PublicKey,
  governanceMintPublicKey: PublicKey
  plugins: VoterWeightPluginInfo[],
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
  useOnChainWeight?: boolean
}

export const calculateVoterWeight = async ({
    walletPublicKey,
    realmPublicKey,
    governanceMintPublicKey,
    plugins,
    tokenOwnerRecord,
    useOnChainWeight = false
}: CalculateVoterWeightParams): Promise<BN | null> => {
  // if useOnChainWeight is true, we just return the currently stored voter weight on chain (which may be out of date)
  if (useOnChainWeight) {
    return plugins[plugins.length - 1].voterWeight
  }

  const tokenOwnerRecordPower = tokenOwnerRecord?.account.governingTokenDepositAmount;

  const reducer = async (inputVoterWeight: BN | null, nextPlugin: VoterWeightPluginInfo) => {
    // short-circuit if any of the plugins return null
    if (inputVoterWeight === null) return null;
    return nextPlugin.client.calculateVoterWeight(walletPublicKey, realmPublicKey, governanceMintPublicKey, inputVoterWeight);
  };

  return reduceAsync<VoterWeightPluginInfo, BN | null>(plugins, reducer, tokenOwnerRecordPower);
}
