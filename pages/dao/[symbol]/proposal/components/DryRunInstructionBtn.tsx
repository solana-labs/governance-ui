/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Button, { LinkButton, SecondaryButton } from '@components/Button'
import { getExplorerInspectorUrl } from '@components/explorer/tools'
import Loading from '@components/Loading'
import Modal from '@components/Modal'
import { getInstructionDataFromBase64 } from '@models/serialisation'
import { SimulatedTransactionResponse, Transaction } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { dryRunInstruction } from 'actions/dryRunInstruction'
import React, { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

const DryRunInstructionBtn = ({ getInstructionDataFcn, btnClassNames }) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<{
    response: SimulatedTransactionResponse
    transaction: Transaction
  } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const onInspect = () => {
    if (result) {
      const inspectUrl = getExplorerInspectorUrl(
        connection.endpoint,
        result.transaction
      )
      window.open(inspectUrl, '_blank')
    } else {
      notify({ type: 'error', message: 'no results to inspect' })
    }
  }
  const handleDryRun = async () => {
    try {
      setIsPending(true)
      const instructionData = await getInstructionDataFcn()
      if (!instructionData.isValid) {
        setIsPending(false)
        throw new Error('Invalid instruction')
      }
      const result = await dryRunInstruction(
        connection.current,
        wallet!,
        getInstructionDataFromBase64(instructionData.serializedInstruction)
      )
      setResult(result)
      setIsOpen(true)
    } catch (ex) {
      notify({
        type: 'error',
        message: `Can't simulate transaction`,
        description: 'The instruction is invalid',
      })
      console.error('Simulation error', ex)
    } finally {
      setIsPending(false)
    }
  }
  const onClose = () => {
    setIsOpen(false)
    setResult(null)
  }
  function getLogTextType(text: string) {
    // Use some heuristics to highlight  error and success log messages

    text = text.toLowerCase()

    if (text.includes('failed')) {
      return 'text-red'
    }

    if (text.includes('success')) {
      return 'text-green'
    }
  }
  return (
    <>
      <SecondaryButton
        className={btnClassNames}
        onClick={handleDryRun}
        disabled={isPending || !wallet?.connected}
      >
        {isPending ? <Loading></Loading> : 'Run simulation'}
      </SecondaryButton>

      {result?.response && (
        <Modal onClose={onClose} isOpen={isOpen}>
          <h2>
            {result?.response.err
              ? 'Simulation returned an error'
              : 'Simulation ran successfully'}
          </h2>
          <ul className="instruction-log-list">
            {result?.response.logs?.map((log, i) => (
              <li key={i}>
                <div className={getLogTextType(log)}>{log}</div>
              </li>
            ))}
          </ul>
          <div className="flex items-center pt-6">
            <Button onClick={onInspect}>Inspect</Button>
            <LinkButton className="ml-4 text-th-fgd-1" onClick={onClose}>
              Close
            </LinkButton>
          </div>
        </Modal>
      )}
    </>
  )
}

export default DryRunInstructionBtn
