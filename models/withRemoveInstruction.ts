import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { RemoveInstructionArgs } from './instructions'

export const withRemoveInstruction = async (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  proposal: PublicKey,
  tokenOwnerRecord: PublicKey,
  governanceAuthority: PublicKey,
  proposalInstruction: PublicKey,
  beneficiary: PublicKey
) => {
  const args = new RemoveInstructionArgs()
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const keys = [
    {
      pubkey: proposal,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: tokenOwnerRecord,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: governanceAuthority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: proposalInstruction,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: beneficiary,
      isWritable: true,
      isSigner: false,
    },
  ]

  instructions.push(
    new TransactionInstruction({
      keys,
      programId,
      data,
    })
  )
}
