import { useState } from 'react'
import Button from '../Button'
import Input from '../inputs/Input'
import useRealm from '../../hooks/useRealm'
import { RpcContext } from '@solana/spl-governance'
import { ChatMessageBody, ChatMessageBodyType } from '@solana/spl-governance'
import { postChatMessage } from '../../actions/chat/postMessage'
import Loading from '../Loading'
import Tooltip from '@components/Tooltip'
import { getProgramVersionForRealm } from '@models/registry/api'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { useVotingPop } from '@components/VotePanel/hooks'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { useLegacyVoterWeight } from '@hooks/queries/governancePower'

const DiscussionForm = () => {
  const [comment, setComment] = useState('')
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const { result: ownVoterWeight } = useLegacyVoterWeight()
  const { realmInfo } = useRealm()
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const [submitting, setSubmitting] = useState(false)

  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const connection = useLegacyConnectionContext()
  const proposal = useRouteProposalQuery().data?.result
  const tokenRole = useVotingPop()
  const commenterVoterTokenRecord =
    tokenRole === 'community' ? ownTokenRecord : ownCouncilTokenRecord

  const submitComment = async () => {
    setSubmitting(true)
    if (
      !realm ||
      !proposal ||
      !commenterVoterTokenRecord ||
      !wallet ||
      !realmInfo
    )
      throw new Error()

    const rpcContext = new RpcContext(
      proposal.owner,
      getProgramVersionForRealm(realmInfo),
      wallet,
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
        realm,
        proposal,
        commenterVoterTokenRecord,
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
  }

  const postEnabled =
    proposal && connected && ownVoterWeight?.hasAnyWeight() && comment

  const tooltipContent = !connected
    ? 'Connect your wallet to send a comment'
    : !ownVoterWeight?.hasAnyWeight()
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
