import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { CastVoteArgs, Vote } from './instructions'
import { GOVERNANCE_PROGRAM_SEED } from './accounts'

export const withCastVote = async (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  realm: PublicKey,
  governance: PublicKey,
  proposal: PublicKey,
  tokenOwnerRecord: PublicKey,
  governanceAuthority: PublicKey,
  governingTokenMint: PublicKey,
  vote: Vote,
  payer: PublicKey,
  systemId: PublicKey
) => {
  const args = new CastVoteArgs({ vote })
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const [voteRecordAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from(GOVERNANCE_PROGRAM_SEED),
      proposal.toBuffer(),
      tokenOwnerRecord.toBuffer(),
    ],
    programId
  )

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
      pubkey: tokenOwnerRecord,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: governanceAuthority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: voteRecordAddress,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: governingTokenMint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: payer,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: systemId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
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
