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
// import { notify } from 'utils/notifications'
import Loading from '@components/Loading'
import Modal from '@components/Modal'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
import {
  getSignatoryRecordAddress,
  SignatoryRecord,
  TokenOwnerRecord,
} from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { signOffProposal } from 'actions/signOffProposal'
import { notify } from '@utils/notifications'
// import { useWalletSignatoryRecord } from '@hooks/useProposal'

interface SignOffProposalModalProps {
  onClose: () => void
  isOpen: boolean
  signatoryRecord?: ParsedAccount<SignatoryRecord>
}

const SignOffProposalModal: FunctionComponent<SignOffProposalModalProps> = ({
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

  const handleSignOffProposal = async () => {
    console.log('sign off proposal', proposal)

    try {
      await signOffProposal(rpcContext, proposal)

      console.log('action sign off')
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not sign off proposal.`,
        description: `Error: ${error}`,
      })

      onClose()

      console.log('error cancel', error)
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Sign off proposal</h2>

      <p className="text-left mt-5 mb-8">
        Do you want to sign off this proposal?
      </p>

      <Button className="mx-2 w-44" onClick={onClose}>
        Cancel
      </Button>
      <Button className="mx-2 w-44" onClick={handleSignOffProposal}>
        Sign off
      </Button>
    </Modal>
  )
}

export default React.memo(SignOffProposalModal)
