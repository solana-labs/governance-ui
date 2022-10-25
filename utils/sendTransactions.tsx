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

//////////////////////////////////////////////
export async function simulateTransaction(
  connection: Connection,
  transaction: Transaction,
  commitment: Commitment
): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
  // @ts-ignore
  transaction.recentBlockhash = await connection._recentBlockhash(
    // @ts-ignore
    connection._disableBlockhashCaching
  )

  const signData = transaction.serializeMessage()
  // @ts-ignore
  const wireTransaction = transaction._serialize(signData)
  const encodedTransaction = wireTransaction.toString('base64')
  const config: any = { encoding: 'base64', commitment }
  const args = [encodedTransaction, config]

  // @ts-ignore
  const res = await connection._rpcRequest('simulateTransaction', args)
  if (res.error) {
    throw new Error('failed to simulate transaction: ' + res.error.message)
  }
  return res.result
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
      simulateResult = (
        await simulateTransaction(connection, signedTransaction, 'single')
      ).value
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
/////////////////////////////////////////
export const sendTransactions = async (
  connection: Connection,
  wallet: WalletSigner,
  instructionSet: TransactionInstruction[][],
  signersSet: Keypair[][],
  sequenceType: SequenceType = SequenceType.Parallel,
  commitment: Commitment = 'singleGossip',
  successCallback: (txid: string, ind: number) => void = (_txid, _ind) => null,
  failCallback: (reason: string, ind: number) => boolean = (_txid, _ind) =>
    false,
  block?: Block
): Promise<number> => {
  if (!wallet.publicKey) throw new Error('Wallet not connected!')

  const unsignedTxns: Transaction[] = []

  if (!block) {
    block = await connection.getLatestBlockhash(commitment)
  }
  for (let i = 0; i < instructionSet.length; i++) {
    const instructions = instructionSet[i]
    const signers = signersSet[i]

    if (instructions.length === 0) {
      continue
    }

    const transaction = new Transaction()
    instructions.forEach((instruction) => transaction.add(instruction))
    transaction.recentBlockhash = block.blockhash
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    )

    if (signers.length > 0) {
      transaction.partialSign(...signers)
    }

    unsignedTxns.push(transaction)
  }
  const signedTxns = await wallet.signAllTransactions(unsignedTxns)
  const pendingTxns: Promise<{ txid: string; slot: number }>[] = []

  const breakEarlyObject = { breakEarly: false }
  for (let i = 0; i < signedTxns.length; i++) {
    const signedTxnPromise = sendSignedTransaction({
      connection,
      signedTransaction: signedTxns[i],
      block: block,
    })

    signedTxnPromise
      .then(({ txid }) => {
        successCallback(txid, i)
      })
      .catch((_reason) => {
        // @ts-ignore
        failCallback(signedTxns[i], i)
        if (sequenceType == SequenceType.StopOnFailure) {
          breakEarlyObject.breakEarly = true
        }
      })

    if (sequenceType != SequenceType.Parallel) {
      await signedTxnPromise
      if (breakEarlyObject.breakEarly) {
        return i // REturn the txn we failed on by index
      }
    } else {
      pendingTxns.push(signedTxnPromise)
    }
  }

  if (sequenceType != SequenceType.Parallel) {
    await Promise.all(pendingTxns)
  }

  return signedTxns.length
}

