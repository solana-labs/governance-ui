import { useState } from 'react'
import Button from '../Button'
import Input from '../inputs/Input'
import useWalletStore from '../../stores/useWalletStore'
import useRealm from '../../hooks/useRealm'
import { RpcContext, GovernanceTokenKind } from '@solana/spl-governance'
import { ChatMessageBody, ChatMessageBodyType } from '@solana/spl-governance'
import { postChatMessage } from '../../actions/chat/postMessage'
import Loading from '../Loading'
import Tooltip from '@components/Tooltip'
import { getProgramVersionForRealm } from '@models/registry/api'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'

const DiscussionForm = () => {
  const [comment, setComment] = useState('')
  const connected = useWalletStore((s) => s.connected)
  const {
    ownVoterWeight,
    realmInfo,
    realm,
    ownTokenRecord,
    ownCouncilTokenRecord,
  } = useRealm()
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const [submitting, setSubmitting] = useState(false)

  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { fetchChatMessages } = useWalletStore((s) => s.actions)
  const { tokenType } = useWalletStore((s) => s.selectedProposal)
  const commenterVoterTokenRecord =
    tokenType === GovernanceTokenKind.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord

  const submitComment = async () => {
    setSubmitting(true)

    const rpcContext = new RpcContext(
      proposal!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection.current,
      connection.endpoint
    )

    const msg = new ChatMessageBody({
      type: ChatMessageBodyType.Text,
      value: comment,
    })

    try {
      await postChatMessage(
        rpcContext,
        realm!,
        proposal!,
        commenterVoterTokenRecord!,
        msg,
        undefined,
        client
      )

      setComment('')
    } catch (ex) {
      console.error("Can't post chat message", ex)
      //TODO: How do we present transaction errors to users? Just the notification?
    } finally {
      setSubmitting(false)
    }

    fetchChatMessages(proposal!.pubkey)
  }

  const postEnabled =
    proposal && connected && ownVoterWeight.hasAnyWeight() && comment

  const tooltipContent = !connected
    ? 'Connect your wallet to send a comment'
    : !ownVoterWeight.hasAnyWeight()
    ? 'You need to have deposited some tokens to submit your comment.'
    : !comment
    ? 'Write a comment to submit'
    : !commenterVoterTokenRecord
    ? 'You need to have voting power for this community to submit your comment.'
    : ''

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        <Input
          value={comment}
          type="text"
          onChange={(e) => setComment(e.target.value)}
          placeholder="Thoughts?..."
        />

        <Tooltip contentClassName="flex-shrink-0" content={tooltipContent}>
          <Button
            className="flex-shrink-0"
            onClick={() => submitComment()}
            disabled={!postEnabled || !comment || !commenterVoterTokenRecord}
          >
            {submitting ? <Loading /> : <span>Send It</span>}
          </Button>
        </Tooltip>
      </div>
    </>
  )
}

export default DiscussionForm
