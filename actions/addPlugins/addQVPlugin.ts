// During realm creation, add a plugin that adapts the vote via the quadratic formula ax^1/2 + bx + c
import { Connection, PublicKey } from '@solana/web3.js'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import {
  DEFAULT_COEFFICIENTS,
  toAnchorType,
} from '../../QuadraticPlugin/sdk/api'
import {Coefficients, QuadraticClient} from '@solana/governance-program-library'
import { getRegistrarPDA } from '@utils/plugin/accounts'
import { SYSTEM_PROGRAM_ID } from '@solana/spl-governance'
import { AddPluginResult } from './types'
import { fetchMintInfoByPubkey } from '@hooks/queries/mintInfo'
import { DEFAULT_MINT_DECIMALS } from '@tools/governance/prepareRealmCreation'

// if the user has set coefficients, use them, otherwise use the default
// by default 'a' is set to the square root of 10^decimals where decimals is the number of decimals of the mint
// 'b' and 'c' are set to 0 by default, but can be overridden by the user
export async function getCoefficients(
  coefficientsFromForm: Coefficients | undefined,
  existingCommunityMintPk: PublicKey | undefined,
  connection: Connection
): Promise<Coefficients> {
  let qvCoefficients = coefficientsFromForm
  if (!qvCoefficients) {
    const existingCommunityMint = existingCommunityMintPk
      ? (await fetchMintInfoByPubkey(connection, existingCommunityMintPk))
          .result
      : undefined
    const communityMintDecimals =
      existingCommunityMint?.decimals || DEFAULT_MINT_DECIMALS
    const aCoefficient = Math.sqrt(10 ** communityMintDecimals) // sqrt(10^6)=1000 for a 6 decimal token
    qvCoefficients = [
      aCoefficient,
      DEFAULT_COEFFICIENTS[1],
      DEFAULT_COEFFICIENTS[2],
    ]
  }
  return qvCoefficients
}

export const addQVPlugin = async (
  connection: Connection,
  wallet: Wallet,
  realmPk: PublicKey,
  communityMintPk: PublicKey,
  programIdPk: PublicKey,
  predecessorPluginProgram: PublicKey | undefined, // if chained, set the previous plugin here
  coefficientsFromForm: Coefficients | undefined,
  existingCommunityMintPk: PublicKey | undefined
): Promise<AddPluginResult> => {
  const qvCoefficients = await getCoefficients(
    coefficientsFromForm,
    existingCommunityMintPk,
    connection
  )

  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(connection, wallet as Wallet, options)
  const isDevnet = connection.rpcEndpoint.includes('devnet')
  const quadraticClient = await QuadraticClient.connect(provider, isDevnet)

  const { registrar } = await getRegistrarPDA(
    realmPk,
    communityMintPk,
    quadraticClient.program.programId
  )

  const qvRegistrarInstruction = await quadraticClient.program.methods
    .createRegistrar(toAnchorType(qvCoefficients), !!predecessorPluginProgram) // chain with the previous if it exists
    .accounts({
      registrar,
      realm: realmPk,
      governanceProgramId: programIdPk,
      realmAuthority: wallet.publicKey, // the realm authority is not yet transferred to the Realm PDA
      governingTokenMint: communityMintPk,
      payer: wallet.publicKey,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .remainingAccounts(
      predecessorPluginProgram
        ? [
            {
              pubkey: predecessorPluginProgram,
              isWritable: false,
              isSigner: false,
            },
          ]
        : []
    )
    .instruction()

  return {
    pluginProgramId: quadraticClient.program.programId,
    instructions: [qvRegistrarInstruction],
  }
}
