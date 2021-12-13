/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FunctionComponent } from 'react'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button from '@components/Button'
import { notify } from 'utils/notifications'
import Modal from '@components/Modal'
import { finalizeVote } from 'actions/finalizeVotes'

interface FinalizeVotesModalProps {
  onClose: () => void
  isOpen: boolean
}

const FinalizeVotesModal: FunctionComponent<FinalizeVotesModalProps> = ({
  onClose,
  isOpen,
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { realmInfo } = useRealm()

  const rpcContext = new RpcContext(
    proposal!.account.owner,
    realmInfo?.programVersion,
    wallet,
    connection.current,
    connection.endpoint
  )

  const handleFinalizeVote = async () => {
    console.log('proposal and rpc context', proposal, rpcContext)

    // Error: Error: Transaction failed: Error: NotEnoughAccountKeys
    //4: "Program GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw failed: insufficient account keys for instruction"

    try {
      await finalizeVote(rpcContext, realmInfo!.realmId, proposal!)
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not finalize vote.`,
        description: `Error: ${error}`,
      })

      onClose()

      console.log('error cancel', error)
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Finalize votes</h2>

      <p className="text-left mt-5 mb-8">Do you want to finalize vote?</p>

      <Button className="mx-2 w-44" onClick={onClose}>
        No
      </Button>

      <Button className="mx-2 w-44" onClick={handleFinalizeVote}>
        Finalize
      </Button>
    </Modal>
  )
}

export default React.memo(FinalizeVotesModal)
