import { sleep, useLocalStorageState } from '../utils/utils'
import {
  clusterApiUrl,
  Commitment,
  Connection,
  FeeCalculator,
  RpcResponseAndContext,
  SignatureStatus,
  SimulatedTransactionResponse,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
  Keypair,
} from '@solana/web3.js'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { setProgramIds } from '../utils/ids'
import {
  TokenInfo,
  TokenListProvider,
  ENV as ChainId,
} from '@solana/spl-token-registry'
import {
  SendTransactionError,
  SignTransactionError,
  TransactionTimeoutError,
} from '../utils/errors'
import { SignerWalletAdapter } from '@project-serum/sol-wallet-adapter'

export type WalletSigner = Pick<
  SignerWalletAdapter,
  'publicKey' | 'signTransaction' | 'signAllTransactions'
>

interface BlockhashAndFeeCalculator {
  blockhash: string
  feeCalculator: FeeCalculator
}

export type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet'

export const ENDPOINTS = [
  {
    name: 'mainnet-beta' as ENV,
    endpoint: 'https://explorer-api.mainnet-beta.solana.com',
    ChainId: ChainId.MainnetBeta,
  },
  {
    name: 'testnet' as ENV,
    endpoint: clusterApiUrl('testnet'),
    ChainId: ChainId.Testnet,
  },
  {
    name: 'devnet' as ENV,
    endpoint: 'https://explorer-api.devnet.solana.com',
    ChainId: ChainId.Devnet,
  },
  {
    name: 'localnet' as ENV,
    endpoint: 'http://127.0.0.1:8899',
    ChainId: ChainId.Devnet,
  },
]

const DEFAULT = ENDPOINTS[0].endpoint
const DEFAULT_SLIPPAGE = 0.25

interface ConnectionConfig {
  connection: Connection
  sendConnection: Connection
  endpoint: string
  slippage: number
  setSlippage: (val: number) => void
  env: ENV
  setEndpoint: (val: string) => void
  tokens: TokenInfo[]
  tokenMap: Map<string, TokenInfo>
}

const ConnectionContext = React.createContext<ConnectionConfig>({
  endpoint: DEFAULT,
  setEndpoint: () => null,
  slippage: DEFAULT_SLIPPAGE,
  setSlippage: (val: number) => null,
  connection: new Connection(DEFAULT, 'recent'),
  sendConnection: new Connection(DEFAULT, 'recent'),
  env: ENDPOINTS[0].name,
  tokens: [],
  tokenMap: new Map<string, TokenInfo>(),
})

enum ASSET_CHAIN {
  Solana = 1,
  Ethereum = 2,
}

