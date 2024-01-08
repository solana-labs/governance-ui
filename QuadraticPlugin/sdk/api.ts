import {PublicKey} from '@solana/web3.js'
import {QuadraticClient} from '@solana/governance-program-library'
import {ProgramAccount, Realm, SYSTEM_PROGRAM_ID} from "@solana/spl-governance";
import {getRegistrarPDA} from "@utils/plugin/accounts";

export type Coefficients = [ a: number, b: number, c: number ];

// Get the registrar account for a given realm
export const tryGetQuadraticRegistrar = async (
  registrarPk: PublicKey,
  quadraticClient: QuadraticClient
) => {
  try {
    return await quadraticClient.program.account.registrar.fetch(
      registrarPk
    )
  } catch (e) {
    return null
  }
}

// Create an instruction to create a registrar account for a given realm
export const createQuadraticRegistrarIx = async (
    realm: ProgramAccount<Realm>,
    payer: PublicKey,
    quadraticClient: QuadraticClient,
    coefficients?:  Coefficients,
    predecessor?: PublicKey,
) => {
    const {registrar} = await getRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        quadraticClient.program.programId
    )

    const remainingAccounts = predecessor
        ? [{pubkey: predecessor, isSigner: false, isWritable: false}]
        : []

    return quadraticClient!.program.methods
        .createRegistrar(false)
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
export const configureCivicRegistrarIx = async (
    realm: ProgramAccount<Realm>,
    quadraticClient: QuadraticClient,
    gatekeeperNetwork: PublicKey,
    predecessor?: PublicKey
) => {
  const {registrar} = await getRegistrarPDA(
      realm.pubkey,
      realm.account.communityMint,
      quadraticClient.program.programId
  )
  const remainingAccounts = predecessor
      ? [{pubkey: predecessor, isSigner: false, isWritable: false}]
      : []
  return quadraticClient.program.methods
      .configureRegistrar(false)
      .accounts({
        registrar,
        realm: realm.pubkey,
        realmAuthority: realm.account.authority!,
        gatekeeperNetwork: gatekeeperNetwork,
      })
      .remainingAccounts(remainingAccounts)
      .instruction()
}