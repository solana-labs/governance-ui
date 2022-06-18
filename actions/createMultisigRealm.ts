import {
  getTokenOwnerRecordAddress,
  GovernanceConfig,
  MintMaxVoteWeightSource,
  SetRealmAuthorityAction,
  VoteThresholdPercentage,
  VoteTipping,
  withCreateNativeTreasury,
} from '@solana/spl-governance'

import { withCreateMintGovernance } from '@solana/spl-governance'
import { withCreateRealm } from '@solana/spl-governance'
import { withDepositGoverningTokens } from '@solana/spl-governance'
import { withSetRealmAuthority } from '@solana/spl-governance'
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
  getMintNaturalAmountFromDecimalAsBN,
  getTimestampFromDays,
} from '@tools/sdk/units'
import {
  getWalletPublicKey,
  sendTransactionsV2,
  SequenceType,
  transactionInstructionsToTypedInstructionsSets,
  WalletSigner,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'
import { MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY } from '@tools/constants'

/// Creates multisig realm with community mint with 0 supply
/// and council mint used as multisig token
export const createMultisigRealm = async (
  connection: Connection,
  programId: PublicKey,
  programVersion: number,

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
  const minCommunityTokensToCreate = MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY

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
  const tokenAmount = 1

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

  // Create realm
  const realmInstructions: TransactionInstruction[] = []
  const realmSigners: Keypair[] = []

  // Convert to mint natural amount
  const minCommunityTokensToCreateAsMintValue = getMintNaturalAmountFromDecimalAsBN(
    minCommunityTokensToCreate,
    communityMintDecimals
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
    await withDepositGoverningTokens(
      realmInstructions,
      programId,
      programVersion,
      realmPk,
      walletAtaPk,
      councilMintPk,
      walletPk,
      walletPk,
      walletPk,
      new BN(tokenAmount)
    )

    // TODO: return from withDepositGoverningTokens in the SDK
    tokenOwnerRecordPk = await getTokenOwnerRecordAddress(
      programId,
      realmPk,
      councilMintPk,
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
    voteTipping: VoteTipping.Strict,
    proposalCoolOffTime: 0,
    minCouncilTokensToCreateProposal: new BN(1),
  })

  const communityMintGovPk = await withCreateMintGovernance(
    realmInstructions,
    programId,
    programVersion,
    realmPk,
    communityMintPk,
    config,
    !!walletPk,
    walletPk,
    tokenOwnerRecordPk,
    walletPk,
    walletPk
  )

  await withCreateMintGovernance(
    realmInstructions,
    programId,
    programVersion,
    realmPk,
    councilMintPk,
    config,
    !!walletPk,
    walletPk,
    tokenOwnerRecordPk,
    walletPk,
    walletPk
  )

  await withCreateNativeTreasury(
    realmInstructions,
    programId,
    communityMintGovPk,
    walletPk
  )

  console.log('CREATE NFT REALM governance config created', config)

  // Set the community governance as the realm authority
  withSetRealmAuthority(
    realmInstructions,
    programId,
    programVersion,
    realmPk,
    walletPk,
    communityMintGovPk,
    SetRealmAuthorityAction.SetChecked
  )

  try {
    const councilMembersChunks = chunks(councilMembersInstructions, 10)
    // only walletPk needs to sign the minting instructions and it's a signer by default and we don't have to include any more signers
    const councilMembersSignersChunks = Array(councilMembersChunks.length).fill(
      []
    )

    const tx = await sendTransactionsV2({
      connection,
      showUiComponent: true,
      wallet,
      signersSet: [
        mintsSetupSigners,
        ...councilMembersSignersChunks,
        realmSigners,
      ],
      TransactionInstructions: [
        mintsSetupInstructions,
        ...councilMembersChunks,
        realmInstructions,
      ].map((x) =>
        transactionInstructionsToTypedInstructionsSets(
          x,
          SequenceType.Sequential
        )
      ),
    })

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
