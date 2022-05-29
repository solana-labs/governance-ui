import {
  getTokenOwnerRecordAddress,
  GovernanceConfig,
  MintMaxVoteWeightSource,
  SetRealmAuthorityAction,
  SYSTEM_PROGRAM_ID,
  VoteThresholdPercentage,
  VoteTipping,
  withCreateMintGovernance,
  withCreateRealm,
  withDepositGoverningTokens,
  withSetRealmAuthority,
} from '@solana/spl-governance'

import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import { BN, Provider, Wallet } from '@project-serum/anchor'

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
  WalletSigner,
  transactionInstructionsToTypedInstructionsSets,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'
import { MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY } from '@tools/constants'
import { nftPluginsPks } from '@hooks/useVotingPlugins'

import {
  getNftMaxVoterWeightRecord,
  getNftRegistrarPDA,
} from 'NftVotePlugin/sdk/accounts'
import { NftVoterClient } from '@solana/governance-program-library'

export const createNFTRealm = async (
  connection: Connection,
  programId: PublicKey,
  programVersion: number,

  name: string,
  collectionKey: string,
  collectionCount: number,
  collectionWeight: number,

  yesVoteThreshold: number,
  councilWalletPks: PublicKey[],

  wallet: WalletSigner
) => {
  const options = Provider.defaultOptions()
  const provider = new Provider(connection, wallet as Wallet, options)
  const nftClient = await NftVoterClient.connect(provider)

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
  console.log('CREATE NFT REALM community mint', communityMintPk.toBase58())
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
  console.log('CREATE NFT REALM council mint', councilMintPk.toBase58())
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
  const nftSigners: Keypair[] = [] // currently empty because reasons
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
    new PublicKey(nftPluginsPks[0]),
    new PublicKey(nftPluginsPks[0])
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
    console.log('CREATE NFT REALM council token deposited')

    // TODO: return from withDepositGoverningTokens in the SDK
    tokenOwnerRecordPk = await getTokenOwnerRecordAddress(
      programId,
      realmPk,
      councilMintPk,
      walletPk
    )
    console.log(
      'CREATE NFT REALM token owner record',
      tokenOwnerRecordPk.toBase58()
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
  console.log('CREATE NFT REALM governance config created', config)
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
  console.log(
    'CREATE NFT REALM community mint governance pk',
    communityMintGovPk.toBase58()
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

  // // Set the community governance as the realm authority
  // withSetRealmAuthority(
  //   realmInstructions,
  //   programId,
  //   programVersion,
  //   realmPk,
  //   walletPk,
  //   communityMintGovPk,
  //   SetRealmAuthorityAction.SetChecked
  // )

  console.log('CREATE NFT REALM realm public-key', realmPk.toBase58())
  const { registrar } = await getNftRegistrarPDA(
    realmPk,
    communityMintPk,
    nftClient!.program.programId
  )
  const instructionCR = nftClient!.program.instruction.createRegistrar(
    10, // TODO: trust
    {
      accounts: {
        registrar,
        realm: realmPk,
        governanceProgramId: programId,
        // realmAuthority: communityMintGovPk,
        realmAuthority: walletPk,
        governingTokenMint: communityMintPk,
        payer: walletPk,
        systemProgram: SYSTEM_PROGRAM_ID,
      },
    }
  )
  console.log(
    'CREATE NFT REALM registrar PDA',
    registrar.toBase58(),
    instructionCR
  )

  const { maxVoterWeightRecord } = await getNftMaxVoterWeightRecord(
    realmPk,
    communityMintPk,
    nftClient!.program.programId
  )
  const instructionMVWR = nftClient!.program.instruction.createMaxVoterWeightRecord(
    {
      accounts: {
        maxVoterWeightRecord,
        governanceProgramId: programId,
        realm: realmPk,
        realmGoverningTokenMint: communityMintPk,
        payer: walletPk,
        systemProgram: SYSTEM_PROGRAM_ID,
      },
    }
  )
  console.log(
    'CREATE NFT REALM max voter weight record',
    maxVoterWeightRecord.toBase58(),
    instructionMVWR
  )

  // const communityMintInfo = await tryGetMint(connection, communityMintPk)

  const weight = getMintNaturalAmountFromDecimalAsBN(
    collectionWeight, // TODO: come back to this
    communityMintDecimals
  )
  const instructionCC = nftClient!.program.instruction.configureCollection(
    weight,
    collectionCount,
    {
      accounts: {
        registrar,
        realm: realmPk,
        // realmAuthority: communityMintGovPk,
        realmAuthority: walletPk,
        collection: new PublicKey(collectionKey),
        maxVoterWeightRecord: maxVoterWeightRecord,
      },
    }
  )

  console.log('CREATE NFT REALM configure collection', weight, instructionCC)

  const nftConfigurationTransations = [
    instructionCR,
    instructionMVWR,
    instructionCC,
  ]

  // Set the community governance as the realm authority
  withSetRealmAuthority(
    nftConfigurationTransations,
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
    console.log('CREATE NFT REALM sending transactions')
    const tx = await sendTransactionsV2({
      connection,
      wallet,
      signersSet: [
        mintsSetupSigners,
        ...councilMembersSignersChunks,
        realmSigners,
        nftSigners,
      ],
      TransactionInstructions: [
        mintsSetupInstructions,
        ...councilMembersChunks,
        realmInstructions,
        nftConfigurationTransations,
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