export function ConnectionProvider({ children = undefined as any }) {
  const [endpoint, setEndpoint] = useLocalStorageState(
    'connectionEndpoint',
    ENDPOINTS[0].endpoint
  )

  const [slippage, setSlippage] = useLocalStorageState(
    'slippage',
    DEFAULT_SLIPPAGE.toString()
  )

  const connection = useMemo(() => new Connection(endpoint, 'recent'), [
    endpoint,
  ])
  const sendConnection = useMemo(() => new Connection(endpoint, 'recent'), [
    endpoint,
  ])

  const env =
    ENDPOINTS.find((end) => end.endpoint === endpoint)?.name ||
    ENDPOINTS[0].name

  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map())
  useEffect(() => {
    // fetch token files
    new TokenListProvider().resolve().then((container) => {
      const list = container
        .excludeByTag('nft')
        .filterByChainId(
          ENDPOINTS.find((end) => end.endpoint === endpoint)?.ChainId ||
            ChainId.MainnetBeta
        )
        .getList()

      // WORMHOLE TOKEN NEEDED
      list.push({
        address: '66CgfJQoZkpkrEgC1z4vFJcSFc4V6T5HqbjSSNuqcNJz',
        chainId: ASSET_CHAIN.Solana,
        decimals: 9,
        logoURI:
          'https://assets.coingecko.com/coins/images/15500/thumb/ibbtc.png?1621077589',
        name: 'Interest Bearing Bitcoin (Wormhole)',
        symbol: 'IBBTC',
        extensions: {
          address: '0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f',
        },
      })
      const knownMints = [...list].reduce((map, item) => {
        map.set(item.address, item)
        return map
      }, new Map<string, TokenInfo>())

      setTokenMap(knownMints)
      setTokens(list)
    })
  }, [env])

  setProgramIds(env)

  // The websocket library solana/web3.js uses closes its websocket connection when the subscription list
  // is empty after opening its first time, preventing subsequent subscriptions from receiving responses.
  // This is a hack to prevent the list from every getting empty
  useEffect(() => {
    const id = connection.onAccountChange(new Keypair().publicKey, () => null)
    return () => {
      connection.removeAccountChangeListener(id)
    }
  }, [connection])

  useEffect(() => {
    const id = connection.onSlotChange(() => null)
    return () => {
      connection.removeSlotChangeListener(id)
    }
  }, [connection])

  useEffect(() => {
    const id = sendConnection.onAccountChange(
      new Keypair().publicKey,
      () => null
    )
    return () => {
      sendConnection.removeAccountChangeListener(id)
    }
  }, [sendConnection])

  useEffect(() => {
    const id = sendConnection.onSlotChange(() => null)
    return () => {
      sendConnection.removeSlotChangeListener(id)
    }
  }, [sendConnection])

  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        setEndpoint,
        slippage: parseFloat(slippage),
        setSlippage: (val) => setSlippage(val.toString()),
        connection,
        sendConnection,
        tokens,
        tokenMap,
        env,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  )
}

export function useConnection() {
  return useContext(ConnectionContext).connection as Connection
}

export function useSendConnection() {
  return useContext(ConnectionContext)?.sendConnection
}

export function useConnectionConfig() {
  const context = useContext(ConnectionContext)
  return {
    endpoint: context.endpoint,
    setEndpoint: context.setEndpoint,
    env: context.env,
    tokens: context.tokens,
    tokenMap: context.tokenMap,
  }
}

export function useSlippageConfig() {
  const { slippage, setSlippage } = useContext(ConnectionContext)
  return { slippage, setSlippage }
}

