import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { SetGovernanceDelegateArgs } from './instructions'

export const withSetGovernanceDelegate = (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  governanceAuthority: PublicKey,
  tokenOwnerRecord: PublicKey,
  newGovernanceDelegate?: PublicKey
) => {
  const args = new SetGovernanceDelegateArgs({ newGovernanceDelegate })
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const keys = [
    {
      pubkey: governanceAuthority,
      isWritable: false,
      isSigner: true,
    },

    {
      pubkey: tokenOwnerRecord,
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
