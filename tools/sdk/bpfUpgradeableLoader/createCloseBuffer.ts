import { BPF_UPGRADE_LOADER_ID } from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'

export async function createCloseBuffer(
  bufferAddress: PublicKey,
  closedAccountSolReceiver: PublicKey,
  upgradeAuthority: PublicKey
) {
  const bpfUpgradableLoaderId = BPF_UPGRADE_LOADER_ID

  const keys = [
    {
      pubkey: bufferAddress,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: closedAccountSolReceiver,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: upgradeAuthority,
      isWritable: false,
      isSigner: true,
    },
  ]

  return new TransactionInstruction({
    keys,
    programId: bpfUpgradableLoaderId,
    data: Buffer.from([5, 0, 0, 0]), // close instruction bincode
  })
}
