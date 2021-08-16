import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { GovernanceConfig } from './accounts'
import { CreateAccountGovernanceArgs } from './instructions'

export const withCreateAccountGovernance = async (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  realm: PublicKey,
  governedAccount: PublicKey,
  config: GovernanceConfig,
  tokenOwnerRecord: PublicKey,
  payer: PublicKey,
  systemId: PublicKey
): Promise<{ governanceAddress: PublicKey }> => {
  const args = new CreateAccountGovernanceArgs({ config })
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const [governanceAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('account-governance'),
      realm.toBuffer(),
      governedAccount.toBuffer(),
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
      pubkey: governanceAddress,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: governedAccount,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: tokenOwnerRecord,
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
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
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

  return { governanceAddress }
}
