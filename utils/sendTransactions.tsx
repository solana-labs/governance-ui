import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { TransactionInstruction, Keypair } from '@solana/web3.js'
import {
  closeTransactionProcessUi,
  incrementProcessedTransactions,
  showTransactionError,
  showTransactionsProcessUi,
} from './transactionsLoader'

import { invalidateInstructionAccounts } from '@hooks/queries/queryClient'
import {
  sendSignAndConfirmTransactionsProps,
  sendSignAndConfirmTransactions,
  TransactionInstructionWithType,
} from '@blockworks-foundation/mangolana/lib/transactions'
import { getFeeEstimate } from '@tools/feeEstimate'
import { TransactionInstructionWithSigners } from '@blockworks-foundation/mangolana/lib/globalTypes'
import { createComputeBudgetIx } from '@blockworks-foundation/mango-v4'
import { BACKUP_CONNECTIONS } from './connection'

export type WalletSigner = Pick<
  SignerWalletAdapter,
  'publicKey' | 'signTransaction' | 'signAllTransactions'
>

export function getWalletPublicKey(wallet: WalletSigner) {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected!')
  }

  return wallet.publicKey
}

export enum SequenceType {
  Sequential,
  Parallel,
  StopOnFailure,
}

export const sendTransactionsV3 = async ({
  connection,
  wallet,
  transactionInstructions,
  timeoutStrategy,
  callbacks,
  config,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lookupTableAccounts,
  autoFee = true,
}: sendSignAndConfirmTransactionsProps & {
  lookupTableAccounts?: any
  autoFee?: boolean
}) => {
  const transactionInstructionsWithFee: TransactionInstructionWithType[] = []
  const fee = await getFeeEstimate(connection)
  for (const tx of transactionInstructions) {
    if (tx.instructionsSet.length) {
      const txObjWithFee = {
        ...tx,
        instructionsSet: autoFee
          ? [
              new TransactionInstructionWithSigners(createComputeBudgetIx(fee)),
              ...tx.instructionsSet,
            ]
          : [...tx.instructionsSet],
      }
      transactionInstructionsWithFee.push(txObjWithFee)
    }
  }

  const callbacksWithUiComponent = {
    afterBatchSign: (signedTxnsCount) => {
      if (callbacks?.afterBatchSign) {
        callbacks?.afterBatchSign(signedTxnsCount)
      }
      showTransactionsProcessUi(signedTxnsCount)
    },
    afterAllTxConfirmed: () => {
      if (callbacks?.afterAllTxConfirmed) {
        callbacks?.afterAllTxConfirmed()
      }
      closeTransactionProcessUi()
      transactionInstructionsWithFee.forEach((x) =>
        x.instructionsSet.forEach((x) =>
          invalidateInstructionAccounts(x.transactionInstruction)
        )
      )
    },
    afterEveryTxConfirmation: () => {
      if (callbacks?.afterEveryTxConfirmation) {
        callbacks?.afterEveryTxConfirmation()
      }
      incrementProcessedTransactions()
    },
    onError: (e, notProcessedTransactions, originalProps) => {
      if (callbacks?.onError) {
        callbacks?.onError(e, notProcessedTransactions, originalProps)
      }
      showTransactionError(
        () =>
          sendTransactionsV3({
            ...originalProps,
            transactionInstructions: notProcessedTransactions,
            autoFee: false,
          }),
        getErrorMsg(e),
        e.txid
      )
      transactionInstructionsWithFee.forEach((x) =>
        x.instructionsSet.forEach((x) =>
          invalidateInstructionAccounts(x.transactionInstruction)
        )
      )
    },
  }

  const cfg = {
    maxTxesInBatch:
      transactionInstructionsWithFee.filter(
        (x) => x.sequenceType === SequenceType.Sequential
      ).length > 0
        ? 20
        : 30,
    autoRetry: false,
    maxRetries: 5,
    retried: 0,
    logFlowInfo: true,
    ...config,
  }
  return sendSignAndConfirmTransactions({
    connection,
    wallet,
    transactionInstructions: transactionInstructionsWithFee,
    timeoutStrategy,
    callbacks: callbacksWithUiComponent,
    config: cfg,
    confirmLevel: 'confirmed',
    backupConnections: BACKUP_CONNECTIONS, //TODO base this on connection confirmation level
    //lookupTableAccounts,
  })
}

const getErrorMsg = (e) => {
  if (e.error) {
    return e.error
  }
  if (e.message) {
    return e.message
  }
  if (typeof e === 'object') {
    return tryStringify(e)
  }
  return `${e}`
}

const tryStringify = (obj) => {
  try {
    return JSON.stringify(obj)
  } catch {
    return null
  }
}

export const txBatchesToInstructionSetWithSigners = (
  txBatch: TransactionInstruction[],
  signerBatches: Keypair[][],
  batchIdx?: number
): { transactionInstruction: TransactionInstruction; signers: Keypair[] }[] => {
  return txBatch.map((tx, txIdx) => {
    let signers: Keypair[] = []

    if (
      typeof batchIdx !== 'undefined' &&
      signerBatches?.length &&
      signerBatches?.[batchIdx]?.[txIdx]
    ) {
      signers = [signerBatches[batchIdx][txIdx]]
    }

    return {
      transactionInstruction: tx,
      signers,
    }
  })
}
