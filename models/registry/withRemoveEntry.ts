import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import * as anchor from '@project-serum/anchor'
import {
  ENTRY_SEED,
  REGISTRY_CONTEXT_SEED,
  REGISTRY_ID,
  PROGRAM_IDL,
} from './api'

export async function withRemoveEntry(
  instructions: TransactionInstruction[],
  address: PublicKey,
  authority: PublicKey
) {
  const [registryContext] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode(REGISTRY_CONTEXT_SEED)],
    REGISTRY_ID
  )
  const [seededPubkey] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode(ENTRY_SEED), address.toBuffer()],
    REGISTRY_ID
  )
  const coder = new anchor.Coder(PROGRAM_IDL)
  const ix = coder.instruction.encode('removeEntry', {
    ix: {},
  })
  instructions.push(
    new TransactionInstruction({
      programId: REGISTRY_ID,
      data: ix,
      keys: [
        {
          pubkey: registryContext,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: seededPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: authority,
          isSigner: true,
          isWritable: false,
        },
      ],
    })
  )
}
