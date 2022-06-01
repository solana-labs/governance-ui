import {
  GovernanceConfig,
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
import { parseMintMaxVoteWeight } from '@tools/governance/units'
import {
  getWalletPublicKey,
  sendTransactionsV2,
  transactionInstructionsToTypedInstructionsSets,
  SequenceType,
  WalletSigner,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'
import { tryGetMint } from '@utils/tokens'
import { MAX_TOKENS_TO_DISABLE } from '@tools/constants'

/// Creates multisig realm with community mint with 0 supply
/// and council mint used as multisig token

interface MultisigRealm {
  connection: Connection
  programId: PublicKey
  programVersion: number
  realmName: string
  communityVotePercentage: number
  // councilVotePercentage: number,
  // councilVoteThreshold: number,
  existingCommunityMintPk: PublicKey | undefined
  transferCommunityMintAuthority: boolean | undefined
  existingCouncilMintPk: PublicKey | undefined
  transferCouncilMintAuthority: boolean | undefined
  tokensToGovernThreshold: number | undefined
  communityMintSupplyFactor: number | undefined
  createCouncil: boolean
  councilWalletPks: PublicKey[]
  wallet: WalletSigner
}

export const createGovTokenRealm = async ({
  connection,
  programId,
  programVersion,
  realmName,
  communityVotePercentage,
  // councilVotePercentage,
  // councilVoteThreshold,
  existingCommunityMintPk,
  transferCommunityMintAuthority = true,
  existingCouncilMintPk,
  transferCouncilMintAuthority = true,
  tokensToGovernThreshold,
  communityMintSupplyFactor: rawCMSF,
  createCouncil = false,
  councilWalletPks,
  wallet,
}: MultisigRealm) => {
  const communityMintSupplyFactor = parseMintMaxVoteWeight(rawCMSF)
  const walletPk = getWalletPublicKey(wallet)
  const communityMintAccount =
    existingCommunityMintPk &&
    (await tryGetMint(connection, existingCommunityMintPk))
  const zeroCommunityTokenSupply = existingCommunityMintPk
    ? communityMintAccount?.account.supply.isZero()
    : true

  const councilMintAccount =
    existingCouncilMintPk &&
    (await tryGetMint(connection, existingCouncilMintPk))
  const zeroCouncilTokenSupply = existingCommunityMintPk
    ? councilMintAccount?.account.supply.isZero()
    : true

  const mintsSetupInstructions: TransactionInstruction[] = []
  const councilMembersInstructions: TransactionInstruction[] = []

  const mintsSetupSigners: Keypair[] = []

  console.log(
    'CREATE GOV TOKEN REALM - community mint address',
    existingCommunityMintPk
  )
  // Community mint decimals
  const communityMintDecimals = 6
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
    'CREATE GOV TOKEN REALM - zero community token supply',
    zeroCommunityTokenSupply,
    ' | zero council token supply',
    zeroCouncilTokenSupply
  )
  console.log(
    'CREATE GOV TOKEN REALM - council mint address',
    existingCouncilMintPk
  )
  // Create council mint
  let councilMintPk
  if (
    zeroCommunityTokenSupply &&
    zeroCouncilTokenSupply &&
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

  console.log('CREATE GOV TOKEN REALM - council members', councilWalletPks)
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
  const minCommunityTokensToCreateAsMintValue =
    typeof tokensToGovernThreshold !== 'undefined'
      ? getMintNaturalAmountFromDecimalAsBN(
          tokensToGovernThreshold,
          communityMintDecimals
        )
      : MAX_TOKENS_TO_DISABLE

  const realmPk = await withCreateRealm(
    realmInstructions,
    programId,
    programVersion,
    realmName,
    walletPk,
    communityMintPk,
    walletPk,
    councilMintPk,
    communityMintSupplyFactor,
    minCommunityTokensToCreateAsMintValue,
    undefined
  )

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
  }

  // Put community and council mints under the realm governance with default config
  const config = new GovernanceConfig({
    voteThresholdPercentage: new VoteThresholdPercentage({
      value: communityVotePercentage,
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
    transferCommunityMintAuthority,
    walletPk,
    PublicKey.default,
    walletPk,
    walletPk
  )

  await withCreateNativeTreasury(
    realmInstructions,
    programId,
    communityMintGovPk,
    walletPk
  )

  if (councilMintPk) {
    await withCreateMintGovernance(
      realmInstructions,
      programId,
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
      programId,
      programVersion,
      realmPk,
      walletPk,
      communityMintGovPk,
      SetRealmAuthorityAction.SetChecked
    )
  }

  try {
    const councilMembersChunks = chunks(councilMembersInstructions, 10)
    // only walletPk needs to sign the minting instructions and it's a signer by default and we don't have to include any more signers
    const councilMembersSignersChunks = Array(councilMembersChunks.length).fill(
      []
    )
    console.log('CREATE GOV TOKEN REALM: sending transactions')
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
