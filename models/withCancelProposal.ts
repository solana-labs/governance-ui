import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { CancelProposalArgs } from './instructions'
import { InstructionData } from './accounts'

export const withCancelProposal = (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  proposal: PublicKey,
  tokenOwnerRecord: PublicKey,
  governanceAuthority: PublicKey
) => {
  const args = new CancelProposalArgs()
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
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
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
