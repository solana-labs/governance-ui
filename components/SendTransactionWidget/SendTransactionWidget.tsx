import React, { FunctionComponent, useEffect, useState } from 'react'
import { sendSignedTransaction, SequenceType } from '@utils/sendTransactions'
import { TransactionFlow } from './model/NamedTransaction'
import useWalletStore from 'stores/useWalletStore'
import { SimulatedTransactionResponse, Transaction } from '@solana/web3.js'
import { simulateTransaction } from '@solana/spl-governance'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import NamedTransaction from './class/NamedTransaction'
import { sendTransaction } from '@utils/send'

interface ProgressBarProps {
  progressBarOuterClass?: string
  progressBarInnerClass?: string
  textClass?: string
  /**
   * The promise listener that the send transaction method should return.
   */
  transactions: TransactionFlow[]
  /**
   * When the progress is finished, this callback will be triggered
   */
  onFinish?: (txIds: string[]) => void
  /**
   * If an error happen, this callback will be triggered
   */
  onError?: (error: Error, index?: number) => void
  /**
   * It will be executed whether or not the transactions succeed at the end
   * of the execution.
   */
  onFinally?: () => void
  /**
   * It will be executed when a transaction is sent and may be executed more
   * than once
   */
  onSend?: (txId: string, index?: number) => void
  /**
   * It will be executed when a set of parallel transactions are sent
   * and may be executed more than once
   */
  onSendParallel?: (txId: string[]) => void
}

const SendTransactionWidget: FunctionComponent<ProgressBarProps> = ({
  textClass = '',
  progressBarOuterClass = '',
  progressBarInnerClass = '',
  transactions,
  onFinish,
  onFinally,
  onError,
  onSend,
  onSendParallel,
}) => {
  const { connection, current: wallet } = useWalletStore((s) => s)

  const [txnLen, setTxnLen] = useState<number>(0)
  const [txnIds, setTxnIds] = useState<string[]>([])

  const [currentTxn, setCurrentTxn] = useState<number>(-1)
  const [txnName, setTxnName] = useState('')

  const [stepName, setStepName] = useState('Preparing transactions..')
  const [currentStep, setCurrentStep] = useState(-1)

  const [progressMaxSteps, setProgressMaxSteps] = useState<number>(1)
  const [progressStep, setProgressStep] = useState<number>(-2)

  const [finished, setFinished] = useState<boolean>(false)

  const pushTxn = (...txnId: string[]) => {
    const txns = txnIds
    txns.push(...txnId)
    setTxnIds(txns)
  }

  const updateProgressStep = () => {
    const p = progressStep + 1
    setProgressStep(p)
  }

  const getStepName = (name?: string) => {
    return `Executing step: ${name ?? currentStep}`
  }

  const getTxnName = (name?: string) => {
    return `Transaction: ${name ?? currentTxn}`
  }

  const executeSequential = async (txn: NamedTransaction[]) => {
    for (const [index, tx] of txn.entries()) {
      setTxnName(getTxnName(tx.name))
      setCurrentTxn(index)
      // await _simulateTransaction(tx.transaction)
      const { txid: txId } = await sendSignedTransaction({
        signedTransaction: tx.transaction,
        connection: connection.current,
      })
      pushTxn(txId)
      if (onSend) onSend(txId)
    }
  }

  const executeParallel = async (txn: NamedTransaction[]) => {
    const promises: Promise<{ txid: string; slot: number }>[] = []
    const names = txn.map((t) => t.name)
    setTxnName(names.join(', ') + ' in parallel')

    txn.forEach((tx) => {
      promises.push(
        new Promise(async (resolve) => {
          await _simulateTransaction(tx.transaction),
            resolve(
              sendSignedTransaction({
                connection: connection.current,
                signedTransaction: tx.transaction,
              })
            )
        })
      )
    })

    if (promises.length) {
      const txIds = await Promise.all(promises)
      // setProgressStep(progressStep + txn.transactions.length)
      pushTxn(...txIds.map((t) => t.txid))
      if (onSendParallel) onSendParallel(txIds.map((t) => t.txid))
    }
  }

  const calcProgressSteps = () => {
    let maxSteps = 0
    transactions.forEach((t) => {
      maxSteps += t.transactions.length
    })
    setProgressMaxSteps(maxSteps)
  }

  const _simulateTransaction = async (signedTransaction: Transaction) => {
    let simulateResult: SimulatedTransactionResponse | null = null
    try {
      simulateResult = (
        await simulateTransaction(
          connection.current,
          signedTransaction,
          'single'
        )
      ).value
    } catch (e) {
      // throw e
    }
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        simulateResult.logs.forEach((line) => {
          const keyoword = 'Program log: '
          if (line.startsWith(keyoword)) {
            throw new Error(
              'Transaction failed: ' + line.slice(keyoword.length)
            )
          }
        })
        throw new Error(JSON.stringify(simulateResult.err))
      }
    }
  }

  const signTransactions = async (): Promise<TransactionFlow[]> => {
    if (!wallet?.publicKey) throw new WalletNotConnectedError()
    const unsigned: Transaction[] = []
    const sliceMap: number[] = []

    transactions.forEach((txn) => {
      unsigned.push(...txn.transactions.map((t) => t.transaction))
      sliceMap.push(txn.transactions.length)
    })
    setStepName('Waiting for signature')
    console.debug(unsigned[0])
    const signed = await wallet.signAllTransactions(unsigned)
    console.debug(signed[0])

    const txnArr = sliceMap.map((count, index) => {
      const sliced = signed.slice(index, index + count)
      const { name, sequenceType, opts } = transactions[index]
      return {
        name,
        sequenceType,
        opts,
        transactions: transactions[index].transactions.map((t, i) => {
          const nt = t.rebuild(sliced[i])
          return nt
        }),
      } as TransactionFlow
    })

    return txnArr
  }

  const sendTransactions = async () => {
    try {
      const signedTxn = await signTransactions()

      for (const [index, tf] of signedTxn.entries()) {
        setStepName(getStepName(tf.name))
        setCurrentStep(index)
        const handler: (txn: NamedTransaction[]) => Promise<void> =
          tf.sequenceType === SequenceType.Parallel
            ? executeParallel
            : executeSequential
        await handler(tf.transactions)
      }
      if (onFinish) {
        console.log('came to onFinish')
        setFinished(true)
        onFinish(txnIds)
      }
      // if (onError) onError(new Error('Avoided'))
    } catch (error) {
      console.log('came to error')
      if (onError) onError(error)
    } finally {
      if (onFinally) onFinally()
    }
  }

  useEffect(() => {
    if (transactions.length) {
      calcProgressSteps()
      sendTransactions()
    }
  }, [transactions])

  useEffect(() => {
    setProgressStep(progressStep + 1)
  }, [txnName, finished])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h3
        className={textClass}
        style={{ textAlign: 'center', marginBottom: '1rem' }}
      >
        {finished ? (
          <>Finished.</>
        ) : (
          <>
            {stepName}
            <br />
            {txnName}
          </>
        )}
      </h3>
      <div
        className={progressBarOuterClass}
        style={{
          height: '26px',
          position: 'relative',

          background: '#555',
          borderRadius: '25px',

          minWidth: '100px',
          width: '300px',
          overflow: 'hidden',
        }}
      >
        <span
          className={progressBarInnerClass}
          style={{
            height: '100%',
            position: 'absolute',
            left: 0,
            background: '#4BB543',
            width: (progressStep / progressMaxSteps) * 100 + '%',
            transition: 'ease-in-out 100ms',
          }}
        ></span>
      </div>
    </div>
  )
}

export default SendTransactionWidget
