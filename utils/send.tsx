import { notify } from './notifications'
import {
  Connection,
  Keypair,
  SimulatedTransactionResponse,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js'
import Wallet from '@project-serum/sol-wallet-adapter'
import { sleep } from '@project-serum/common'
import { WalletSigner } from '@solana/spl-governance'
import { invalidateInstructionAccounts } from '@hooks/queries/queryClient'

class TransactionError extends Error {
  public txid: string
  constructor(message: string, txid?: string) {
    super(message)
    this.txid = txid!
  }
}

export function getUnixTs() {
  return new Date().getTime() / 1000
}

const DEFAULT_TIMEOUT = 31000

/** @deprecated use sendTransactionsV3 */
export async function sendTransaction({
  transaction,
  wallet,
  signers = [],
  connection,
  sendingMessage = 'Sending transaction...',
  successMessage = 'Transaction confirmed',
  timeout = DEFAULT_TIMEOUT,
}: {
  transaction: Transaction
  wallet: WalletSigner
  signers?: Array<Keypair>
  connection: Connection
  sendingMessage?: string
  successMessage?: string
  timeout?: number
}) {
  const signedTransaction = await signTransaction({
    transaction,
    wallet,
    signers,
    connection,
  })
  return await sendSignedTransaction({
    signedTransaction,
    connection,
    sendingMessage,
    successMessage,
    timeout,
  })
}

export async function signTransaction({
  transaction,
  wallet,
  signers = [],
  connection,
}: {
  transaction: Transaction
  wallet: WalletSigner
  signers?: Array<Keypair>
  connection: Connection
}) {
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash('max')
  ).blockhash
  transaction.setSigners(wallet!.publicKey!, ...signers.map((s) => s.publicKey))
  if (signers.length > 0) {
    transaction.partialSign(...signers)
  }
  return await wallet.signTransaction(transaction)
}

export async function signTransactions({
  transactionsAndSigners,
  wallet,
  connection,
}: {
  transactionsAndSigners: {
    transaction: Transaction
    signers?: Array<Keypair>
  }[]
  wallet: Wallet
  connection: Connection
}) {
  const blockhash = (await connection.getLatestBlockhash('max')).blockhash
  transactionsAndSigners.forEach(({ transaction, signers = [] }) => {
    transaction.recentBlockhash = blockhash
    transaction.setSigners(
      wallet!.publicKey!,
      ...signers.map((s) => s.publicKey)
    )
    if (signers?.length > 0) {
      transaction.partialSign(...signers)
    }
  })

  let signed
  try {
    signed = await wallet.signAllTransactions(
      transactionsAndSigners.map(({ transaction }) => transaction)
    )
  } catch (e) {
    console.log(e)
  }

  return signed
}

export async function sendSignedTransaction({
  signedTransaction,
  connection,
  sendingMessage = 'Sending transaction...',
  successMessage = 'Transaction confirmed',
  timeout = DEFAULT_TIMEOUT,
}: {
  signedTransaction: Transaction
  connection: Connection
  sendingMessage?: string
  successMessage?: string
  timeout?: number
}): Promise<string> {
  // debugger
  console.log('raw tx')
  const rawTransaction = signedTransaction.serialize()
  const startTime = getUnixTs()

  console.log('raw tx', rawTransaction)

  notify({ message: sendingMessage })
  console.log('notify')

  const txid: TransactionSignature = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight: true,
    }
  )
  console.log('notify2')

  console.log('Started awaiting confirmation for', txid)

  let done = false

  ;(async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      })

      await sleep(3000)
    }
  })()

  try {
    console.log('calling confirmation sig', txid, timeout, connection)

    console.log(
      'calling signatures confirmation',
      await awaitTransactionSignatureConfirmation(txid, timeout, connection)
    )
  } catch (err) {
    if (err.timeout) {
      throw new Error('Timed out awaiting confirmation on transaction')
    }

    let simulateResult: SimulatedTransactionResponse | null = null

    console.log('sined transaction', signedTransaction)

    // Simulate failed transaction to parse out an error reason
    try {
      console.log('start simulate')
      simulateResult = (await connection.simulateTransaction(signedTransaction))
        .value
    } catch (error) {
      console.log('Error simulating: ', error)
    }

    console.log('simulate result', simulateResult)

    // Parse and throw error if simulation fails
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        console.log('simulate resultlogs', simulateResult.logs)

        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i]

          if (line.startsWith('Program log: ')) {
            throw new TransactionError(
              'Transaction failed: ' + line.slice('Program log: '.length),
              txid
            )
          }
        }
      }
      throw new TransactionError(JSON.stringify(simulateResult.err), txid)
    }

    console.log('transaction error lasdkasdn')

    throw new TransactionError('Transaction failed', txid)
  } finally {
    done = true
  }

  notify({ message: successMessage, type: 'success', txid })
  signedTransaction.instructions.forEach(invalidateInstructionAccounts)
  console.log('Latency', txid, getUnixTs() - startTime)
  return txid
}

