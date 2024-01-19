import {PublicKey, TransactionInstruction} from '@solana/web3.js'
import {
  getTokenOwnerRecordAddress,
  ProgramAccount,
  Realm,
} from '@solana/spl-governance'
import { QuadraticClient } from '@solana/governance-program-library'
import { getRegistrarPDA, getVoterWeightRecord, getMaxVoterWeightRecord } from '@utils/plugin/accounts'
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
  const registrarObject = await client.program.account.registrar.fetch(
      registrar
  )

  // Find the coefficients from the registrar
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
  const registrarObject = await client.program.account.registrar.fetch(
      registrar
  )

  // Find the gatekeeper network from the registrar
  return registrarObject.previousVoterWeightPluginProgramId
}

export const getPreviousVotingWeightRecords = async (
    client: QuadraticClient,
    realm: ProgramAccount<Realm>,
    walletPk: PublicKey
): Promise<{
  voterWeightPk: PublicKey,
  maxVoterWeightPk?: PublicKey
}> => {
  // TODO cache this to avoid lookup every time someone votes
  const predecessorProgramId = await getPredecessorProgramId(client, realm)

  if (predecessorProgramId) {
    // this registrar has a predecessor plugin - get its voting weight record
    const { voterWeightPk } = await getVoterWeightRecord(
        realm.pubkey,
        realm.account.communityMint,
        walletPk,
        predecessorProgramId
    )

    // it may or may not have a max voter weight record - check first
    const { maxVoterWeightRecord } = await getMaxVoterWeightRecord(
        realm.pubkey,
        realm.account.communityMint,
        predecessorProgramId
    )

    // Check if that predecessor max voter weight actually exists
    // voter weight plugins may not use a max voter weight record
    const hasPredecessorMaxVoterWeightRecord = !!await client.program.provider.connection.getAccountInfo(maxVoterWeightRecord);

    // only return maxVoterWeightRecord if it exists
    return { voterWeightPk, maxVoterWeightPk: hasPredecessorMaxVoterWeightRecord ? maxVoterWeightRecord : undefined }
  }

  // this plugin registrar has no predecessor plugin.
  // The previous voting weight record is the token owner record
  const tokenOwnerPk = await getTokenOwnerRecordAddress(
      realm.owner,
      realm.pubkey,
      realm.account.communityMint,
      walletPk
  )
  return {
    voterWeightPk: tokenOwnerPk,
    maxVoterWeightPk: undefined,
  }
}

/**
 * Add updateVoteWeightRecord and updateMaxVoteWeightRecord instructions
 * to the transaction before voting, to ensure that the vote weight is up to date.
 */
export const getVoteInstructions = async (
    client: QuadraticClient,
    realm: ProgramAccount<Realm>,
    walletPk: PublicKey
) => {
  const mint = realm.account.communityMint;

  const instructions: TransactionInstruction[] = [];

  const updateVoterWeightIx = await client.updateVoterWeightRecord(walletPk, realm.pubkey, mint);
  instructions.push(updateVoterWeightIx);

  return instructions;
}
