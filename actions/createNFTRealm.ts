import {
  GoverningTokenConfigAccountArgs,
  GoverningTokenType,
  SetRealmAuthorityAction,
  SYSTEM_PROGRAM_ID,
  withCreateTokenOwnerRecord,
  withSetRealmAuthority,
} from '@solana/spl-governance'

import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import { AnchorProvider, Wallet } from '@project-serum/anchor'

import {
  sendTransactionsV2,
  SequenceType,
  WalletSigner,
  transactionInstructionsToTypedInstructionsSets,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'
import { nftPluginsPks } from '@hooks/useVotingPlugins'

import {
  getVoterWeightRecord,
  getMaxVoterWeightRecord,
  getRegistrarPDA,
} from '@utils/plugin/accounts'
import { NftVoterClient } from '@solana/governance-program-library'

import { prepareRealmCreation } from '@tools/governance/prepareRealmCreation'
interface NFTRealm {
  connection: Connection
  wallet: WalletSigner
  programIdAddress: string

  realmName: string
  collectionAddress: string
  collectionCount: number
  tokensToGovernThreshold: number | undefined

  communityYesVotePercentage: number
  existingCommunityMintPk: PublicKey | undefined
  // communityMintSupplyFactor: number | undefined

  createCouncil: boolean
  existingCouncilMintPk: PublicKey | undefined
  transferCouncilMintAuthority: boolean | undefined
  councilWalletPks: PublicKey[]
}

export default async function createNFTRealm({
  connection,
  wallet,
  programIdAddress,
  realmName,
  tokensToGovernThreshold = 1,

  collectionAddress,
  collectionCount,

  existingCommunityMintPk,
  communityYesVotePercentage,
  // communityMintSupplyFactor: rawCMSF,

  createCouncil = false,
  existingCouncilMintPk,
  transferCouncilMintAuthority = true,
  // councilYesVotePercentage,
  councilWalletPks,
}: NFTRealm) {
  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(connection, wallet as Wallet, options)
  const nftClient = await NftVoterClient.connect(provider)

  const {
    communityMintGovPk,
    communityMintPk,
    councilMintPk,
    realmPk,
    walletPk,
    programIdPk,
    programVersion,
    minCommunityTokensToCreateAsMintValue,
    realmInstructions,
    realmSigners,
    mintsSetupInstructions,
    mintsSetupSigners,
    councilMembersInstructions,
  } = await prepareRealmCreation({
    connection,
    wallet,
    programIdAddress,

    realmName,
    tokensToGovernThreshold,

    existingCommunityMintPk,
    nftCollectionCount: collectionCount,
    communityMintSupplyFactor: undefined,
    transferCommunityMintAuthority: false, // delay this until we have created NFT instructions
    communityYesVotePercentage,

    createCouncil,
    existingCouncilMintPk,
    transferCouncilMintAuthority,
    councilWalletPks,

    communityTokenConfig: new GoverningTokenConfigAccountArgs({
      voterWeightAddin: new PublicKey(nftPluginsPks[0]),
      maxVoterWeightAddin: new PublicKey(nftPluginsPks[0]),
      tokenType: GoverningTokenType.Liquid,
    }),
  })

  console.log('NFT REALM realm public-key', realmPk.toBase58())
  const { registrar } = await getRegistrarPDA(
    realmPk,
    communityMintPk,
    nftClient!.program.programId
  )
  const instructionCR = await nftClient!.program.methods
    .createRegistrar(10) // Max collections
    .accounts({
      registrar,
      realm: realmPk,
      governanceProgramId: programIdPk,
      // realmAuthority: communityMintGovPk,
      realmAuthority: walletPk,
      governingTokenMint: communityMintPk,
      payer: walletPk,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .instruction()

  console.log(
    'CREATE NFT REALM registrar PDA',
    registrar.toBase58(),
    instructionCR
  )

  const { maxVoterWeightRecord } = await getMaxVoterWeightRecord(
    realmPk,
    communityMintPk,
    nftClient!.program.programId
  )
  const instructionMVWR = await nftClient!.program.methods
    .createMaxVoterWeightRecord()
    .accounts({
      maxVoterWeightRecord,
      governanceProgramId: programIdPk,
      realm: realmPk,
      realmGoverningTokenMint: communityMintPk,
      payer: walletPk,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .instruction()
  console.log(
    'CREATE NFT REALM max voter weight record',
    maxVoterWeightRecord.toBase58(),
    instructionMVWR
  )

  const instructionCC = await nftClient!.program.methods
    .configureCollection(minCommunityTokensToCreateAsMintValue, collectionCount)
    .accounts({
      registrar,
      realm: realmPk,
      // realmAuthority: communityMintGovPk,
      realmAuthority: walletPk,
      collection: new PublicKey(collectionAddress),
      maxVoterWeightRecord: maxVoterWeightRecord,
    })
    .instruction()

  console.log(
    'CREATE NFT REALM configure collection',
    minCommunityTokensToCreateAsMintValue,
    instructionCC
  )

  const nftConfigurationInstructions: TransactionInstruction[] = [
    instructionCR,
    instructionMVWR,
    instructionCC,
  ]

  // Set the community governance as the realm authority
  withSetRealmAuthority(
    nftConfigurationInstructions,
    programIdPk,
    programVersion,
    realmPk,
    walletPk,
    communityMintGovPk,
    SetRealmAuthorityAction.SetChecked
  )

  const { voterWeightPk } = await getVoterWeightRecord(
    realmPk,
    communityMintPk,
    walletPk,
    nftClient.program.programId
  )
  console.log('NFT realm voter weight', voterWeightPk.toBase58())
  const createVoterWeightRecord = await nftClient.program.methods
    .createVoterWeightRecord(walletPk)
    .accounts({
      voterWeightRecord: voterWeightPk,
      governanceProgramId: programIdPk,
      realm: realmPk,
      realmGoverningTokenMint: communityMintPk,
      payer: walletPk,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .instruction()
  console.log(
    'NFT realm voter weight record instruction',
    createVoterWeightRecord
  )
  nftConfigurationInstructions.push(createVoterWeightRecord)
  await withCreateTokenOwnerRecord(
    nftConfigurationInstructions,
    programIdPk,
    realmPk,
    walletPk,
    communityMintPk,
    walletPk
  )

  try {
    const councilMembersChunks = chunks(councilMembersInstructions, 10)
    // only walletPk needs to sign the minting instructions and it's a signer by default and we don't have to include any more signers
    const councilMembersSignersChunks = Array(councilMembersChunks.length).fill(
      []
    )
    const nftSigners: Keypair[] = []
    console.log('CREATE NFT REALM: sending transactions')
    const tx = await sendTransactionsV2({
      connection,
      showUiComponent: true,
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
        nftConfigurationInstructions,
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
