import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { InsertInstructionArgs } from './instructions'
import { GOVERNANCE_PROGRAM_SEED, InstructionData } from './accounts'
import { SYSTEM_PROGRAM_ID } from './core/api'

export const withInsertInstruction = async (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  governance: PublicKey,
  proposal: PublicKey,
  tokenOwnerRecord: PublicKey,
  governanceAuthority: PublicKey,
  index: number,
  holdUpTime: number,
  instructionData: InstructionData,
  payer: PublicKey
) => {
  const args = new InsertInstructionArgs({
    index,
    holdUpTime,
    instructionData: instructionData,
  })
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))
  const systemId = SYSTEM_PROGRAM_ID
  const instructionIndexBuffer = Buffer.alloc(2)
  instructionIndexBuffer.writeInt16LE(index, 0)

  const [proposalInstructionAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from(GOVERNANCE_PROGRAM_SEED),
      proposal.toBuffer(),
      instructionIndexBuffer,
    ],
    programId
  )

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
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: governanceAuthority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: proposalInstructionAddress,
      isWritable: true,
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
  ]

  instructions.push(
    new TransactionInstruction({
      keys,
      programId,
      data,
    })
  )
}
