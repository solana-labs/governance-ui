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

type TokenizedRealm = Web3Context & RealmCreation

export default async function createTokenizedRealm({
  connection,
  wallet,

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

    const signers = [
      mintsSetupSigners,
      ...councilMembersSignersChunks,
      realmSigners,
    ]
    const txes = [
      mintsSetupInstructions,
      ...councilMembersChunks,
      realmInstructions,
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
