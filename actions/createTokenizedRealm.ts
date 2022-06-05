import { Keypair, TransactionInstruction } from '@solana/web3.js'
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
import { Connection, PublicKey } from '@solana/web3.js'

import { getTimestampFromDays } from '@tools/sdk/units'
import {
  sendTransactionsV2,
  transactionInstructionsToTypedInstructionsSets,
  SequenceType,
  WalletSigner,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'

import { prepareRealmCreation } from '@tools/governance/prepareRealmCreation'

interface TokenizedRealm {
  connection: Connection
  wallet: WalletSigner
  programIdAddress: string

  realmName: string
  tokensToGovernThreshold: number | undefined

  communityYesVotePercentage: number
  existingCommunityMintPk: PublicKey | undefined
  transferCommunityMintAuthority: boolean | undefined
  communityMintSupplyFactor: number | undefined

  createCouncil: boolean
  existingCouncilMintPk: PublicKey | undefined
  transferCouncilMintAuthority: boolean | undefined
  councilWalletPks: PublicKey[]
}

export default async function createTokenizedRealm({
  connection,
  wallet,
  programIdAddress,
  realmName,
  tokensToGovernThreshold,

  existingCommunityMintPk,
  transferCommunityMintAuthority = true,
  communityYesVotePercentage,
  communityMintSupplyFactor: rawCMSF,

  createCouncil = false,
  existingCouncilMintPk,
  transferCouncilMintAuthority = true,
  // councilYesVotePercentage,
  councilWalletPks,
}: TokenizedRealm) {
  const realmInstructions: TransactionInstruction[] = []
  const realmSigners: Keypair[] = []

  const mintsSetupInstructions: TransactionInstruction[] = []
  const councilMembersInstructions: TransactionInstruction[] = []

  const mintsSetupSigners: Keypair[] = []
  const tokenAmount = 1

  const {
    programIdPk,
    programVersion,
    walletPk,
    walletAtaPk,
    communityMintPk,
    councilMintPk,
    communityMintSupplyFactor,
    minCommunityTokensToCreateAsMintValue,
  } = await prepareRealmCreation({
    connection,
    wallet,
    programIdAddress,
    tokensToGovernThreshold,

    existingCommunityMintPk,
    communityMintSupplyFactor: rawCMSF,

    createCouncil,
    existingCouncilMintPk,

    councilWalletPks,

    mintsSetupInstructions,
    mintsSetupSigners,
    councilMembersInstructions,
  })

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
    undefined
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
      new BN(tokenAmount)
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
    maxVotingTime: getTimestampFromDays(3),
    voteTipping: VoteTipping.Strict,
    proposalCoolOffTime: 0,
    minCouncilTokensToCreateProposal: new BN(1),
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
