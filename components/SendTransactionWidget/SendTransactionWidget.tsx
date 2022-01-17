import React, { FunctionComponent, useEffect, useState } from 'react'
import { SequenceType } from '@utils/sendTransactions'
import NamedTransaction from './class/NamedTransaction'
import { TransactionFlow } from './model/NamedTransaction'
import { SendTransactionOptions } from '@solana/wallet-adapter-base'
import { sendTransaction } from '@utils/send'
import useWalletStore from 'stores/useWalletStore'

interface ProgressBarProps {
  progressBarOuterClass?: string
  progressBarInnerClass?: string
  textClass?: string
  /**
   * The promise listener that the send transaction method should return.
   */
  transactions: TransactionFlow[]
  /**
   * When the progress is finished, this callback will be triggered with 2s delay
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

  const [hasError, setHasError] = useState<Error>()

  const pushTxn = (...txnId: string[]) => {
    const txns = txnIds
    txns.push(...txnId)
    setTxnIds(txns)
  }

  const getStepName = (name?: string) => {
    return `Executing step ${name ?? currentStep}`
  }

  const executeSequential = async (txn: TransactionFlow) => {
    for (const [index, tx] of txn.transactions.entries()) {
      setCurrentTxn(index)
      setTxnName(tx.name)
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
    txn.transactions.forEach((tx) => {
      promises.push(
        sendTransaction({
          connection: connection.current,
          transaction: tx,
          wallet,
        })
      )
    })
    if (promises.length) {
      const txIds = await Promise.all(promises)
      pushTxn(...txIds)
      if (onSendParallel) onSendParallel(txIds)
    }
  }

  const sendTransactions = async () => {
    try {
      for (const [index, tf] of transactions.entries()) {
        setStepName(getStepName(tf.name))
        setCurrentStep(index)

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
            width: (currentTxn / txnLen) * 100 + '%',
            transition: 'ease-in-out 100ms',
          }}
        ></span>
      </div>
    </div>
  )
}

export default SendTransactionWidget
