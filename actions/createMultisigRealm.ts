import {
  GovernanceConfig,
  MintMaxVoteWeightSource,
  VoteThresholdPercentage,
  VoteWeightSource,
} from '@models/accounts'
import { ProgramVersion } from '@models/registry/constants'
import { withCreateMintGovernance } from '@models/withCreateMintGovernance'
import { withCreateRealm } from '@models/withCreateRealm'
import { withDepositGoverningTokens } from '@models/withDepositGoverningTokens'
import { withSetRealmAuthority } from '@models/withSetRealmAuthority'
import { BN } from '@project-serum/anchor'
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'

import { withCreateAssociatedTokenAccount } from '@tools/sdk/splToken/withCreateAssociatedTokenAccount'
import { withCreateMint } from '@tools/sdk/splToken/withCreateMint'
import { withMintTo } from '@tools/sdk/splToken/withMintTo'
import {
  getMintNaturalAmountFromDecimal,
  getTimestampFromDays,
} from '@tools/sdk/units'
import {
  getWalletPublicKey,
  sendTransactions,
  SequenceType,
  WalletSigner,
} from '@utils/governance/oyster/common'
import { chunks } from '@utils/helpers'

/// Creates multisig realm with community mint with 0 supply
/// and council mint used as multisig token
export const createMultisigRealm = async (
  connection: Connection,
  programId: PublicKey,
  programVersion: ProgramVersion,

  name: string,
  yesVoteThreshold: number,
  councilWalletPks: PublicKey[],

  wallet: WalletSigner
) => {
  const walletPk = getWalletPublicKey(wallet)

  const mintsSetupInstructions: TransactionInstruction[] = []
  const councilMembersInstructions: TransactionInstruction[] = []

  const mintsSetupSigners: Keypair[] = []

  // Default to 100% supply
  const communityMintMaxVoteWeightSource =
    MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION

  // The community mint is going to have 0 supply and we arbitrarily set it to 1m
  const minCommunityTokensToCreate = 1000000

  // Community mint decimals
  const communityMintDecimals = 6

  // Create community mint
  const communityMintPk = await withCreateMint(
    connection,
    mintsSetupInstructions,
    mintsSetupSigners,
    walletPk,
    null,
    communityMintDecimals,
    walletPk
  )

  // Create council mint
  const councilMintPk = await withCreateMint(
    connection,
    mintsSetupInstructions,
    mintsSetupSigners,
    walletPk,
    null,
    0,
    walletPk
  )

  let walletAtaPk: PublicKey | undefined

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
      1
    )

    if (teamWalletPk.equals(walletPk)) {
      walletAtaPk = ataPk
    }
  }

  // Create realm
  const realmInstructions: TransactionInstruction[] = []
  const realmSigners: Keypair[] = []

  // Convert to mint natural amount
  const minCommunityTokensToCreateAsMintValue = new BN(
    getMintNaturalAmountFromDecimal(
      minCommunityTokensToCreate,
      communityMintDecimals
    )
  )

  const realmPk = await withCreateRealm(
    realmInstructions,
    programId,
    programVersion,
    name,
    walletPk,
    communityMintPk,
    walletPk,
    councilMintPk,
    communityMintMaxVoteWeightSource,
    minCommunityTokensToCreateAsMintValue,
    undefined
  )

  let tokenOwnerRecordPk: PublicKey

  // If the current wallet is in the team then deposit the council token
  if (walletAtaPk) {
    tokenOwnerRecordPk = await withDepositGoverningTokens(
      realmInstructions,
      programId,
      realmPk,
      walletAtaPk,
      councilMintPk,
      walletPk,
      walletPk,
      walletPk
    )
  } else {
    // Let's throw for now if the current wallet isn't in the team
    // TODO: To fix it we would have to make it temp. as part of the team and then remove after the realm is created
    throw new Error('Current wallet must be in the team')
  }

  // Put community and council mints under the realm governance with default config
  const config = new GovernanceConfig({
    voteThresholdPercentage: new VoteThresholdPercentage({
      value: yesVoteThreshold,
    }),
    minCommunityTokensToCreateProposal: minCommunityTokensToCreateAsMintValue,
    // Do not use instruction hold up time
    minInstructionHoldUpTime: 0,
    // max voting time 3 days
    maxVotingTime: getTimestampFromDays(3),
    voteWeightSource: VoteWeightSource.Deposit,
    proposalCoolOffTime: 0,
    minCouncilTokensToCreateProposal: new BN(1),
  })

  const {
    governanceAddress: communityMintGovPk,
  } = await withCreateMintGovernance(
    realmInstructions,
    programId,
    realmPk,
    communityMintPk,
    config,
    walletPk,
    walletPk,
    tokenOwnerRecordPk,
    walletPk
  )

  await withCreateMintGovernance(
    realmInstructions,
    programId,
    realmPk,
    councilMintPk,
    config,
    walletPk,
    walletPk,
    tokenOwnerRecordPk,
    walletPk
  )

  // Set the community governance as the realm authority
  withSetRealmAuthority(
    realmInstructions,
    programId,
    realmPk,
    walletPk,
    communityMintGovPk
  )

  try {
    const councilMembersChunks = chunks(councilMembersInstructions, 10)
    // only walletPk needs to sign the minting instructions and it's a signer by default and we don't have to include any more signers
    const councilMembersSignersChunks = Array(councilMembersChunks.length).fill(
      []
    )

    const tx = await sendTransactions(
      connection,
      wallet,
      [mintsSetupInstructions, ...councilMembersChunks, realmInstructions],
      [mintsSetupSigners, ...councilMembersSignersChunks, realmSigners],
      SequenceType.Sequential
    )

    return {
      tx,
      realmPk,
      communityMintPk,
      councilMintPk,
    }
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}
