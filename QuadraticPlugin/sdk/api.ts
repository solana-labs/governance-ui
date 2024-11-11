import { PublicKey } from '@solana/web3.js'
import {Coefficients, QuadraticClient } from '@solana/governance-program-library'
import {
  ProgramAccount,
  Realm,
  SYSTEM_PROGRAM_ID,
} from '@solana/spl-governance'
import { getRegistrarPDA } from '@utils/plugin/accounts'

// By default, the quadratic plugin will use a function ax-2 + bx - c
// resulting in a vote weight that is the square root of the token balance
// The `a` coefficient is set to 1000, which, assuming the governance token has 6 decimals,
// will result in a vote weight that is the square root of the token balance in major denomination.
// For example,  if the token balance is 100, then the vote weight will be:
// sqrt(100 * 10^6) = 10,000 * 10^3 = 10,000,000 = 10 votes
// This should be handled dynamically by the UI in the future.
export const DEFAULT_COEFFICIENTS: Coefficients = [1000, 0, 0]

export const toAnchorType = (coefficients: Coefficients) => ({
  a: coefficients[0],
  b: coefficients[1],
  c: coefficients[2],
})

export type AnchorParams = {
  quadraticCoefficients: {
    a: number;
    b: number;
    c: number;
  }
}

// Create an instruction to create a registrar account for a given realm
export const createQuadraticRegistrarIx = async (
  realm: ProgramAccount<Realm>,
  payer: PublicKey,
  quadraticClient: QuadraticClient,
  coefficients?: Coefficients,
  predecessor?: PublicKey
) => {
  const { registrar } = getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    quadraticClient.program.programId
  )

  const remainingAccounts = predecessor
    ? [{ pubkey: predecessor, isSigner: false, isWritable: false }]
    : []

  return quadraticClient!.program.methods
    .createRegistrar(
      toAnchorType(coefficients || DEFAULT_COEFFICIENTS),
      !!predecessor
    )
    .accounts({
      registrar,
      realm: realm.pubkey,
      governanceProgramId: realm.owner,
      realmAuthority: realm.account.authority!,
      governingTokenMint: realm.account.communityMint!,
      payer,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .remainingAccounts(remainingAccounts)
    .instruction()
}
// Create an instruction to configure a registrar account for a given realm
export const configureQuadraticRegistrarIx = async (
  realm: ProgramAccount<Realm>,
  quadraticClient: QuadraticClient,
  coefficients?: Coefficients,
  predecessor?: PublicKey
) => {
  const { registrar } = getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    quadraticClient.program.programId
  )
  const remainingAccounts = predecessor
    ? [{ pubkey: predecessor, isSigner: false, isWritable: false }]
    : []
  return quadraticClient.program.methods
    .configureRegistrar(
      toAnchorType(coefficients || DEFAULT_COEFFICIENTS),
      !!predecessor
    )
    .accounts({
      registrar,
      realm: realm.pubkey,
      realmAuthority: realm.account.authority!,
    })
    .remainingAccounts(remainingAccounts)
    .instruction()
}

export const coefficientsEqual = (x: Coefficients, y: Coefficients | undefined): boolean => {
  if (!y) return false
  return x[0] === y[0] && x[1] === y[1] && x[2] === y[2]
}