export const getErrorForTransaction = async (
  connection: Connection,
  txid: string
) => {
  // wait for all confirmation before geting transaction

  await connection.confirmTransaction(txid, 'max')

  const tx = await connection.getParsedConfirmedTransaction(txid)

  const errors: string[] = []
  if (tx?.meta && tx.meta.logMessages) {
    tx.meta.logMessages.forEach((log) => {
      const regex = /Error: (.*)/gm
      let m
      while ((m = regex.exec(log)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++
        }

        if (m.length > 1) {
          errors.push(m[1])
        }
      }
    })
  }

  return errors
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
  successCallback: (txid: string, ind: number) => void = (txid, ind) => null,
  failCallback: (reason: string, ind: number) => boolean = (txid, ind) => false,
  block?: {
    blockhash: string
    feeCalculator: FeeCalculator
  }
): Promise<number> => {
  if (!wallet.publicKey) throw new Error('Wallet not connected!')

  const unsignedTxns: Transaction[] = []

  if (!block) {
    block = await connection.getRecentBlockhash(commitment)
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
      .then(({ txid, slot }) => {
        successCallback(txid, i)
      })
      .catch((reason) => {
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

export const sendTransaction = async (
  connection: Connection,
  wallet: WalletSigner,
  instructions: TransactionInstruction[],
  signers: Keypair[],
  awaitConfirmation = true,
  commitment: Commitment = 'singleGossip',
  includesFeePayer = false,
  block?: BlockhashAndFeeCalculator
) => {
  if (!wallet.publicKey) throw new Error('Wallet not connected')

  let transaction = new Transaction()
  instructions.forEach((instruction) => transaction.add(instruction))
  transaction.recentBlockhash = (
    block || (await connection.getRecentBlockhash(commitment))
  ).blockhash

  if (includesFeePayer) {
    transaction.setSigners(...signers.map((s) => s.publicKey))
  } else {
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    )
  }

  if (signers.length > 0) {
    transaction.partialSign(...signers)
  }

  if (!includesFeePayer) {
    try {
      transaction = await wallet.signTransaction(transaction)
    } catch (ex) {
      throw new SignTransactionError(ex)
    }
  }

  const rawTransaction = transaction.serialize()
  const options = {
    skipPreflight: true,
    commitment,
  }

  const txid = await connection.sendRawTransaction(rawTransaction, options)
  let slot = 0

  if (awaitConfirmation) {
    const confirmationStatus = await awaitTransactionSignatureConfirmation(
      txid,
      DEFAULT_TIMEOUT,
      connection,
      commitment
    )

    slot = confirmationStatus?.slot || 0

    if (confirmationStatus?.err) {
      const errors: string[] = []
      try {
        // TODO: This call always throws errors and delays error feedback
        //       It needs to be investigated but for now I'm commenting it out
        // errors = await getErrorForTransaction(connection, txid);
      } catch (ex) {
        console.error('getErrorForTransaction() error', ex)
      }
      const err = confirmationStatus.err as any
      if ('timeout' in err) {
        // notify({
        //   message: `Transaction hasn't been confirmed within ${
        //     DEFAULT_TIMEOUT / 1000
        //   }s. Please check on Solana Explorer`,
        //   description: <>{txid}</>,
        //   type: 'warn',
        // })
        // throw new TransactionTimeoutError(txid)
      }

      throw new SendTransactionError(
        `Transaction ${txid} failed (${JSON.stringify(confirmationStatus)})`,
        txid,
        confirmationStatus.err
      )
    }
  }

  return { txid, slot }
}

export const sendTransactionWithRetry = async (
  connection: Connection,
  wallet: WalletSigner,
  instructions: TransactionInstruction[],
  signers: Keypair[],
  commitment: Commitment = 'singleGossip',
  includesFeePayer = false,
  block?: BlockhashAndFeeCalculator,
  beforeSend?: () => void
) => {
  if (!wallet.publicKey) throw new Error('Wallet not connected!')

  let transaction = new Transaction()
  instructions.forEach((instruction) => transaction.add(instruction))
  transaction.recentBlockhash = (
    block || (await connection.getRecentBlockhash(commitment))
  ).blockhash

  if (includesFeePayer) {
    transaction.setSigners(...signers.map((s) => s.publicKey))
  } else {
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    )
  }

  if (signers.length > 0) {
    transaction.partialSign(...signers)
  }
  if (!includesFeePayer) {
    transaction = await wallet.signTransaction(transaction)
  }

  if (beforeSend) {
    beforeSend()
  }

  const { txid, slot } = await sendSignedTransaction({
    connection,
    signedTransaction: transaction,
  })

  return { txid, slot }
}
///////////////////////////////////////
export const getUnixTs = () => {
  return new Date().getTime() / 1000
}

const DEFAULT_TIMEOUT = 30000
/////////////////////////////////////////////////
export async function sendSignedTransaction({
  signedTransaction,
  connection,
  timeout = DEFAULT_TIMEOUT,
}: {
  signedTransaction: Transaction
  connection: Connection
  sendingMessage?: string
  sentMessage?: string
  successMessage?: string
  timeout?: number
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
      true
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

async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection,
  commitment: Commitment = 'recent',
  queryStatus = false
) {
  let done = false
  let status: SignatureStatus | null = {
    slot: 0,
    confirmations: 0,
    err: null,
  }
  let subId = 0
  await new Promise((resolve, reject) => {
    ;(async () => {
      setTimeout(() => {
        if (done) {
          return
        }
        done = true
        reject({ timeout: true })
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
        ;(async () => {
          try {
            const signatureStatuses = await connection.getSignatureStatuses([
              txid,
            ])
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
        })()
        await sleep(2000)
      }
    })()
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
