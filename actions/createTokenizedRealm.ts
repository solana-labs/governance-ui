import {
  SequenceType,
  txBatchesToInstructionSetWithSigners,
  sendTransactionsV3,
} from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'

import {
  prepareRealmCreation,
  RealmCreation,
  Web3Context,
} from '@tools/governance/prepareRealmCreation'
import { trySentryLog } from '@utils/logs'
import {
  DEFAULT_COEFFICIENTS,
  QuadraticClient,
} from '@solana/governance-program-library'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import { toAnchorType } from 'QuadraticPlugin/sdk/api'
import { SYSTEM_PROGRAM_ID } from '@solana/spl-governance'
import { PluginName } from '@constants/plugins'
import { getRegistrarPDA } from '@utils/plugin/accounts'

type CreateWithPlugin = { pluginList: PluginName[] }
type TokenizedRealm = Web3Context & RealmCreation & CreateWithPlugin

export default async function createTokenizedRealm({
  connection,
  wallet,
  pluginList,

  ...params
}: TokenizedRealm) {
  const {
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
    mainGovernancePk,
  } = await prepareRealmCreation({
    connection,
    wallet,
    // TODO does there need to be community token config
    ...params,
  })

  try {
    const councilMembersChunks = chunks(councilMembersInstructions, 10)
    // only walletPk needs to sign the minting instructions and it's a signer by default and we don't have to include any more signers
    const councilMembersSignersChunks = Array(councilMembersChunks.length).fill(
      []
    )
    console.log('CREATE GOV TOKEN REALM: sending transactions')

    let pluginSigners
    let pluginTxes
    if (pluginList.includes('QV')) {
      const options = AnchorProvider.defaultOptions()
      const provider = new AnchorProvider(connection, wallet as Wallet, options)
      const isDevnet = connection.rpcEndpoint.includes('devnet')
      const quadraticClient = await QuadraticClient.connect(provider, isDevnet)

      const { registrar } = await getRegistrarPDA(
        realmPk,
        communityMintPk,
        quadraticClient!.program.programId
      )

      const qvInstruction = await quadraticClient!.program.methods
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

      pluginSigners = []
      pluginTxes = [qvInstruction]
    }

    const signers = [
      mintsSetupSigners,
      ...councilMembersSignersChunks,
      realmSigners,
      ...(pluginSigners ? [pluginSigners] : []),
    ]

    const txes = [
      mintsSetupInstructions,
      ...councilMembersChunks,
      realmInstructions,
      ...(pluginTxes ? [pluginTxes] : []),
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

    // if (pluginList.includes('QV')) {
    //   const realm = await getRealm(connection, realmPk)

    //   const options = AnchorProvider.defaultOptions()
    //   const provider = new AnchorProvider(connection, wallet as Wallet, options)
    //   const isDevnet = connection.rpcEndpoint.includes('devnet')
    //   const quadraticClient = await QuadraticClient.connect(provider, isDevnet)

    //   const quadraticRegistrar = await createQuadraticRegistrarIx(
    //     realm,
    //     walletPk,
    //     quadraticClient
    //   )

    //   const qvTxes = [
    //     {
    //       instructionsSet: txBatchesToInstructionSetWithSigners(
    //         [quadraticRegistrar],
    //         [],
    //         0
    //       ),
    //       sequenceType: SequenceType.Sequential,
    //     },
    //   ]

    //   const qvTx = await sendTransactionsV3({
    //     connection,
    //     wallet,
    //     transactionInstructions: qvTxes,
    //   })
    // }

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
