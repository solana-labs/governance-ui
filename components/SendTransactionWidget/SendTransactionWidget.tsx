import React, { FunctionComponent, useEffect, useState } from 'react'
import { SequenceType } from '@utils/sendTransactions'
import { TransactionFlow } from './model/NamedTransaction'
import { sendTransaction } from '@utils/send'
import useWalletStore from 'stores/useWalletStore'
import { SimulatedTransactionResponse, Transaction } from '@solana/web3.js'
import { simulateTransaction } from '@solana/spl-governance'

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

  const [stepName, setStepName] = useState('')
  const [currentStep, setCurrentStep] = useState(-1)

  const [progressMaxSteps, setProgressMaxSteps] = useState<number>(1)
  const [progressStep, setProgressStep] = useState<number>(0)

  const pushTxn = (...txnId: string[]) => {
    const txns = txnIds
    txns.push(...txnId)
    setTxnIds(txns)
  }

  const getStepName = (name?: string) => {
    return `Executing step ${name ?? currentStep}`
  }

  const getTxnName = (name?: string) => {
    return `Transaction ${name ?? currentTxn}`
  }

  const executeSequential = async (txn: TransactionFlow) => {
    for (const [index, tx] of txn.transactions.entries()) {
      setTxnName(getTxnName(tx.name))
      setCurrentTxn(index)
      await _simulateTransaction(tx)
      const txId = await sendTransaction({
        connection: connection.current,
        transaction: tx,
        wallet,
      })
      pushTxn(txId)
      if (onSend) onSend(txId)
    }
  }

  const executeParallel = async (txn: TransactionFlow) => {
    const promises: Promise<string>[] = []
    const names = txn.transactions.map((t) => t.name)
    setTxnName(names.join(', ') + ' in parallel')

    txn.transactions.forEach((tx) => {
      promises.push(
        new Promise(async (resolve) => {
          await _simulateTransaction(tx),
            resolve(
              sendTransaction({
                connection: connection.current,
                transaction: tx,
                wallet,
              })
            )
        })
      )
    })

    if (promises.length) {
      const txIds = await Promise.all(promises)
      pushTxn(...txIds)
      if (onSendParallel) onSendParallel(txIds)
    }
  }

  const calcProgressSteps = () => {
    let maxSteps = transactions.length
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
      //
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

  const sendTransactions = async () => {
    try {
      for (const [index, tf] of transactions.entries()) {
        setStepName(getStepName(tf.name))
        setCurrentStep(index)
        setProgressStep(progressStep + 1)
        const handler: (txn: TransactionFlow) => Promise<void> =
          tf.sequenceType === SequenceType.Parallel
            ? executeParallel
            : executeSequential
        await handler(tf)
      }
      if (onFinish) onFinish(txnIds)
    } catch (error) {
      if (onError) onError(error)
    } finally {
      if (onFinally) onFinally()
    }
  }

  useEffect(() => {
    calcProgressSteps()
    sendTransactions()
  }, [])

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
        {stepName}
        <br />
        {txnName}
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
