import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { WithdrawGoverningTokensArgs } from './instructions'
import { GOVERNANCE_PROGRAM_SEED } from './accounts'

export const withWithdrawGoverningTokens = async (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  realm: PublicKey,
  governingTokenDestination: PublicKey,
  governingTokenMint: PublicKey,
  governingTokenOwner: PublicKey,
  tokenId: PublicKey
) => {
  const args = new WithdrawGoverningTokensArgs()
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const [tokenOwnerRecordAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from(GOVERNANCE_PROGRAM_SEED),
      realm.toBuffer(),
      governingTokenMint.toBuffer(),
      governingTokenOwner.toBuffer(),
    ],
    programId
  )

  const [governingTokenHoldingAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from(GOVERNANCE_PROGRAM_SEED),
      realm.toBuffer(),
      governingTokenMint.toBuffer(),
    ],
    programId
  )

  const keys = [
    { pubkey: realm, isWritable: false, isSigner: false },
    {
      pubkey: governingTokenHoldingAddress,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: governingTokenDestination,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: governingTokenOwner,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: tokenOwnerRecordAddress,
      isWritable: true,
      isSigner: false,
    },

    {
      pubkey: tokenId,
      isWritable: false,
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
