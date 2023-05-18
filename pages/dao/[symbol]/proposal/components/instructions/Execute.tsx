import React from 'react'
import { RpcContext } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button, { SecondaryButton } from '@components/Button'
import { notify } from 'utils/notifications'
import Modal from '@components/Modal'
import { executeTransaction } from 'actions/executeTransaction'
import { ProposalTransaction } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { getProgramVersionForRealm } from '@models/registry/api'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRouteProposalQuery } from '@hooks/queries/proposal'

type ExecuteInstructionProps = {
  onClose: () => void
  isOpen: boolean
  instruction: ProgramAccount<ProposalTransaction> | any
}

const ExecuteInstruction = ({
  onClose,
  isOpen,
  instruction,
}: ExecuteInstructionProps) => {
  const wallet = useWalletOnePointOh()
  const connection = useWalletStore((s) => s.connection)
  const proposal = useRouteProposalQuery().data?.result
  const { realmInfo } = useRealm()

  const handleExecuteInstruction = async () => {
    try {
      if (proposal && realmInfo) {
        const rpcContext = new RpcContext(
          proposal.owner,
          getProgramVersionForRealm(realmInfo),
          wallet!,
          connection.current,
          connection.endpoint
        )

        await executeTransaction(rpcContext, proposal, instruction)

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
        <SecondaryButton className="w-44 mr-4" onClick={onClose}>
          No
        </SecondaryButton>

        <Button className="mx-2 w-44" onClick={handleExecuteInstruction}>
          Execute
        </Button>
      </div>
    </Modal>
  )
}

export default ExecuteInstruction
