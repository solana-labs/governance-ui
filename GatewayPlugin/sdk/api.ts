import {PublicKey} from '@solana/web3.js'
import {GatewayClient} from '@solana/governance-program-library'
import {ProgramAccount, Realm, SYSTEM_PROGRAM_ID} from "@solana/spl-governance";
import {getRegistrarPDA} from "@utils/plugin/accounts";


// Create an instruction to create a registrar account for a given realm
export const createCivicRegistrarIx = async (
    realm: ProgramAccount<Realm>,
    payer: PublicKey,
    gatewayClient: GatewayClient,
    gatekeeperNetwork: PublicKey,
    predecessor?: PublicKey
) => {
  const {registrar} = getRegistrarPDA(
      realm.pubkey,
      realm.account.communityMint,
      gatewayClient.program.programId
  )

  const remainingAccounts = predecessor
      ? [{pubkey: predecessor, isSigner: false, isWritable: false}]
      : []

  return gatewayClient!.program.methods
      .createRegistrar(!!predecessor)
      .accounts({
        registrar,
        realm: realm.pubkey,
        governanceProgramId: realm.owner,
        realmAuthority: realm.account.authority!,
        governingTokenMint: realm.account.communityMint!,
        gatekeeperNetwork,
        payer,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .remainingAccounts(remainingAccounts)
      .instruction()
}
// Create an instruction to configure a registrar account for a given realm
export const configureCivicRegistrarIx = async (
    realm: ProgramAccount<Realm>,
    gatewayClient: GatewayClient,
    gatekeeperNetwork: PublicKey,
    predecessor?: PublicKey
) => {
  const {registrar} = getRegistrarPDA(
      realm.pubkey,
      realm.account.communityMint,
      gatewayClient.program.programId
  )
  const remainingAccounts = predecessor
      ? [{pubkey: predecessor, isSigner: false, isWritable: false}]
      : []
  return gatewayClient.program.methods
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