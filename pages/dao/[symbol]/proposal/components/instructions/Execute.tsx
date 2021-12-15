/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button from '@components/Button'
import { notify } from 'utils/notifications'
import Modal from '@components/Modal'
import { executeInstruction } from 'actions/executeInstruction'
import { ProposalInstruction } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'

type ExecuteInstructionProps = {
  onClose: () => void
  isOpen: boolean
  instruction: ParsedAccount<ProposalInstruction> | any
}

const ExecuteInstruction = ({
  onClose,
  isOpen,
  instruction,
}: ExecuteInstructionProps) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { realmInfo } = useRealm()

  const handleExecuteInstruction = async () => {
    try {
      if (proposal && realmInfo) {
        const rpcContext = new RpcContext(
          proposal.account.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        await executeInstruction(rpcContext, proposal, instruction)

        onClose()
      }
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not execute instruction.`,
      })

      console.log('error executing instruction', error)

      onClose()
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Execute instruction</h2>

      <p className="text-left mt-5 mb-8">Do you want to execute instruction?</p>

      <div className="flex items-center justify-center">
        <Button className="mx-2 w-44" onClick={onClose}>
          No
        </Button>

        <Button className="mx-2 w-44" onClick={handleExecuteInstruction}>
          Execute
        </Button>
      </div>
    </Modal>
  )
}

export default ExecuteInstruction
