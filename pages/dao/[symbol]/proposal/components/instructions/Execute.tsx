/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FunctionComponent } from 'react'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button from '@components/Button'
import { notify } from 'utils/notifications'
import Modal from '@components/Modal'
import { executeInstruction } from 'actions/executeInstruction'
import { ProposalInstruction } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'

interface ExecuteInstructionProps {
  onClose: () => void
  isOpen: boolean
  instruction: ParsedAccount<ProposalInstruction> | any
}

const ExecuteInstruction: FunctionComponent<ExecuteInstructionProps> = ({
  onClose,
  isOpen,
  instruction,
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal, instructions } = useWalletStore((s) => s.selectedProposal)
  const { realmInfo } = useRealm()

  const rpcContext = new RpcContext(
    proposal!.account.owner,
    realmInfo?.programVersion,
    wallet,
    connection.current,
    connection.endpoint
  )

  const handleExecuteInstruction = async () => {
    try {
      console.log('instructins account', instructions)
      await executeInstruction(rpcContext, proposal!, instruction)
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not execute instruction.`,
        description: `Error: ${error}`,
      })

      onClose()

      console.log('error executing', error)
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Execute instruction</h2>

      <p className="text-left mt-5 mb-8">Do you want to execute instruction?</p>

      <Button className="mx-2 w-44" onClick={onClose}>
        No
      </Button>

      <Button className="mx-2 w-44" onClick={handleExecuteInstruction}>
        Execute
      </Button>
    </Modal>
  )
}

export default React.memo(ExecuteInstruction)
