/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button from '@components/Button'
import { notify } from 'utils/notifications'
import Modal from '@components/Modal'
import { finalizeVote } from 'actions/finalizeVotes'

type FinalizeVotesModalProps = {
  onClose: () => void
  isOpen: boolean
}

const FinalizeVotesModal = ({ onClose, isOpen }: FinalizeVotesModalProps) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { realmInfo } = useRealm()

  const handleFinalizeVote = async () => {
    try {
      if (proposal && realmInfo) {
        const rpcContext = new RpcContext(
          proposal.account.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        await finalizeVote(rpcContext, realmInfo.realmId, proposal!)

        onClose()
      }
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not finalize vote.`,
      })

      onClose()

      console.log('error finalizing vote', error)
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Finalize votes</h2>

      <p className="text-left mt-5 mb-8">Do you want to finalize vote?</p>

      <div className="flex items-center justify-center">
        <Button className="w-44 mr-4" onClick={onClose}>
          No
        </Button>

        <Button className="w-44" onClick={handleFinalizeVote}>
          Finalize
        </Button>
      </div>
    </Modal>
  )
}

export default FinalizeVotesModal
