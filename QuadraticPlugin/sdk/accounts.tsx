import { PublicKey } from '@solana/web3.js'
import {
  getTokenOwnerRecordAddress,
  ProgramAccount,
  Realm,
} from '@solana/spl-governance'
import { QuadraticClient } from '@solana/governance-program-library'
import { getRegistrarPDA, getVoterWeightRecord } from '@utils/plugin/accounts'
import {Coefficients} from "./api";

export const getCoefficients = async (
  client: QuadraticClient,
  realm: ProgramAccount<Realm>
): Promise<Coefficients> => {
  // Get the registrar for the realm
  const { registrar } = await getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    client.program.programId
  )
  const registrarObject = await client.program.account.Registrar.fetch(
    registrar
  )

  // Find the gatekeeper network from the registrar
  return [
      registrarObject.quadraticCoefficients.a,
        registrarObject.quadraticCoefficients.b,
        registrarObject.quadraticCoefficients.c,
      ]
}

const getPredecessorProgramId = async (
  client: QuadraticClient,
  realm: ProgramAccount<Realm>
): Promise<PublicKey | null> => {
  // Get the registrar for the realm
  const { registrar } = await getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    client.program.programId
  )
  const registrarObject = await client.program.account.Registrar.fetch(
    registrar
  )

  // Find the gatekeeper network from the registrar
  return registrarObject.previousVoterWeightPluginProgramId
}

export const getPreviousVotingWeightRecord = async (
  client: QuadraticClient,
  realm: ProgramAccount<Realm>,
  walletPk: PublicKey
): Promise<PublicKey> => {
  // TODO cache this to avoid lookup every time someone votes
  const predecessorProgramId = await getPredecessorProgramId(client, realm)

  if (predecessorProgramId) {
    // this gateway plugin registrar has a predecessor plugin - get its voting weight record
    const { voterWeightPk } = await getVoterWeightRecord(
      realm.pubkey,
      realm.account.communityMint,
      walletPk,
      predecessorProgramId
    )
    return voterWeightPk
  }

  // this gateway plugin registrar has no predecessor plugin.
  // The previous voting weight record is the token owner record
  return getTokenOwnerRecordAddress(
    realm.owner,
    realm.pubkey,
    realm.account.communityMint,
    walletPk
  )
}

export const getVoteInstruction = async (
  client: QuadraticClient,
  realm: ProgramAccount<Realm>,
  walletPk: PublicKey
) => {
  // get the user's voter weight account address
  const { voterWeightPk } = await getVoterWeightRecord(
    realm.pubkey,
    realm.account.communityMint,
    walletPk,
    client.program.programId
  )

  // Get the registrar for the realm
  const { registrar } = await getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    client.program.programId
  )

  // the previous voting weight record in the chain of plugins,
  // or the token owner record if this is the first plugin in the chain
  const inputVoterWeight = await getPreviousVotingWeightRecord(
    client,
    realm,
    walletPk
  )

  // call updateVotingWeightRecord on the plugin
  return client.program.methods
    .updateVoterWeightRecord()
    .accounts({
      registrar,
      voterWeightRecord: voterWeightPk,
      inputVoterWeight,
    })
    .instruction()
}
