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

interface TransactionInstructionWithType {
  instructionsSet: TransactionInstruction[]
  sequenceType?: SequenceType
}
interface TransactionsPlayingIndexes {
  transactionsIdx: number[]
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
  timeout: number,
  connection: Connection,
  commitment: Commitment = 'recent',
  queryStatus = false,
  startingBlock?: Block
) {
  const timeoutBlockHeight = startingBlock
    ? startingBlock.lastValidBlockHeight + 152
    : 0
  console.log('Start block height', startingBlock?.lastValidBlockHeight)
  console.log('Possible timeout block', timeoutBlockHeight)
  let done = false
  let startTimeoutCheck = false
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
        console.log('Timeout check was set to start after', timeout)
        startTimeoutCheck = true
      }, timeout)
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
            if (startTimeoutCheck) {
              promises.push(connection.getBlockHeight('confirmed'))
            }
            const [signatureStatuses, blockHeight] = await Promise.all(promises)
            if (
              typeof blockHeight !== undefined &&
              timeoutBlockHeight > blockHeight!
            ) {
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
    .catch((err) => {
      if (err.timeout && status) {
        status.err = { timeout: true }
      }

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
  return status
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

const DEFAULT_TIMEOUT = 3000
/////////////////////////////////////////////////
export async function sendSignedTransaction({
  signedTransaction,
  connection,
  timeout = DEFAULT_TIMEOUT,
  block,
}: {
  signedTransaction: Transaction
  connection: Connection
  sendingMessage?: string
  sentMessage?: string
  successMessage?: string
  timeout?: number
  block?: Block
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

    if (confirmation.err) {
      console.error(confirmation.err)
      throw new Error('Transaction failed: Custom instruction error')
    }

    slot = confirmation?.slot || 0
  } catch (err) {
    if (err.timeout) {
      throw new Error('Timed out awaiting confirmation on transaction')
    }
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
            throw new Error(
              'Transaction failed: ' + line.slice('Program log: '.length)
            )
          }
        }
      }
      throw new Error(JSON.stringify(simulateResult.err))
    }
    // throw new Error('Transaction failed');
  } finally {
    done = true
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
  block?: {
    blockhash: string
  }
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
export const sendTransactionsV2 = async (
  connection: Connection,
  wallet: WalletSigner,
  TransactionInstructions: TransactionInstructionWithType[],
  signersSet: Keypair[][],
  commitment: Commitment = 'singleGossip',
  block?: Block
) => {
  if (!wallet.publicKey) throw new Error('Wallet not connected!')
  if (!block) {
    block = await connection.getLatestBlockhash(commitment)
  }
  const unsignedTxns: Transaction[] = []
  const transactionsPlayer: TransactionsPlayingIndexes[] = []
  for (let i = 0; i < TransactionInstructions.length; i++) {
    const transactionInstruction = TransactionInstructions[i]
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
    const currentUnsignedTxIdx = unsignedTxns.length
    const currentTransactionPlayingOrder =
      transactionsPlayer[transactionsPlayer.length - 1]
    if (
      currentTransactionPlayingOrder &&
      currentTransactionPlayingOrder.sequenceType ===
        transactionInstruction.sequenceType
    ) {
      currentTransactionPlayingOrder.transactionsIdx.push(currentUnsignedTxIdx)
    } else {
      transactionsPlayer.push({
        transactionsIdx: [currentUnsignedTxIdx],
        sequenceType: transactionInstruction.sequenceType,
      })
    }
    unsignedTxns.push(transaction)
  }
  const signedTxns = await wallet.signAllTransactions(unsignedTxns)
  console.log('Transactions play order', transactionsPlayer)
  console.log('Signed transactions', signedTxns)
  for (const fcn of transactionsPlayer) {
    if (
      typeof fcn.sequenceType === 'undefined' ||
      fcn.sequenceType === SequenceType.Parallel
    ) {
      await Promise.all(
        fcn.transactionsIdx.map((x) =>
          sendSignedTransaction({
            connection,
            signedTransaction: signedTxns[x],
            block,
          })
        )
      )
    }
    if (fcn.sequenceType === SequenceType.Sequential) {
      for (const innerFcn of fcn.transactionsIdx) {
        await sendSignedTransaction({
          connection,
          signedTransaction: signedTxns[innerFcn],
          block,
        })
      }
    }
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
