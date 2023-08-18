// Copied from Explorer code https://github.com/solana-labs/solana/blob/master/explorer/src/validators/accounts/upgradeable-program.ts

import { type, number, literal, nullable, Infer } from 'superstruct'
import { PublicKeyFromString } from '../pubkey'

export type ProgramAccountInfo = Infer<typeof ProgramAccountInfo>
export const ProgramAccountInfo = type({
  programData: PublicKeyFromString,
})

export type ProgramAccount = Infer<typeof ProgramDataAccount>
export const ProgramAccount = type({
  type: literal('program'),
  info: ProgramAccountInfo,
})

export type ProgramDataAccountInfo = Infer<typeof ProgramDataAccountInfo>
export const ProgramDataAccountInfo = type({
  authority: nullable(PublicKeyFromString),
  // don't care about data yet
  slot: number(),
})

export type ProgramDataAccount = Infer<typeof ProgramDataAccount>
export const ProgramDataAccount = type({
  type: literal('programData'),
  info: ProgramDataAccountInfo,
})

export type ProgramBufferAccountInfo = Infer<typeof ProgramBufferAccountInfo>
export const ProgramBufferAccountInfo = type({
  authority: nullable(PublicKeyFromString),
  // don't care about data yet
})

export type ProgramBufferAccount = Infer<typeof ProgramBufferAccount>
export const ProgramBufferAccount = type({
  type: literal('buffer'),
  info: ProgramBufferAccountInfo,
})
