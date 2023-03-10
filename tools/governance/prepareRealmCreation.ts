import {
  PublicKey,
  Keypair,
  TransactionInstruction,
  Connection,
} from '@solana/web3.js'

import {
  getGovernanceProgramVersion,
  GovernanceConfig,
  GoverningTokenConfigAccountArgs,
  SetRealmAuthorityAction,
  TOKEN_PROGRAM_ID,
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
import { tryGetMint } from '@utils/tokens'

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

export interface Web3Context {
  connection: Connection
  wallet: WalletSigner
}
export interface RealmCreationV2 {
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
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programIdPk
  )

  console.log(
    'Prepare realm - program and version',
    programIdAddress,
    programVersion
  )
  const communityMintAccount =
    existingCommunityMintPk &&
    (await tryGetMint(connection, existingCommunityMintPk))
  const zeroCommunityTokenSupply = existingCommunityMintPk
    ? communityMintAccount?.account.supply.isZero()
    : true
  const communityMintDecimals = communityMintAccount?.account?.decimals || 6

  const communityMaxVoteWeightSource = parseMintMaxVoteWeight(
    useSupplyFactor,
    communityMintDecimals,
    communityMintSupplyFactor,
    communityAbsoluteMaxVoteWeight
  )

  console.log('Prepare realm - community mint address', existingCommunityMintPk)
  console.log('Prepare realm - community mint account', communityMintAccount)

  const councilMintAccount =
    existingCouncilMintPk &&
    (await tryGetMint(connection, existingCouncilMintPk))
  const zeroCouncilTokenSupply = existingCommunityMintPk
    ? councilMintAccount?.account.supply.isZero()
    : true
  const councilMintHasMintAuthority = councilMintAccount
    ? !!councilMintAccount.account.mintAuthority
    : true

  console.log('Prepare realm - council mint address', existingCouncilMintPk)
  console.log('Prepare realm - council mint account', councilMintAccount)

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

  console.log(
    'Prepare realm - zero community token supply',
    zeroCommunityTokenSupply,
    ' | zero council token supply',
    zeroCouncilTokenSupply
  )
  console.log('Prepare realm - council mint address', existingCouncilMintPk)
  // Create council mint
  let councilMintPk

  if (
    zeroCommunityTokenSupply &&
    zeroCouncilTokenSupply &&
    nftCollectionCount === 0 &&
    councilWalletPks.length === 0
  ) {
    throw new Error('no tokens exist that could govern this DAO')
  }

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

  // Put community and council mints under the realm governance with default config
  const config = new GovernanceConfig({
    communityVoteThreshold: communityVoteThreshold,
    minCommunityTokensToCreateProposal: minCommunityTokensToCreateAsMintValue,
    // Do not use instruction hold up time
    minInstructionHoldUpTime: 0,
    // max voting time 3 days
    maxVotingTime: getTimestampFromDays(maxVotingTimeInDays),
    communityVoteTipping: VoteTipping.Disabled,
    councilVoteTipping: VoteTipping.Strict,
    minCouncilTokensToCreateProposal: new BN(initialCouncilTokenAmount),
    councilVoteThreshold: councilVoteThreshold,
    councilVetoVoteThreshold: councilVetoVoteThreshold,
    communityVetoVoteThreshold: communityVetoVoteThreshold,
    votingCoolOffTime: getTimestampFromHours(12),
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
