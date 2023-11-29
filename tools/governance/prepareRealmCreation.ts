import {
  PublicKey,
  Keypair,
  TransactionInstruction,
  Connection,
} from '@solana/web3.js'

import {
  GovernanceConfig,
  GoverningTokenConfigAccountArgs,
  GoverningTokenType,
  SetRealmAuthorityAction,
  TOKEN_PROGRAM_ID,
  VoteThresholdType,
  VoteTipping,
  WalletSigner,
  withCreateGovernance,
  withCreateNativeTreasury,
  withCreateRealm,
  withCreateTokenOwnerRecord,
  withDepositGoverningTokens,
  withSetRealmAuthority,
} from '@solana/spl-governance'

import { getWalletPublicKey } from '@utils/sendTransactions'

import { parseMintMaxVoteWeight } from '@tools/governance/units'
import {
  getTimestampFromDays,
  getMintNaturalAmountFromDecimalAsBN,
  getTimestampFromHours,
} from '@tools/sdk/units'
import { withCreateMint } from '@tools/sdk/splToken/withCreateMint'
import { withCreateAssociatedTokenAccount } from '@tools/sdk/splToken/withCreateAssociatedTokenAccount'
import { withMintTo } from '@tools/sdk/splToken/withMintTo'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'

import BN from 'bn.js'
import { createGovernanceThresholds } from './configs'
import { Token } from '@solana/spl-token'
import { fetchProgramVersion } from '@hooks/queries/useProgramVersionQuery'
import { fetchMintInfoByPubkey } from '@hooks/queries/mintInfo'

export interface Web3Context {
  connection: Connection
  wallet: WalletSigner
}
interface RealmCreationV2 {
  _programVersion: 2

  programIdAddress: string

  realmName: string
  tokensToGovernThreshold: number | undefined
  maxVotingTimeInDays?: number

  nftCollectionCount?: number
  existingCommunityMintPk: PublicKey | undefined
  communityYesVotePercentage: 'disabled' | number
  transferCommunityMintAuthority: boolean

  useSupplyFactor: boolean
  communityMintSupplyFactor: number | undefined
  communityAbsoluteMaxVoteWeight: number | undefined

  createCouncil: boolean
  existingCouncilMintPk: PublicKey | undefined
  transferCouncilMintAuthority: boolean
  councilWalletPks: PublicKey[]

  communityTokenConfig?: GoverningTokenConfigAccountArgs
  skipRealmAuthority?: boolean
}
type RealmCreationV3 = {
  _programVersion: 3
  councilTokenConfig: GoverningTokenConfigAccountArgs
  councilYesVotePercentage: 'disabled' | number
} & Omit<RealmCreationV2, '_programVersion'>

export type RealmCreation = RealmCreationV2 | RealmCreationV3

