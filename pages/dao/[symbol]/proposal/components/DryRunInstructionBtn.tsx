import Button, { LinkButton, SecondaryButton } from '@components/Button'
import { getExplorerInspectorUrl } from '@components/explorer/tools'
import Loading from '@components/Loading'
import Modal from '@components/Modal'
import { getInstructionDataFromBase64 } from '@solana/spl-governance'
import { SimulatedTransactionResponse, Transaction } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { dryRunInstruction } from 'actions/dryRunInstruction'
import React, { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

const DryRunInstructionBtn = ({
  getInstructionDataFcn,
  btnClassNames,
}: {
  getInstructionDataFcn: (() => Promise<UiInstruction>) | undefined
  btnClassNames: string
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<{
    response: SimulatedTransactionResponse
    transaction: Transaction
  } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const onInspect = async () => {
    if (result) {
      const inspectUrl = await getExplorerInspectorUrl(
        connection,
        result.transaction
      )
      window.open(inspectUrl, '_blank')
    } else {
      notify({ type: 'error', message: 'no results to inspect' })
    }
  }
  const handleDryRun = async () => {
    try {
      if (!getInstructionDataFcn) {
        throw 'No get instructionDataFcn provided'
      }
      setIsPending(true)
      const instructionData = await getInstructionDataFcn()
      const prerequisiteInstructionsToRun =
        instructionData.prerequisiteInstructions
      const additionalInstructions =
        instructionData.additionalSerializedInstructions
      if (!instructionData?.isValid) {
        setIsPending(false)
        throw new Error('Invalid instruction')
      }
      const result = await dryRunInstruction(
        connection.current,
        wallet!,
        instructionData?.serializedInstruction
          ? getInstructionDataFromBase64(instructionData?.serializedInstruction)
          : null,
        prerequisiteInstructionsToRun,
        additionalInstructions?.map((x) => getInstructionDataFromBase64(x))
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
        small
      >
        {isPending ? <Loading></Loading> : 'Preview transaction'}
      </SecondaryButton>

      {result?.response && (
        <Modal sizeClassName={'sm:max-w-2xl'} onClose={onClose} isOpen={isOpen}>
          <h2>
            {result?.response.err
              ? 'Simulation error'
              : 'Simulation successful'}
          </h2>
          <ul className="break-all instruction-log-list text-sm">
            {result?.response.logs?.map((log, i) => (
              <li className="mb-3" key={i}>
                <div className={getLogTextType(log)}>{log}</div>
              </li>
            ))}
          </ul>
          <div className="flex items-center pt-3">
            <Button onClick={onInspect}>Inspect</Button>
            <LinkButton className="font-bold ml-4" onClick={onClose}>
              Close
            </LinkButton>
          </div>
        </Modal>
      )}
    </>
  )
}

export default DryRunInstructionBtn
