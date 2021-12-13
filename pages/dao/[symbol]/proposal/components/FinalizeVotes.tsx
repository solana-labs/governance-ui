/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FunctionComponent, useState } from 'react'
import { postChatMessage } from 'actions/chat/postMessage'
import { ChatMessageBody, ChatMessageBodyType } from 'models/chat/accounts'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import { castVote } from 'actions/castVote'
import { Vote } from 'models/instructions'
import Button, { LinkButton } from '@components/Button'
import { notify } from 'utils/notifications'
import Loading from '@components/Loading'
import Modal from '@components/Modal'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
import { Proposal, TokenOwnerRecord } from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { finalizeVote } from 'actions/finalizeVotes'
import { PublicKey } from '@solana/web3.js'

interface FinalizeVotesModalProps {
  onClose: () => void
  isOpen: boolean
}

const FinalizeVotesModal: FunctionComponent<FinalizeVotesModalProps> = ({
  onClose,
  isOpen,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [comment, setComment] = useState('')
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { fetchChatMessages } = useWalletStore((s) => s.actions)
  const { fetchVoteRecords } = useWalletStore((s) => s.actions)
  const { realm, realmInfo } = useRealm()
  const { fetchRealm } = useWalletStore((s) => s.actions)

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