export async function prepareRealmCreation({
  connection,
  wallet,
  programIdAddress,

  realmName,
  tokensToGovernThreshold,
  maxVotingTimeInDays = 3,

  nftCollectionCount = 0,
  existingCommunityMintPk,
  communityYesVotePercentage,
  transferCommunityMintAuthority,

  useSupplyFactor,
  communityMintSupplyFactor,
  communityAbsoluteMaxVoteWeight,

  createCouncil,
  existingCouncilMintPk,
  transferCouncilMintAuthority,
  councilWalletPks,

  communityTokenConfig,
  skipRealmAuthority,
  ...params
}: RealmCreation & Web3Context) {
  const realmInstructions: TransactionInstruction[] = []
  const realmSigners: Keypair[] = []

  const mintsSetupInstructions: TransactionInstruction[] = []
  const councilMembersInstructions: TransactionInstruction[] = []

  const mintsSetupSigners: Keypair[] = []
  const initialCouncilTokenAmount = 1

  const walletPk = getWalletPublicKey(wallet as any)
  const programIdPk = new PublicKey(programIdAddress)
  const programVersion = await fetchProgramVersion(connection, programIdPk)
  if (programVersion !== params._programVersion)
    throw new Error('form state and queried program version mismatch')

  console.log(
    'Prepare realm - program and version',
    programIdAddress,
    programVersion
  )

  const {
    communityVoteThreshold,
    councilVoteThreshold,
    councilVetoVoteThreshold,
    communityVetoVoteThreshold,
  } = createGovernanceThresholds(
    programVersion,
    communityYesVotePercentage,
    params._programVersion === 3 ? params.councilYesVotePercentage : 'disabled'
  )

  const existingCommunityMint = existingCommunityMintPk
    ? (await fetchMintInfoByPubkey(connection, existingCommunityMintPk)).result
    : undefined

  const existingCouncilMint = existingCouncilMintPk
    ? (await fetchMintInfoByPubkey(connection, existingCouncilMintPk)).result
    : undefined

  const communityMintDecimals = existingCommunityMint?.decimals || 6

  const communityMaxVoteWeightSource = parseMintMaxVoteWeight(
    useSupplyFactor,
    communityMintDecimals,
    communityMintSupplyFactor,
    communityAbsoluteMaxVoteWeight
  )

  console.log('Prepare realm - community mint address', existingCommunityMintPk)
  console.log('Prepare realm - community mint account', existingCommunityMint)

  const councilMintHasMintAuthority = existingCouncilMint
    ? !!existingCouncilMint.mintAuthority
    : true

  console.log('Prepare realm - council mint address', existingCouncilMintPk)
  console.log('Prepare realm - council mint account', existingCouncilMint)

  let communityMintPk = existingCommunityMintPk

  if (!communityMintPk) {
    // Create community mint
    communityMintPk = await withCreateMint(
      connection,
      mintsSetupInstructions,
      mintsSetupSigners,
      walletPk,
      null,
      communityMintDecimals,
      walletPk
    )
  }

  console.log('Prepare realm - council mint address', existingCouncilMintPk)
  // Create council mint
  let councilMintPk

  if (!existingCouncilMintPk && createCouncil) {
    councilMintPk = await withCreateMint(
      connection,
      mintsSetupInstructions,
      mintsSetupSigners,
      walletPk,
      null,
      0,
      walletPk
    )
  } else {
    councilMintPk = existingCouncilMintPk
  }

  // START check if realm is governable ----------------
  const communityEnabledInConfig = communityTokenConfig
    ? communityTokenConfig.tokenType !== GoverningTokenType.Dormant
    : false
  // community can govern if...
  const communityCanGovern =
    // its enabled
    communityEnabledInConfig &&
    // ...and has a vote threshold
    communityVoteThreshold.type !== VoteThresholdType.Disabled &&
    (communityVoteThreshold.value ?? 0 > 0) &&
    // ... and has supply
    (existingCommunityMint?.supply.gtn(0) ?? false)

  const incomingCouncilMembers = councilWalletPks.length
  const councilEnabledInConfig =
    params._programVersion !== 2
      ? params.councilTokenConfig.tokenType !== GoverningTokenType.Dormant
      : communityTokenConfig
      ? // if version 2, council just uses community config
        communityTokenConfig.tokenType !== GoverningTokenType.Dormant
      : false // just assume if no community config is supplied for some reason, we can't count on anything.
  // council can govern if...
  const councilCanGovern =
    // it has a mint...
    councilMintPk &&
    // its enabled...
    councilEnabledInConfig && // NOTE: technically it can be enabled, but undefined.
    // ...and has a vote threshold
    councilVoteThreshold.type !== VoteThresholdType.Disabled &&
    (councilVoteThreshold.value ?? 0 > 0) &&
    // and either the council mint has supply... OR
    ((existingCouncilMint?.supply.gtn(0) ?? false) ||
      // there are incoming council members
      incomingCouncilMembers > 0)

  if (
    !communityCanGovern &&
    nftCollectionCount === 0 && // note this is not the most thorough check possible for nft realms
    !councilCanGovern
  ) {
    throw new Error('no tokens exist that could govern this DAO')
  }
  // END ---------------------------------------------

  // Convert to mint natural amount
  const minCommunityTokensToCreateAsMintValue =
    typeof tokensToGovernThreshold !== 'undefined'
      ? getMintNaturalAmountFromDecimalAsBN(
          tokensToGovernThreshold,
          communityMintDecimals
        )
      : DISABLED_VOTER_WEIGHT

  const realmPk = await withCreateRealm(
    realmInstructions,
    programIdPk,
    programVersion,
    realmName,
    walletPk,
    communityMintPk,
    walletPk,
    councilMintPk,
    communityMaxVoteWeightSource,
    minCommunityTokensToCreateAsMintValue,
    communityTokenConfig,
    params._programVersion === 3 ? params.councilTokenConfig : undefined
  )

  console.log('Prepare realm - council members', councilWalletPks)
  for (const teamWalletPk of councilWalletPks) {
    // In version 3 we just deposit council tokens directly into the DAO
    if (programVersion >= 3) {
      // This is a workaround for an unnecessary signer check in DepositGoverningTokens.
      if (teamWalletPk !== walletPk) {
        await withCreateTokenOwnerRecord(
          realmInstructions,
          programIdPk,
          programVersion,
          realmPk,
          teamWalletPk,
          councilMintPk,
          walletPk
        )
      }

      await withDepositGoverningTokens(
        realmInstructions,
        programIdPk,
        programVersion,
        realmPk,
        councilMintPk,
        councilMintPk,
        teamWalletPk,
        walletPk,
        walletPk,
        new BN(initialCouncilTokenAmount)
      )
      // TODO remove workaround once unnecessary signer bug in sdk is fixed
      // this is a workaround
      const buggedIx = realmInstructions[realmInstructions.length - 1]
      // make teamWalletPk not a signer
      buggedIx.keys = buggedIx.keys.map((key) =>
        key.pubkey.equals(teamWalletPk) && !key.pubkey.equals(walletPk)
          ? { ...key, isSigner: false }
          : key
      )
    }

    // before version 3, we have to mint the tokens to wallets
    else {
      const ataPk = await withCreateAssociatedTokenAccount(
        councilMembersInstructions,
        councilMintPk,
        teamWalletPk,
        walletPk
      )

      // Mint 1 council token to each team member
      await withMintTo(
        councilMembersInstructions,
        councilMintPk,
        ataPk,
        walletPk,
        initialCouncilTokenAmount
      )

      if (teamWalletPk.equals(walletPk)) {
        await withDepositGoverningTokens(
          realmInstructions,
          programIdPk,
          programVersion,
          realmPk,
          ataPk,
          councilMintPk,
          walletPk,
          walletPk,
          walletPk,
          new BN(initialCouncilTokenAmount)
        )
      }
    }
  }

  const VOTING_COOLOFF_TIME_DEFAULT = getTimestampFromHours(12)
  // Put community and council mints under the realm governance with default config
  const config = new GovernanceConfig({
    communityVoteThreshold: communityVoteThreshold,
    minCommunityTokensToCreateProposal: minCommunityTokensToCreateAsMintValue,
    // Do not use instruction hold up time
    minInstructionHoldUpTime: 0,
    // maxVotingTime = baseVotingTime + votingCoolOffTime
    // since this is actually baseVotingTime, we have to manually subtract the cooloff time.
    baseVotingTime:
      getTimestampFromDays(maxVotingTimeInDays) - VOTING_COOLOFF_TIME_DEFAULT,
    communityVoteTipping: VoteTipping.Disabled,
    councilVoteTipping: VoteTipping.Strict,
    minCouncilTokensToCreateProposal: new BN(initialCouncilTokenAmount),
    councilVoteThreshold: councilVoteThreshold,
    councilVetoVoteThreshold: councilVetoVoteThreshold,
    communityVetoVoteThreshold: communityVetoVoteThreshold,
    votingCoolOffTime: VOTING_COOLOFF_TIME_DEFAULT,
    depositExemptProposalCount: 10,
  })

  const mainGovernancePk = await withCreateGovernance(
    realmInstructions,
    programIdPk,
    programVersion,
    realmPk,
    undefined,
    config,
    PublicKey.default,
    walletPk,
    walletPk
  )

  const nativeTreasuryAddress = await withCreateNativeTreasury(
    realmInstructions,
    programIdPk,
    programVersion,
    mainGovernancePk,
    walletPk
  )
  if (transferCommunityMintAuthority) {
    const ix = Token.createSetAuthorityInstruction(
      TOKEN_PROGRAM_ID,
      communityMintPk,
      nativeTreasuryAddress,
      'MintTokens',
      walletPk,
      []
    )
    if (existingCommunityMint?.freezeAuthority) {
      const freezeMintAuthorityPassIx = Token.createSetAuthorityInstruction(
        TOKEN_PROGRAM_ID,
        communityMintPk,
        nativeTreasuryAddress,
        'FreezeAccount',
        walletPk,
        []
      )
      realmInstructions.push(freezeMintAuthorityPassIx)
    }
    realmInstructions.push(ix)
  }

  if (
    councilMintPk &&
    councilMintHasMintAuthority &&
    transferCouncilMintAuthority
  ) {
    const ix = Token.createSetAuthorityInstruction(
      TOKEN_PROGRAM_ID,
      councilMintPk,
      nativeTreasuryAddress,
      'MintTokens',
      walletPk,
      []
    )
    if (existingCouncilMint?.freezeAuthority) {
      const freezeMintAuthorityPassIx = Token.createSetAuthorityInstruction(
        TOKEN_PROGRAM_ID,
        councilMintPk,
        nativeTreasuryAddress,
        'FreezeAccount',
        walletPk,
        []
      )
      realmInstructions.push(freezeMintAuthorityPassIx)
    }
    realmInstructions.push(ix)
  }

  // Set the community governance as the realm authority
  if (!skipRealmAuthority) {
    withSetRealmAuthority(
      realmInstructions,
      programIdPk,
      programVersion,
      realmPk,
      walletPk,
      mainGovernancePk,
      SetRealmAuthorityAction.SetChecked
    )
  }

  return {
    mainGovernancePk,
    communityMintPk,
    councilMintPk,
    realmPk,
    realmInstructions,
    realmSigners,
    mintsSetupInstructions,
    mintsSetupSigners,
    councilMembersInstructions,
    walletPk,
    programIdPk,
    programVersion,
    minCommunityTokensToCreateAsMintValue,
  }
}
