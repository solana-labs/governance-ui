import {
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import {VoterWeightAction} from "@solana/spl-governance";
import {VoterWeightPluginInfo} from "./types";

interface UpdateVoterWeightRecordArgs {
  walletPublicKey: PublicKey
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  plugins?: VoterWeightPluginInfo[]
  action?: VoterWeightAction
}

export const updateVoterWeight = async ({
  walletPublicKey,
  realmPublicKey,
  governanceMintPublicKey,
  plugins = [],
  action
}: UpdateVoterWeightRecordArgs): Promise<{ pre: TransactionInstruction[], post: TransactionInstruction[]}> => {
  const preIxes: TransactionInstruction[] = []
  const postIxes: TransactionInstruction[] = []

  for (const plugin of plugins) {
    const updateVoterWeightRecordIx = await plugin.client.updateVoterWeightRecord(
      walletPublicKey,
      realmPublicKey,
      governanceMintPublicKey,
      action
    )
    preIxes.push(...updateVoterWeightRecordIx.pre)
    postIxes.push(...updateVoterWeightRecordIx.post || [])
  }
  return { pre: preIxes, post: postIxes }
}
