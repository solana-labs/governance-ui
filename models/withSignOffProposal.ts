import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { SignOffProposalArgs } from './instructions'

export const withSignOffProposal = (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  proposal: PublicKey,
  signatoryRecord: PublicKey,
  signatory: PublicKey
) => {
  const args = new SignOffProposalArgs()
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const keys = [
    {
      pubkey: proposal,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: signatoryRecord,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: signatory,
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
