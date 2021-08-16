import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { RelinquishVoteArgs } from './instructions'

export const withRelinquishVote = async (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  governance: PublicKey,
  proposal: PublicKey,
  tokenOwnerRecord: PublicKey,
  governingTokenMint: PublicKey,
  voteRecord: PublicKey,
  governanceAuthority: PublicKey | undefined,
  beneficiary: PublicKey | undefined
) => {
  const args = new RelinquishVoteArgs()
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const keys = [
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
      pubkey: voteRecord,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: governingTokenMint,
      isWritable: false,
      isSigner: false,
    },
  ]

  const existingVoteKeys =
    governanceAuthority && beneficiary
      ? [
          {
            pubkey: governanceAuthority,
            isWritable: false,
            isSigner: true,
          },
          {
            pubkey: beneficiary,
            isWritable: true,
            isSigner: false,
          },
        ]
      : []

  instructions.push(
    new TransactionInstruction({
      keys: [...keys, ...existingVoteKeys],
      programId,
      data,
    })
  )
}
