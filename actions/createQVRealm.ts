import {
  SequenceType,
  txBatchesToInstructionSetWithSigners,
  sendTransactionsV3,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'
import {
  SetRealmAuthorityAction,
  SYSTEM_PROGRAM_ID,
  withCreateTokenOwnerRecord,
  withSetRealmAuthority,
} from '@solana/spl-governance'
import {
  prepareRealmCreation,
  RealmCreation,
  Web3Context,
} from '@tools/governance/prepareRealmCreation'
import { trySentryLog } from '@utils/logs'
import { QuadraticClient } from '@solana/governance-program-library'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { TransactionInstruction } from '@solana/web3.js'
import { getVoterWeightRecord, getRegistrarPDA } from '@utils/plugin/accounts'
import { toAnchorType, DEFAULT_COEFFICIENTS } from '../QuadraticPlugin/sdk/api'

type TokenizedRealm = Web3Context & RealmCreation

export default async function createQVRealm({
  connection,
  wallet,

  ...params
}: TokenizedRealm) {
  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(connection, wallet as Wallet, options)
  const isDevnet = connection.rpcEndpoint.includes('devnet')
  const quadraticClient = await QuadraticClient.connect(provider, isDevnet)

  const {
    mainGovernancePk,
    communityMintPk,
    councilMintPk,
    realmPk,
    walletPk,
    programIdPk,
    programVersion,
    realmInstructions,
    realmSigners,
    mintsSetupInstructions,
    mintsSetupSigners,
    councilMembersInstructions,
  } = await prepareRealmCreation({
    connection,
    wallet,
    ...params,
  })

  const { registrar } = await getRegistrarPDA(
    realmPk,
    communityMintPk,
    quadraticClient!.program.programId
  )

  const instructionCR = await quadraticClient!.program.methods
    .createRegistrar(toAnchorType(DEFAULT_COEFFICIENTS), false)
    .accounts({
      registrar,
      realm: realmPk,
      governanceProgramId: programIdPk,
      realmAuthority: mainGovernancePk,
      governingTokenMint: communityMintPk,
      payer: walletPk,
      systemProgram: SYSTEM_PROGRAM_ID,
    })
    .instruction()

  const qvConfigurationInstructions: TransactionInstruction[] = [instructionCR]

  // Set the community governance as the realm authority
  withSetRealmAuthority(
    qvConfigurationInstructions,
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
    quadraticClient.program.programId
  )
  console.log('NFT realm voter weight', voterWeightPk.toBase58())

  const createVoterWeightRecord = await quadraticClient.createVoterWeightRecord(
    walletPk,
    realmPk,
    communityMintPk
  )
  console.log(
    'QV Realm voter weight record instruction',
    createVoterWeightRecord
  )
  qvConfigurationInstructions.push(createVoterWeightRecord)
  await withCreateTokenOwnerRecord(
    qvConfigurationInstructions,
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
    console.log('CREATE GOV TOKEN REALM: sending transactions')

    const signers = [
      mintsSetupSigners,
      ...councilMembersSignersChunks,
      realmSigners,
    ]
    const txes = [
      mintsSetupInstructions,
      ...councilMembersChunks,
      realmInstructions,
      qvConfigurationInstructions,
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
