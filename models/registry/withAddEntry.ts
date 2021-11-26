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

export async function withAddEntry(
  instructions: TransactionInstruction[],
  address: PublicKey,
  name: string,
  subname: string | undefined,
  imageUrl: string | undefined,
  creator: PublicKey
) {
  const [registryContext] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode(REGISTRY_CONTEXT_SEED)],
    REGISTRY_ID
  )
  const [seededPubkey, bump] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode(ENTRY_SEED), address.toBuffer()],
    REGISTRY_ID
  )
  const coder = new anchor.Coder(PROGRAM_IDL)
  const ix = coder.instruction.encode('addEntry', {
    ix: {
      bump,
      address,
      schema: 0,
      data: JSON.stringify({
        name,
        subname,
        imageUrl,
      }),
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
          pubkey: seededPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: creator,
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