/////////////////////////////////////////
export const sendTransactionsV2 = async ({
  connection,
  wallet,
  TransactionInstructions,
  signersSet,
  block,
  showUiComponent = false,
  runAfterApproval,
  runAfterTransactionConfirmation,
}: {
  connection: Connection
  wallet: WalletSigner
  TransactionInstructions: TransactionInstructionWithType[]
  signersSet: Keypair[][]
  block?: Block
  showUiComponent?: boolean
  runAfterApproval?: (() => void) | null
  runAfterTransactionConfirmation?: (() => void) | null
}) => {
  if (!wallet.publicKey) throw new Error('Wallet not connected!')
  //block will be used for timeout calculation
  if (!block) {
    block = await connection.getLatestBlockhash('confirmed')
  }

  const maxTransactionsInBath =
    TransactionInstructions.filter(
      (x) => x.sequenceType === SequenceType.Sequential
    ).length > 0
      ? 20
      : 30
  const currentTransactions = TransactionInstructions.slice(
    0,
    maxTransactionsInBath
  )
  const unsignedTxns: Transaction[] = []
  //this object will determine how we run transactions e.g [ParallelTx, SequenceTx, ParallelTx]
  const transactionCallOrchestrator: TransactionsPlayingIndexes[] = []
  for (let i = 0; i < currentTransactions.length; i++) {
    const transactionInstruction = currentTransactions[i]
    const signers = signersSet[i]

    if (transactionInstruction.instructionsSet.length === 0) {
      continue
    }

    const transaction = new Transaction({ feePayer: wallet.publicKey })
    transactionInstruction.instructionsSet.forEach((instruction) =>
      transaction.add(instruction)
    )
    transaction.recentBlockhash = block.blockhash

    if (signers.length > 0) {
      transaction.partialSign(...signers)
    }
    //we take last index of unsignedTransactions to have right indexes because
    //if transactions was empty
    //then unsigned transactions could not mach TransactionInstructions param indexes
    const currentUnsignedTxIdx = unsignedTxns.length
    const currentTransactionCall =
      transactionCallOrchestrator[transactionCallOrchestrator.length - 1]
    //we check if last item in current transactions call type is same
    //if not then we create next transaction type
    if (
      currentTransactionCall &&
      currentTransactionCall.sequenceType ===
        transactionInstruction.sequenceType
    ) {
      //we push reflection of transactionInstruction as object value for retry.
      currentTransactionCall.transactionsIdx.push({ [currentUnsignedTxIdx]: i })
    } else {
      transactionCallOrchestrator.push({
        //we push reflection of transactionInstruction as object value for retry.
        transactionsIdx: [{ [currentUnsignedTxIdx]: i }],
        sequenceType: transactionInstruction.sequenceType,
      })
    }
    unsignedTxns.push(transaction)
  }
  console.log(transactionCallOrchestrator)
  const signedTxns = await wallet.signAllTransactions(unsignedTxns)
  if (showUiComponent) {
    showTransactionsProcessUi(signedTxns.length)
  }
  if (runAfterApproval) {
    runAfterApproval()
  }
  console.log(
    'Transactions play type order',
    transactionCallOrchestrator.map((x) => {
      return {
        ...x,
        sequenceType:
          typeof x.sequenceType !== 'undefined'
            ? SequenceType[SequenceType[x.sequenceType]]
            : 'Parallel',
      }
    })
  )
  console.log('Signed transactions', signedTxns)
  try {
    for (const fcn of transactionCallOrchestrator) {
      if (
        typeof fcn.sequenceType === 'undefined' ||
        fcn.sequenceType === SequenceType.Parallel
      ) {
        //wait for all Parallel
        await Promise.all(
          fcn.transactionsIdx.map((idx) => {
            const transactionIdx = Object.keys(idx)[0]
            const transactionInstructionIdx = idx[transactionIdx]
            return sendSignedTransaction({
              connection,
              signedTransaction: signedTxns[transactionIdx],
              block: block!,
              transactionInstructionIdx: transactionInstructionIdx,
              showUiComponent,
            })
          })
        )
      }
      if (fcn.sequenceType === SequenceType.Sequential) {
        //wait for all Sequential
        for (const idx of fcn.transactionsIdx) {
          const transactionIdx = Object.keys(idx)[0]
          const transactionInstructionIdx = idx[transactionIdx]
          await sendSignedTransaction({
            connection,
            signedTransaction: signedTxns[transactionIdx],
            block,
            transactionInstructionIdx: transactionInstructionIdx,
            showUiComponent,
          })
        }
      }
    }
    //we call recursively our function to forward rest of transactions if
    // number of them is higher then maxTransactionsInBath
    if (TransactionInstructions.length > maxTransactionsInBath) {
      const forwardedTransactions = TransactionInstructions.slice(
        maxTransactionsInBath,
        TransactionInstructions.length
      )
      const forwardedSigners = signersSet.slice(
        maxTransactionsInBath,
        TransactionInstructions.length
      )
      await sendTransactionsV2({
        connection,
        wallet,
        TransactionInstructions: forwardedTransactions,
        signersSet: forwardedSigners,
        showUiComponent,
      })
    }
    if (showUiComponent) {
      closeTransactionProcessUi()
    }
    if (runAfterTransactionConfirmation) {
      runAfterTransactionConfirmation()
    }
  } catch (e) {
    if (showUiComponent) {
      const idx = e?.txInstructionIdx
      const txInstructionForRetry = TransactionInstructions.slice(
        idx,
        TransactionInstructions.length
      )
      const signersForRetry = signersSet.slice(idx, signersSet.length)
      if (showUiComponent) {
        showTransactionError(
          () =>
            sendTransactionsV2({
              connection,
              wallet,
              TransactionInstructions: txInstructionForRetry,
              signersSet: signersForRetry,
              showUiComponent,
              runAfterApproval: runAfterApproval,
              runAfterTransactionConfirmation: runAfterTransactionConfirmation,
            }),
          e.error ? e.error : `${e}`,
          e.txid
        )
      }
    }
    throw e
  }
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
    afterFirstBatchSign: (signedTxnsCount) => {
      if (callbacks?.afterFirstBatchSign) {
        callbacks?.afterFirstBatchSign(signedTxnsCount)
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
        e.error ? e.error : `${e}`,
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
