import React, { FunctionComponent, useState } from 'react'

import {
  ChatMessageBody,
  ChatMessageBodyType,
  YesNoVote,
} from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import useWalletStore from '../stores/useWalletStore'
import useRealm from '../hooks/useRealm'
import { castVote } from '../actions/castVote'

import Button, { SecondaryButton } from './Button'
// import { notify } from '../utils/notifications'
import Loading from './Loading'
import Modal from './Modal'
import Input from './inputs/Input'
import Tooltip from './Tooltip'
import { TokenOwnerRecord } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { getProgramVersionForRealm } from '@models/registry/api'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'

interface VoteCommentModalProps {
  onClose: () => void
  isOpen: boolean
  vote: YesNoVote
  voterTokenRecord: ProgramAccount<TokenOwnerRecord>
}

const VoteCommentModal: FunctionComponent<VoteCommentModalProps> = ({
  onClose,
  isOpen,
  vote,
  voterTokenRecord,
}) => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const [submitting, setSubmitting] = useState(false)
  const [comment, setComment] = useState('')
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { fetchChatMessages } = useWalletStore((s) => s.actions)
  const { realm, realmInfo } = useRealm()
  const { refetchProposals } = useWalletStore((s) => s.actions)

  const submitVote = async (vote: YesNoVote) => {
    setSubmitting(true)
    const rpcContext = new RpcContext(
      proposal!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection.current,
      connection.endpoint
    )

    const msg = comment
      ? new ChatMessageBody({
          type: ChatMessageBodyType.Text,
          value: comment,
        })
      : undefined

    try {
      await castVote(
        rpcContext,
        realm!,
        proposal!,
        voterTokenRecord,
        vote,
        msg,
        client
      )
      await refetchProposals()
    } catch (ex) {
      //TODO: How do we present transaction errors to users? Just the notification?
      console.error("Can't cast vote", ex)
      onClose()
    } finally {
      setSubmitting(false)
      onClose()
    }

    fetchChatMessages(proposal!.pubkey)
  }

  const voteString = vote === YesNoVote.Yes ? 'Yes' : 'No'

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Confirm your vote</h2>

      <Tooltip content="This will be stored on-chain and displayed publically in the discussion on this proposal">
        <label className="border- mt-4 border-dashed border-fgd-3 inline-block leading-4 text-fgd-1 text-sm hover:cursor-help hover:border-b-0">
          Leave a comment
        </label>
        <span className="ml-1 text-xs text-fgd-3">(Optional)</span>
      </Tooltip>

      <Input
        className="mt-1.5"
        value={comment}
        type="text"
        onChange={(e) => setComment(e.target.value)}
        // placeholder={`Let the DAO know why you vote '${voteString}'`}
      />

      <div className="flex items-center justify-center mt-8">
        <SecondaryButton className="w-44 mr-4" onClick={onClose}>
          Cancel
        </SecondaryButton>

        <Button
          className="w-44 flex items-center justify-center"
          onClick={() => submitVote(vote)}
        >
          {submitting ? <Loading /> : <span>Vote {voteString}</span>}
        </Button>
      </div>
    </Modal>
  )
}

export default React.memo(VoteCommentModal)
