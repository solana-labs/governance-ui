import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { BPF_UPGRADE_LOADER_ID } from '@utils/tokens'

export async function createCloseProgramAccountInstruction(
  programId: PublicKey,
  receiver: PublicKey,
  signer: PublicKey
): Promise<TransactionInstruction> {
  const bpfUpgradableLoaderId = BPF_UPGRADE_LOADER_ID
  const [programDataAddress] = await PublicKey.findProgramAddress(
    [programId.toBuffer()],
    bpfUpgradableLoaderId
  )

  const keys = [
    {
      pubkey: programDataAddress,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: receiver,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: signer,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: programId,
      isWritable: true,
      isSigner: false,
    },
  ]

  return new TransactionInstruction({
    keys,
    programId: bpfUpgradableLoaderId,
    data: Buffer.from([5, 0, 0, 0]), // CloseAccount instruction bincode
  })
}
