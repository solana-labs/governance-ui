import {
  PublicKey,
  Keypair,
  TransactionInstruction,
  Connection,
} from '@solana/web3.js'
import {
  getGovernanceProgramVersion,
  WalletSigner,
} from '@solana/spl-governance'

import {
  GovernanceConfig,
  SetRealmAuthorityAction,
  VoteThresholdPercentage,
  VoteTipping,
  withCreateNativeTreasury,
  withCreateMintGovernance,
  withCreateRealm,
  withDepositGoverningTokens,
  withSetRealmAuthority,
} from '@solana/spl-governance'

import { getWalletPublicKey } from '@utils/sendTransactions'
import { tryGetMint } from '@utils/tokens'

import { parseMintMaxVoteWeight } from '@tools/governance/units'
import {
  getTimestampFromDays,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { withCreateMint } from '@tools/sdk/splToken/withCreateMint'
import { withCreateAssociatedTokenAccount } from '@tools/sdk/splToken/withCreateAssociatedTokenAccount'
import { withMintTo } from '@tools/sdk/splToken/withMintTo'
import { MAX_TOKENS_TO_DISABLE } from '@tools/constants'

import BN from 'bn.js'

interface RealmCreation {
  connection: Connection
  wallet: WalletSigner
  programIdAddress: string

  realmName: string
  tokensToGovernThreshold: number | undefined
  maxVotingTimeInDays?: number

  nftCollectionCount?: number
  existingCommunityMintPk: PublicKey | undefined
  communityMintSupplyFactor: number | undefined
  communityYesVotePercentage: number
  transferCommunityMintAuthority: boolean

  createCouncil: boolean
  existingCouncilMintPk: PublicKey | undefined
  transferCouncilMintAuthority: boolean
  councilWalletPks: PublicKey[]

  additionalRealmPlugins?: PublicKey[]
}

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
  communityMintSupplyFactor: rawCMSF,
  transferCommunityMintAuthority,

  createCouncil,
  existingCouncilMintPk,
  transferCouncilMintAuthority,
  councilWalletPks,

  additionalRealmPlugins = [],
}: RealmCreation) {
  const realmInstructions: TransactionInstruction[] = []
  const realmSigners: Keypair[] = []

  const mintsSetupInstructions: TransactionInstruction[] = []
  const councilMembersInstructions: TransactionInstruction[] = []

  const mintsSetupSigners: Keypair[] = []
  const initialCouncilTokenAmount = 1

  const communityMintSupplyFactor = parseMintMaxVoteWeight(rawCMSF)
  const walletPk = getWalletPublicKey(wallet)
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

  console.log('Prepare realm - community mint address', existingCommunityMintPk)
  console.log('Prepare realm - community mint account', communityMintAccount)

  const councilMintAccount =
    existingCouncilMintPk &&
    (await tryGetMint(connection, existingCouncilMintPk))
  const zeroCouncilTokenSupply = existingCommunityMintPk
    ? councilMintAccount?.account.supply.isZero()
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
    councilWalletPks.push(wallet.publicKey as PublicKey)
    councilMintPk = await withCreateMint(
      connection,
      mintsSetupInstructions,
      mintsSetupSigners,
      walletPk,
      null,
      0,
      walletPk
    )
  } else if (!existingCouncilMintPk && createCouncil) {
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

  let walletAtaPk: PublicKey | undefined
  const tokenAmount = 1

  console.log('Prepare realm - council members', councilWalletPks)
  for (const teamWalletPk of councilWalletPks) {
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
      tokenAmount
    )

    if (teamWalletPk.equals(walletPk)) {
      walletAtaPk = ataPk
    }
  }

  // Convert to mint natural amount
  const minCommunityTokensToCreateAsMintValue =
    typeof tokensToGovernThreshold !== 'undefined'
      ? getMintNaturalAmountFromDecimalAsBN(
          tokensToGovernThreshold,
          communityMintDecimals
        )
      : MAX_TOKENS_TO_DISABLE

  const realmPk = await withCreateRealm(
    realmInstructions,
    programIdPk,
    programVersion,
    realmName,
    walletPk,
    communityMintPk,
    walletPk,
    councilMintPk,
    communityMintSupplyFactor,
    minCommunityTokensToCreateAsMintValue,
    ...additionalRealmPlugins
  )

  // If the current wallet is in the team then deposit the council token
  if (walletAtaPk) {
    await withDepositGoverningTokens(
      realmInstructions,
      programIdPk,
      programVersion,
      realmPk,
      walletAtaPk,
      councilMintPk,
      walletPk,
      walletPk,
      walletPk,
      new BN(initialCouncilTokenAmount)
    )
  }

  // Put community and council mints under the realm governance with default config
  const config = new GovernanceConfig({
    voteThresholdPercentage: new VoteThresholdPercentage({
      value: communityYesVotePercentage,
    }),
    minCommunityTokensToCreateProposal: minCommunityTokensToCreateAsMintValue,
    // Do not use instruction hold up time
    minInstructionHoldUpTime: 0,
    // max voting time 3 days
    maxVotingTime: getTimestampFromDays(maxVotingTimeInDays),
    voteTipping: VoteTipping.Strict,
    proposalCoolOffTime: 0,
    minCouncilTokensToCreateProposal: new BN(initialCouncilTokenAmount),
  })

  const communityMintGovPk = await withCreateMintGovernance(
    realmInstructions,
    programIdPk,
    programVersion,
    realmPk,
    communityMintPk,
    config,
    transferCommunityMintAuthority,
    walletPk,
    PublicKey.default,
    walletPk,
    walletPk
  )

  await withCreateNativeTreasury(
    realmInstructions,
    programIdPk,
    communityMintGovPk,
    walletPk
  )

  if (councilMintPk) {
    await withCreateMintGovernance(
      realmInstructions,
      programIdPk,
      programVersion,
      realmPk,
      councilMintPk,
      config,
      transferCouncilMintAuthority,
      walletPk,
      PublicKey.default,
      walletPk,
      walletPk
    )
  }

  // Set the community governance as the realm authority
  if (transferCommunityMintAuthority) {
    withSetRealmAuthority(
      realmInstructions,
      programIdPk,
      programVersion,
      realmPk,
      walletPk,
      communityMintGovPk,
      SetRealmAuthorityAction.SetChecked
    )
  }

  return {
    communityMintGovPk,
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
