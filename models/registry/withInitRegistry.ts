import {
  SystemProgram,
  TransactionInstruction,
  PublicKey,
} from '@solana/web3.js'
import * as anchor from '@project-serum/anchor'
import {
  ENTRY_SEED,
  REGISTRY_CONTEXT_SEED,
  REGISTRY_ID,
  PROGRAM_IDL,
} from './api'

export async function withInit(
  instructions: TransactionInstruction[],
  authority: PublicKey
) {
  const [registryContext, bump] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode(REGISTRY_CONTEXT_SEED)],
    REGISTRY_ID
  )
  const coder = new anchor.Coder(PROGRAM_IDL)
  const ix = coder.instruction.encode('init', {
    ix: {
      bump,
      entrySeed: ENTRY_SEED,
      permissionless_add: true,
    },
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
          pubkey: authority,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
    })
  )
}
