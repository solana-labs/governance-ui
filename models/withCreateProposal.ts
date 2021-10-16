import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { CreateProposalArgs } from './instructions'
import { GOVERNANCE_PROGRAM_SEED } from './accounts'

export const withCreateProposal = async (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  realm: PublicKey,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  governanceAuthority: PublicKey,
  proposalIndex: number,
  payer: PublicKey,
  systemId: PublicKey
) => {
  const args = new CreateProposalArgs({
    name,
    descriptionLink,
    governingTokenMint,
  })
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const proposalIndexBuffer = Buffer.alloc(4)
  proposalIndexBuffer.writeInt32LE(proposalIndex, 0)

  const [proposalAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from(GOVERNANCE_PROGRAM_SEED),
      governance.toBuffer(),
      governingTokenMint.toBuffer(),
      proposalIndexBuffer,
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
      pubkey: proposalAddress,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: governance,
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
    {
      pubkey: SYSVAR_CLOCK_PUBKEY,
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

  return proposalAddress
}
