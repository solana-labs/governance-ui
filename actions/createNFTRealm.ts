import {
  SetRealmAuthorityAction,
  SYSTEM_PROGRAM_ID,
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
  getNftMaxVoterWeightRecord,
  getNftRegistrarPDA,
} from 'NftVotePlugin/sdk/accounts'
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

    additionalRealmPlugins: [
      new PublicKey(nftPluginsPks[0]),
      new PublicKey(nftPluginsPks[0]),
    ],
  })

  console.log('NFT REALM realm public-key', realmPk.toBase58())
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
        governanceProgramId: programIdPk,
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
        governanceProgramId: programIdPk,
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

  const instructionCC = nftClient!.program.instruction.configureCollection(
    minCommunityTokensToCreateAsMintValue,
    collectionCount,
    {
      accounts: {
        registrar,
        realm: realmPk,
        // realmAuthority: communityMintGovPk,
        realmAuthority: walletPk,
        collection: new PublicKey(collectionAddress),
        maxVoterWeightRecord: maxVoterWeightRecord,
      },
    }
  )

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
