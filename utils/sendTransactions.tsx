import * as Sentry from '@sentry/react'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import {
  Commitment,
  Connection,
  RpcResponseAndContext,
  SignatureStatus,
  SimulatedTransactionResponse,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
  Keypair,
} from '@solana/web3.js'
import {
  closeTransactionProcessUi,
  incrementProcessedTransactions,
  showTransactionError,
  showTransactionsProcessUi,
} from './transactionsLoader'
import {
  sendSignAndConfirmTransactions,
  sendSignAndConfirmTransactionsProps,
} from '@blockworks-foundation/mangolana/lib/transactions'
import { invalidateInstructionAccounts } from '@hooks/queries/queryClient'

interface TransactionInstructionWithType {
  instructionsSet: TransactionInstruction[]
  sequenceType?: SequenceType
}
interface TransactionsPlayingIndexes {
  transactionsIdx: { [txIdx: number]: number }[]
  sequenceType?: SequenceType
}

interface Block {
  blockhash: string
  lastValidBlockHeight: number
}

// TODO: sendTransactions() was imported from Oyster as is and needs to be reviewed and updated
// In particular common primitives should be unified with send.tsx and also ensure the same resiliency mechanism
// is used for monitoring transactions status and timeouts

const sleep = (ttl: number) =>
  new Promise((resolve) => setTimeout(() => resolve(true), ttl))

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

async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  //after that time we will start to check blockHeight
  startTimeoutCheckThreshold: number,
  connection: Connection,
  commitment: Commitment = 'recent',
  queryStatus = false,
  startingBlock: Block
) {
  //If the validator can’t find a slot number for the blockhash
  //or if the looked up slot number is more than 151 slots lower
  // than the slot number of the block being processed, the transaction will be rejected.
  const timeoutBlockPeriod = 152
  const timeoutBlockHeight =
    startingBlock.lastValidBlockHeight + timeoutBlockPeriod
  console.log('Start block height', startingBlock?.lastValidBlockHeight)
  console.log('Possible timeout block', timeoutBlockHeight)
  let done = false
  let startTimeoutCheck = false
  let timeout = false
  let status: SignatureStatus | null = {
    slot: 0,
    confirmations: 0,
    err: null,
  }
  let subId = 0
  await new Promise((resolve, reject) => {
    const fn = async () => {
      setTimeout(() => {
        if (done) {
          return
        }
        console.log('Starting timeout check')
        console.log(
          'Timeout check was set to start after',
          startTimeoutCheckThreshold
        )
        startTimeoutCheck = true
      }, startTimeoutCheckThreshold)
      try {
        subId = connection.onSignature(
          txid,
          (result, context) => {
            done = true
            status = {
              err: result.err,
              slot: context.slot,
              confirmations: 0,
            }
            if (result.err) {
              console.log('Rejected via websocket', result.err)
              Sentry.captureException(
                `awaitTransactionSignatureConfirmation line 107: ${result.err}`,
                { tags: { tag: 'sendTransactionsErrors' } }
              )
              reject(result.err)
            } else {
              console.log('Resolved via websocket', result)
              resolve(result)
            }
          },
          commitment
        )
      } catch (e) {
        done = true
        console.error('WS error in setup', txid, e)
      }
      while (!done && queryStatus) {
        // eslint-disable-next-line no-loop-func
        const fn = async () => {
          try {
            const promises: [
              Promise<RpcResponseAndContext<(SignatureStatus | null)[]>>,
              Promise<number>?
            ] = [connection.getSignatureStatuses([txid])]
            //if startTimeoutThreshold passed we start to check if
            //current blocks are did not passed timeoutBlockHeight threshold
            if (startTimeoutCheck) {
              promises.push(connection.getBlockHeight('confirmed'))
            }
            const [signatureStatuses, blockHeight] = await Promise.all(promises)
            if (
              typeof blockHeight !== undefined &&
              timeoutBlockHeight <= blockHeight!
            ) {
              done = true
              timeout = true
              console.log('Tx Timeout ----')
              reject({ timeout: true })
            }

            if (blockHeight) {
              console.log('Timeout threshold blockheight', timeoutBlockHeight)
              console.log('Current blockheight', blockHeight)
            }
            status = signatureStatuses && signatureStatuses.value[0]
            if (!done) {
              if (!status) {
                console.log('REST null result for', txid, status)
              } else if (status.err) {
                console.log('REST error for', txid, status)
                done = true
                Sentry.captureException(
                  `awaitTransactionSignatureConfirmation line 158: ${status.err}`,
                  { tags: { tag: 'sendTransactionsErrors' } }
                )
                reject(status.err)
              } else if (!status.confirmations) {
                console.log('REST no confirmations for', txid, status)
              } else {
                console.log('REST confirmation for', txid, status)
                done = true
                resolve(status)
              }
            }
          } catch (e) {
            if (!done) {
              Sentry.captureException(
                `awaitTransactionSignatureConfirmation line 173: ${e}`,
                { tags: { tag: 'sendTransactionsErrors' } }
              )
              console.log('REST connection error: txid', txid, e)
            }
          }
        }
        fn()
        await sleep(2000)
      }
    }
    fn()
  })
    .catch(() => {
      //@ts-ignore
      if (connection._signatureSubscriptions[subId])
        connection.removeSignatureListener(subId)
    })
    .then((_) => {
      //@ts-ignore
      if (connection._signatureSubscriptions[subId])
        connection.removeSignatureListener(subId)
    })
  done = true
  return { status, timeout }
}

