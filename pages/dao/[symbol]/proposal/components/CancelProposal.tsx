/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FunctionComponent } from 'react'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button from '@components/Button'
import { notify } from 'utils/notifications'
import Modal from '@components/Modal'
import { Proposal } from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { cancelProposal } from 'actions/cancelProposal'
import useProposal from '@hooks/useProposal'

interface CancelProposalModalProps {
  onClose: () => void
  isOpen: boolean
}

const CancelProposalModal: FunctionComponent<CancelProposalModalProps> = ({
  onClose,
  isOpen,
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()

  const { proposal } = useProposal()

  const rpcContext = new RpcContext(
    proposal!.account.owner,
    realmInfo?.programVersion,
    wallet,
    connection.current,
    connection.endpoint
  )

  const handleCancelProposal = async (
    proposal: ParsedAccount<Proposal> | undefined
  ) => {
    console.log('proposal and rpc context', proposal)

    try {
      await cancelProposal(rpcContext, proposal)
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not cancel proposal.`,
        description: `${error}`,
      })

      onClose()

      console.log('error cancel', error)
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Cancel proposal</h2>

      <p className="text-left mt-5 mb-8">
        Do you want to cancel this proposal?
      </p>

      <Button className="mx-2 w-44" onClick={onClose}>
        No
      </Button>

      <Button
        className="mx-2 w-44"
        onClick={() => handleCancelProposal(proposal)}
      >
        Yes, cancel
      </Button>
    </Modal>
  )
}

export default React.memo(CancelProposalModal)
