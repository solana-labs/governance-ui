import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { FinalizeVoteArgs } from './instructions'

export const withFinalizeVote = async (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  realm: PublicKey,
  governance: PublicKey,
  proposal: PublicKey,
  governingTokenMint: PublicKey
) => {
  const args = new FinalizeVoteArgs()
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const keys = [
    {
      pubkey: realm,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: governance,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: proposal,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: governingTokenMint,
      isWritable: false,
      isSigner: false,
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
