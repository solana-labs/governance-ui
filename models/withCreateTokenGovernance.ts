import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { GovernanceConfig } from './accounts'
import { CreateTokenGovernanceArgs } from './instructions'

export const withCreateTokenGovernance = async (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  realm: PublicKey,
  governedToken: PublicKey,
  config: GovernanceConfig,
  transferTokenOwner: boolean,
  tokenOwner: PublicKey,
  tokenOwnerRecord: PublicKey,
  payer: PublicKey,
  tokenId: PublicKey,
  systemId: PublicKey
): Promise<{ governanceAddress: PublicKey }> => {
  const args = new CreateTokenGovernanceArgs({
    config,
    transferTokenOwner,
  })
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const [tokenGovernanceAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('token-governance'),
      realm.toBuffer(),
      governedToken.toBuffer(),
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
      pubkey: tokenGovernanceAddress,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: governedToken,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: tokenOwner,
      isWritable: false,
      isSigner: true,
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
      pubkey: tokenId,
      isWritable: false,
      isSigner: false,
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

  return { governanceAddress: tokenGovernanceAddress }
}
