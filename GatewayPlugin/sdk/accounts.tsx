import { PublicKey } from '@solana/web3.js'
import {
  getTokenOwnerRecordAddress,
  ProgramAccount,
  Realm,
} from '@solana/spl-governance'
import { GatewayClient } from '@solana/governance-program-library/dist'
import { getRegistrarPDA, getVoterWeightRecord } from '@utils/plugin/accounts'

export const getGatekeeperNetwork = async (
  client: GatewayClient,
  realm: ProgramAccount<Realm>
): Promise<PublicKey> => {
  // Get the registrar for the realm
  const { registrar } = await getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    client.program.programId
  )
  const registrarObject = await client.program.account.registrar.fetch(
    registrar
  )

  // Find the gatekeeper network from the registrar
  return registrarObject.gatekeeperNetwork
}

export const getPredecessorProgramId = async (
  client: GatewayClient,
  realm: ProgramAccount<Realm>
): Promise<PublicKey | null> => {
  // Get the registrar for the realm
  const { registrar } = await getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    client.program.programId
  )
  const registrarObject = await client.program.account.registrar.fetch(
    registrar
  )

  // Find the gatekeeper network from the registrar
  return registrarObject.previousVoterWeightPluginProgramId
}

export const getPreviousVotingWeightRecord = async (
  client: GatewayClient,
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
  client: GatewayClient,
  gatewayToken: PublicKey,
  realm: ProgramAccount<Realm>,
  walletPk: PublicKey
) => {
  // Throw if the user has no gateway token (TODO handle this later)
  if (!gatewayToken) throw new Error(`Unable to vote: No Gateway Token found`)

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
      gatewayToken,
    })
    .instruction()
}