/**
 * Send a primary transaction and an adjacent one
 */
export async function sendSignedAndAdjacentTransactions({
  signedTransaction,
  adjacentTransaction,
  connection,
  sendingMessage = 'Sending transaction...',
  successMessage = 'Transaction confirmed',
  timeout = DEFAULT_TIMEOUT,
}: {
  signedTransaction: Transaction
  adjacentTransaction: Transaction
  connection: Connection
  sendingMessage?: string
  successMessage?: string
  timeout?: number
}): Promise<string> {
  notify({ message: sendingMessage })

  // Serialize both transactions
  const rawTransaction = signedTransaction.serialize()
  const rawAdjTransaction = adjacentTransaction.serialize()

  const proposalTxPromise = connection.sendRawTransaction(rawAdjTransaction, {
    skipPreflight: true,
  })
  await sleep(30)
  const adjTxPromise = connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
  })

  const [proposalTxId, adjTxId] = await Promise.all([
    proposalTxPromise,
    adjTxPromise,
  ])

  // Retry mechanism
  let done = false
  const startTime = getUnixTs()
  console.log('Started awaiting confirmation for', proposalTxId)
  ;(async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      console.log('RETRYING')
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      })
      await sleep(3000)
    }
  })()

  try {
    console.log(
      'calling signatures confirmation',
      await awaitTransactionSignatureConfirmation(adjTxId, timeout, connection),
      await awaitTransactionSignatureConfirmation(
        proposalTxId,
        timeout,
        connection
      )
    )
  } catch (err) {
    if (err.timeout) {
      throw new Error('Timed out awaiting confirmation on transaction')
    }

    let simulateResult: SimulatedTransactionResponse | null = null

    console.log('signed transaction', signedTransaction)

    // Simulate failed transaction to parse out an error reason
    try {
      console.log('start simulate')
      simulateResult = (await connection.simulateTransaction(signedTransaction))
        .value
    } catch (error) {
      console.log('Error simulating: ', error)
    }

    console.log('simulate result', simulateResult)

    // Parse and throw error if simulation fails
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        console.log('simulate resultlogs', simulateResult.logs)

        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i]

          if (line.startsWith('Program log: ')) {
            throw new TransactionError(
              'Transaction failed: ' + line.slice('Program log: '.length),
              proposalTxId
            )
          }
        }
      }
      throw new TransactionError(
        JSON.stringify(simulateResult.err),
        proposalTxId
      )
    }

    console.log('transaction error')

    throw new TransactionError('Transaction failed', proposalTxId)
  } finally {
    done = true
  }

  notify({ message: successMessage, type: 'success', txid: proposalTxId })

  console.log('Latency', proposalTxId, getUnixTs() - startTime)
  return proposalTxId
}

async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection
) {
  let done = false
  const result = await new Promise((resolve, reject) => {
    // eslint-disable-next-line
    ;(async () => {
      setTimeout(() => {
        if (done) {
          return
        }
        done = true
        console.log('Timed out for txid', txid)
        reject({ timeout: true })
      }, timeout)
      try {
        connection.onSignature(
          txid,
          (result) => {
            console.log('WS confirmed', txid, result, result.err)
            done = true
            if (result.err) {
              reject(result.err)
            } else {
              resolve(result)
            }
          },
          connection.commitment
        )
        console.log('Set up WS connection', txid)
      } catch (e) {
        done = true
        console.log('WS error in setup', txid, e)
      }
      while (!done) {
        // eslint-disable-next-line
        ;(async () => {
          try {
            const signatureStatuses = await connection.getSignatureStatuses([
              txid,
            ])

            console.log('signatures cancel proposal', signatureStatuses)

            const result = signatureStatuses && signatureStatuses.value[0]

            console.log('result signatures proosa', result, signatureStatuses)

            if (!done) {
              if (!result) {
                // console.log('REST null result for', txid, result);
              } else if (result.err) {
                console.log('REST error for', txid, result)
                done = true
                reject(result.err)
              }
              // @ts-ignore
              else if (
                !(
                  result.confirmations ||
                  result.confirmationStatus === 'confirmed' ||
                  result.confirmationStatus === 'finalized'
                )
              ) {
                console.log('REST not confirmed', txid, result)
              } else {
                console.log('REST confirmed', txid, result)
                done = true
                resolve(result)
              }
            }
          } catch (e) {
            if (!done) {
              console.log('REST connection error: txid', txid, e)
            }
          }
        })()
        await sleep(3000)
      }
    })()
  })
  done = true
  return result
}
