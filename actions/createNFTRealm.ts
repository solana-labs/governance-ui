import {
  SetRealmAuthorityAction,
  SYSTEM_PROGRAM_ID,
  withCreateTokenOwnerRecord,
  withSetRealmAuthority,
} from '@solana/spl-governance'
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import {
  SequenceType,
  sendTransactionsV3,
  txBatchesToInstructionSetWithSigners,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'
import {
  getVoterWeightRecord,
  getMaxVoterWeightRecord,
  getRegistrarPDA,
} from '@utils/plugin/accounts'

import {
  prepareRealmCreation,
  RealmCreation,
  Web3Context,
} from '@tools/governance/prepareRealmCreation'
import { trySentryLog } from '@utils/logs'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'

export type NFTRealm = Web3Context &
  RealmCreation & {
    collectionAddress: string
    nftCollectionCount: number
  }

export default async function createNFTRealm({
  connection,
  wallet,

  collectionAddress,

  ...params
}: NFTRealm) {
  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(connection, wallet as Wallet, options)
  const nftClient = await NftVoterClient.connect(provider)
  const { nftCollectionCount } = params

  const {
    mainGovernancePk,
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
    ...params,
    connection,
    wallet,
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
      // realmAuthority: mainGovernancePk,
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
    .configureCollection(
      minCommunityTokensToCreateAsMintValue,
      nftCollectionCount
    )
    .accounts({
      registrar,
      realm: realmPk,
      // realmAuthority: mainGovernancePk,
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
    mainGovernancePk,
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
    programVersion,
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
    const signers = [
      mintsSetupSigners,
      ...councilMembersSignersChunks,
      realmSigners,
      nftSigners,
    ]
    const txes = [
      mintsSetupInstructions,
      ...councilMembersChunks,
      realmInstructions,
      nftConfigurationInstructions,
    ].map((txBatch, batchIdx) => {
      return {
        instructionsSet: txBatchesToInstructionSetWithSigners(
          txBatch,
          signers,
          batchIdx
        ),
        sequenceType: SequenceType.Sequential,
      }
    })

    const tx = await sendTransactionsV3({
      connection,
      wallet,
      transactionInstructions: txes,
    })

    const logInfo = {
      realmId: realmPk,
      realmSymbol: params.realmName,
      wallet: wallet.publicKey?.toBase58(),
      cluster: connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet',
    }
    trySentryLog({
      tag: 'realmCreated',
      objToStringify: logInfo,
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
