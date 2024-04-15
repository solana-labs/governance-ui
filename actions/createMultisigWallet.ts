import { sendTransactionsV3, SequenceType } from 'utils/sendTransactions'
import { chunks } from '@utils/helpers'

import {
  prepareRealmCreation,
  RealmCreation,
  Web3Context,
} from '@tools/governance/prepareRealmCreation'
import { trySentryLog } from '@utils/logs'

/// Creates multisig realm with community mint with 0 supply
/// and council mint used as multisig token
type MultisigWallet = RealmCreation & Web3Context

export default async function createMultisigWallet({
  connection,
  wallet,
  ...params
}: MultisigWallet) {
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
    ...params,
  })

  try {
    const councilMembersChunks = chunks(councilMembersInstructions, 8)

    const allSigners = [...mintsSetupSigners, ...realmSigners]

    const txes = [
      ...chunks(mintsSetupInstructions, 5),
      ...councilMembersChunks,
      ...chunks(realmInstructions, 15),
    ].map((txBatch) => {
      return {
        instructionsSet: txBatch.map((txInst) => {
          const signers = allSigners.filter((x) =>
            txInst.keys
              .filter((key) => key.isSigner)
              .find((key) => key.pubkey.equals(x.publicKey))
          )
          return {
            transactionInstruction: txInst,
            signers,
          }
        }),
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
