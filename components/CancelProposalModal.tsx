import React from 'react'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button, { SecondaryButton } from '@components/Button'
import { notify } from 'utils/notifications'
import Modal from '@components/Modal'
import { Proposal } from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { cancelProposal } from 'actions/cancelProposal'
import useProposal from '@hooks/useProposal'

type CancelProposalModalProps = {
  onClose: () => void
  isOpen: boolean
}

const CancelProposalModal = ({ onClose, isOpen }: CancelProposalModalProps) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const fetchProposal = useWalletStore((s) => s.actions.fetchProposal)
  const { realmInfo } = useRealm()
  const { proposal } = useProposal()

  const handleCancelProposal = async (
    proposal: ParsedAccount<Proposal> | undefined
  ) => {
    try {
      if (proposal && realmInfo) {
        const rpcContext = new RpcContext(
          proposal.account.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        await cancelProposal(rpcContext, proposal)

        onClose()

        await fetchProposal(proposal.pubkey)
      }
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not cancel proposal.`,
      })

      onClose()

      console.log('error cancelling proposal', error)
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Cancel proposal</h2>

      <p className="text-left mt-5 mb-8">
        Do you want to cancel this proposal?
      </p>

      <div className="flex items-center justify-center">
        <SecondaryButton className="w-44 mr-4" onClick={onClose}>
          No
        </SecondaryButton>

        <Button className="w-44" onClick={() => handleCancelProposal(proposal)}>
          Yes, cancel
        </Button>
      </div>
    </Modal>
  )
}

export default CancelProposalModal
