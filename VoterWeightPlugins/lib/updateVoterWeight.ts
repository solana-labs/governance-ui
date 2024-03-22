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
  target?: PublicKey
}

export const updateVoterWeight = async ({
  walletPublicKey,
  realmPublicKey,
  governanceMintPublicKey,
  plugins = [],
  action,
  target
}: UpdateVoterWeightRecordArgs): Promise<{ pre: TransactionInstruction[], post: TransactionInstruction[]}> => {
  const preIxes: TransactionInstruction[] = []
  const postIxes: TransactionInstruction[] = []

  // This callback returns the previous plugin's voter weight record PDA
  // We pass it into the current plugin's updateVoterWeightRecord method
  // so that it knows what the previous voter weight record was.
  // Most VWRs are derived the same way, but some (e.g. VSR) use a different derivation
  // function, so this decouples the plugins in this regard.
  let getVoterWeightRecordCallback: (() => Promise<PublicKey>) | undefined = undefined;

  for (const plugin of plugins) {
    const updateVoterWeightRecordIx = await plugin.client.updateVoterWeightRecord(
      walletPublicKey,
      realmPublicKey,
      governanceMintPublicKey,
      action,
      getVoterWeightRecordCallback,
      target
    )
    preIxes.push(...updateVoterWeightRecordIx.pre)
    postIxes.push(...updateVoterWeightRecordIx.post || [])

    getVoterWeightRecordCallback = async () => (await plugin.client.getVoterWeightRecordPDA(realmPublicKey, governanceMintPublicKey, walletPublicKey)).voterWeightPk
  }

  return { pre: preIxes, post: postIxes }
}
