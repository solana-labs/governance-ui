import { PublicKey } from '@solana/web3.js'
import { findGatewayToken, GatewayToken } from '@identity.com/solana-gateway-ts'
import { ProgramAccount, Realm } from '@solana/spl-governance'
import { GatewayClient } from '@solana/governance-program-library/dist'

// TODO merge this with NFTVotePlugin as it is essentially identical
export const getGatewayRegistrarPDA = async (
  realmPk: PublicKey,
  mint: PublicKey,
  clientProgramId: PublicKey
) => {
  const [registrar, registrarBump] = await PublicKey.findProgramAddress(
    [Buffer.from('registrar'), realmPk.toBuffer(), mint.toBuffer()],
    clientProgramId
  )
  return {
    registrar,
    registrarBump,
  }
}

export const getGatewayMaxVoterWeightRecord = async (
  realmPk: PublicKey,
  mint: PublicKey,
  clientProgramId: PublicKey
) => {
  const [
    maxVoterWeightRecord,
    maxVoterWeightRecordBump,
  ] = await PublicKey.findProgramAddress(
    [
      Buffer.from('max-voter-weight-record'),
      realmPk.toBuffer(),
      mint.toBuffer(),
    ],
    clientProgramId
  )
  return {
    maxVoterWeightRecord,
    maxVoterWeightRecordBump,
  }
}

export const getGatewayVoterWeightRecord = async (
  realmPk: PublicKey,
  mint: PublicKey,
  walletPk: PublicKey,
  clientProgramId: PublicKey
) => {
  const [
    voterWeightPk,
    voterWeightRecordBump,
  ] = await PublicKey.findProgramAddress(
    [
      Buffer.from('voter-weight-record'),
      realmPk.toBuffer(),
      mint.toBuffer(),
      walletPk.toBuffer(),
    ],
    clientProgramId
  )

  console.log('getGatewayVoterWeightRecord', [
    voterWeightPk,
    voterWeightRecordBump,
  ])

  return {
    voterWeightPk,
    voterWeightRecordBump,
  }
}

export type GatewayTokenContext = {
  gatewayToken: GatewayToken | null
  gatekeeperNetwork: PublicKey
}

export const getGatewayTokenContext = async (
  client: GatewayClient,
  realm: ProgramAccount<Realm>,
  walletPk: PublicKey
): Promise<GatewayTokenContext> => {
  // Get the registrar for the realm
  const { registrar } = await getGatewayRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    client.program.programId
  )
  console.log('GATEWAY: getGatewayToken registrar', registrar)
  console.log('GATEWAY: getGatewayToken program', client.program.account)
  // @ts-ignore
  const registrarObject = await client.program.account.registrar.fetch(
    registrar
  )

  // Find the gatekeeper network from the registrar
  console.log('GATEWAY: getGatewayToken registrarObject', registrarObject)
  const gatekeeperNetwork = registrarObject.gatekeeperNetwork

  // lookup the voter's gateway token in the gatekeeper network
  const gatewayToken = await findGatewayToken(
    client.program.provider.connection,
    walletPk,
    gatekeeperNetwork
  )

  return { gatewayToken, gatekeeperNetwork }
}

export const getVoteInstruction = async (
  client: GatewayClient,
  realm: ProgramAccount<Realm>,
  walletPk: PublicKey,
  proposalPk: PublicKey
) => {
  const { gatewayToken } = await getGatewayTokenContext(client, realm, walletPk)
  // Throw if the user has no gateway token (TODO handle this later)
  if (!gatewayToken) throw new Error(`Unable to vote: No Gateway Token found`)

  // get the user's voter weight account address
  const { voterWeightPk } = await getGatewayVoterWeightRecord(
    realm.pubkey,
    realm.account.communityMint,
    walletPk,
    client.program.programId
  )

  // Get the registrar for the realm
  const { registrar } = await getGatewayRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    client.program.programId
  )

  // call updateVoterWeightRecord on the plugin
  return client.program.methods
    .updateVoterWeightRecord({ castVote: {} }, proposalPk)
    .accounts({
      registrar,
      voterWeightRecord: voterWeightPk,
      gatewayToken: gatewayToken.publicKey,
    })
    .instruction()
}