///////////////////////////////////////
export const getUnixTs = () => {
  return new Date().getTime() / 1000
}

const DEFAULT_TIMEOUT = 60000
/////////////////////////////////////////////////
export async function sendSignedTransaction({
  signedTransaction,
  connection,
  timeout = DEFAULT_TIMEOUT,
  block,
  transactionInstructionIdx,
  showUiComponent = false,
}: {
  signedTransaction: Transaction
  connection: Connection
  sendingMessage?: string
  sentMessage?: string
  successMessage?: string
  timeout?: number
  block: Block
  transactionInstructionIdx?: number
  showUiComponent?: boolean
}): Promise<{ txid: string; slot: number }> {
  const rawTransaction = signedTransaction.serialize()
  const startTime = getUnixTs()
  let slot = 0
  const txid: TransactionSignature = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight: true,
    }
  )

  console.log('Started awaiting confirmation for', txid)
  let hasTimeout = false
  let done = false
  ;(async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      })
      await sleep(500)
    }
  })()
  try {
    const confirmation = await awaitTransactionSignatureConfirmation(
      txid,
      timeout,
      connection,
      'recent',
      true,
      block
    )
    if (confirmation?.status?.err) {
      throw new Error('Transaction failed: Custom instruction error')
    }
    slot = confirmation?.status?.slot || 0
    hasTimeout = confirmation.timeout
  } catch (err) {
    Sentry.captureException(`sendSignedTransaction line 287: ${err}`, {
      tags: { tag: 'sendTransactionsErrors' },
    })
    let simulateResult: SimulatedTransactionResponse | null = null
    try {
      simulateResult = (await connection.simulateTransaction(signedTransaction))
        .value
    } catch (e) {
      //
    }
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i]
          if (line.startsWith('Program log: ')) {
            Sentry.captureException(`sendSignedTransaction line 303: ${line}`)
            throw {
              txInstructionIdx: transactionInstructionIdx,
              error:
                'Transaction failed: ' + line.slice('Program log: '.length),
              txid: txid,
            }
          }
        }
      }
      Sentry.captureException(
        `sendSignedTransaction line 314: ${simulateResult.err}`,
        { tags: { tag: 'sendTransactionsErrors' } }
      )
      throw {
        txInstructionIdx: transactionInstructionIdx,
        error: JSON.stringify(simulateResult.err),
        txid: txid,
      }
    }
    // throw new Error('Transaction failed');
  } finally {
    done = true
  }
  if (hasTimeout) {
    throw {
      txInstructionIdx: transactionInstructionIdx,
      error: 'Timed out awaiting confirmation on transaction',
      txid: txid,
    }
  }
  if (showUiComponent) {
    incrementProcessedTransactions()
  }
  console.log('Latency', txid, getUnixTs() - startTime)
  return { txid, slot }
}
export enum SequenceType {
  Sequential,
  Parallel,
  StopOnFailure,
}

export const transactionInstructionsToTypedInstructionsSets = (
  instructionsSet: TransactionInstruction[],
  type: SequenceType
): TransactionInstructionWithType => {
  return {
    instructionsSet: instructionsSet,
    sequenceType: type,
  }
}

export const sendTransactionsV3 = ({
  connection,
  wallet,
  transactionInstructions,
  timeoutStrategy,
  callbacks,
  config,
}: sendSignAndConfirmTransactionsProps) => {
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
    },
    afterEveryTxConfirmation: () => {
      if (callbacks?.afterEveryTxConfirmation) {
        callbacks?.afterEveryTxConfirmation()
      }
      incrementProcessedTransactions()
      // TODO could optimize to only invalidate the accts associated with this tx, current api doesnt allow this
      transactionInstructions.forEach((x) =>
        x.instructionsSet.forEach((x) =>
          invalidateInstructionAccounts(x.transactionInstruction)
        )
      )
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
          }),
        getErrorMsg(e),
        e.txid
      )
    },
  }

  const cfg = {
    maxTxesInBatch:
      transactionInstructions.filter(
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
    transactionInstructions,
    timeoutStrategy,
    callbacks: callbacksWithUiComponent,
    config: cfg,
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
) => {
  return txBatch.map((tx, txIdx) => {
    return {
      transactionInstruction: tx,
      signers:
        typeof batchIdx !== 'undefined' &&
        signerBatches.length &&
        signerBatches[batchIdx] &&
        signerBatches[batchIdx][txIdx]
          ? [signerBatches[batchIdx][txIdx]]
          : [],
    }
  })
}
