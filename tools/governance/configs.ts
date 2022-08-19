import {
  getRealmConfigAddress,
  GovernanceAccountParser,
  GoverningTokenConfig,
  GoverningTokenType,
  ProgramAccount,
  PROGRAM_VERSION_V3,
  RealmConfigAccount,
  VoteThreshold,
  VoteThresholdType,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'

export function createGovernanceThresholds(
  programVersion: number,
  communityYesVotePercentage: number
) {
  const communityVoteThreshold = new VoteThreshold({
    value: communityYesVotePercentage,
    type: VoteThresholdType.YesVotePercentage,
  })

  // For backward compatybility with spl-gov versions <= 2
  // for Council vote and Veto vote thresholds we have to pass YesVotePerentage(0)
  const undefinedThreshold = new VoteThreshold({
    type: VoteThresholdType.YesVotePercentage,
    value: 0,
  })

  // TODO: For spl-gov v3 add suport for seperate council vote threshold in the UI
  // Until it's supported we default it to community vote threshold
  const councilVoteThreshold =
    programVersion >= PROGRAM_VERSION_V3
      ? communityVoteThreshold
      : undefinedThreshold

  // TODO: For spl-gov v3 add suport for seperate council Veto vote threshold in the UI
  // Until it's supported we default it to community vote threshold
  const councilVetoVoteThreshold =
    programVersion >= PROGRAM_VERSION_V3
      ? communityVoteThreshold
      : undefinedThreshold

  return {
    communityVoteThreshold,
    councilVoteThreshold,
    councilVetoVoteThreshold,
  }
}

export function createDefaultRealmConfigAccount(realmPk: PublicKey) {
  const defaultTokenConfig = new GoverningTokenConfig({
    voterWeightAddin: undefined,
    maxVoterWeightAddin: undefined,
    tokenType: GoverningTokenType.Liquid,
    reserved: new Uint8Array(),
  })

  return new RealmConfigAccount({
    realm: realmPk,
    communityTokenConfig: defaultTokenConfig,
    councilTokenConfig: defaultTokenConfig,
    reserved: new Uint8Array(),
  })
}

export async function getRealmConfigAccountOrDefault(
  connection: Connection,
  programId: PublicKey,
  realmPk: PublicKey
) {
  const realmConfigPk = await getRealmConfigAddress(programId, realmPk)
  const accountInfo = await connection.getAccountInfo(realmConfigPk)

  return (accountInfo
    ? GovernanceAccountParser(RealmConfigAccount)(realmConfigPk, accountInfo)
    : // If the account doesn't exist then create a default instance
      {
        pubkey: realmConfigPk,
        owner: programId,
        account: createDefaultRealmConfigAccount(realmPk),
      }) as ProgramAccount<RealmConfigAccount>
}
