import React, { FunctionComponent, useState } from 'react'
import { BanIcon, ThumbDownIcon, ThumbUpIcon } from '@heroicons/react/solid'
import {
  ChatMessageBody,
  ChatMessageBodyType,
  VoteKind,
} from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
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
import { nftPluginsPks } from '@hooks/useVotingPlugins'
import useNftProposalStore from 'NftVotePlugin/NftProposalStore'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import queryClient from '@hooks/queries/queryClient'
import { voteRecordQueryKeys } from '@hooks/queries/voteRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

interface VoteCommentModalProps {
  onClose: () => void
  isOpen: boolean
  vote: VoteKind
  voterTokenRecord: ProgramAccount<TokenOwnerRecord>
}

const useSubmitVote = ({
  comment,
  onClose,
  voterTokenRecord,
}: {
  comment: string
  onClose: () => void
  voterTokenRecord: ProgramAccount<TokenOwnerRecord>
}) => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const [submitting, setSubmitting] = useState(false)
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const proposal = useRouteProposalQuery().data?.result
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result

  const { realmInfo } = useRealm()
  const isNftPlugin =
    config?.account.communityTokenConfig.voterWeightAddin &&
    nftPluginsPks.includes(
      config?.account.communityTokenConfig.voterWeightAddin?.toBase58()
    )
  const { closeNftVotingCountingModal } = useNftProposalStore.getState()
  const submitVote = async (vote: VoteKind) => {
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

    const confirmationCallback = async () => {
      await queryClient.invalidateQueries(
        voteRecordQueryKeys.all(connection.cluster)
      )
    }

    try {
      await castVote(
        rpcContext,
        realm!,
        proposal!,
        voterTokenRecord,
        vote,
        msg,
        client,
        confirmationCallback
      )
    } catch (ex) {
      if (isNftPlugin) {
        closeNftVotingCountingModal(
          (client.client as unknown) as NftVoterClient,
          proposal!,
          wallet!.publicKey!
        )
      }
      //TODO: How do we present transaction errors to users? Just the notification?
      console.error("Can't cast vote", ex)
      onClose()
    } finally {
      setSubmitting(false)
      onClose()
    }
  }

  return { submitting, submitVote }
}

const VOTE_STRINGS = {
  [VoteKind.Approve]: 'Yes',
  [VoteKind.Deny]: 'No',
  [VoteKind.Veto]: 'Veto',
  [VoteKind.Abstain]: 'Abstain',
}

const VoteCommentModal: FunctionComponent<VoteCommentModalProps> = ({
  onClose,
  isOpen,
  vote,
  voterTokenRecord,
}) => {
  const [comment, setComment] = useState('')
  const { submitting, submitVote } = useSubmitVote({
    comment,
    onClose,
    voterTokenRecord,
  })

  const voteString = VOTE_STRINGS[vote]

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
          <div className="flex items-center">
            {!submitting &&
              (vote === VoteKind.Approve ? (
                <ThumbUpIcon className="h-4 w-4 fill-black mr-2" />
              ) : vote === VoteKind.Deny ? (
                <ThumbDownIcon className="h-4 w-4 fill-black mr-2" />
              ) : (
                <BanIcon className="h-4 w-4 fill-black mr-2" />
              ))}
            {submitting ? <Loading /> : <span>Vote {voteString}</span>}
          </div>
        </Button>
      </div>
    </Modal>
  )
}

export default React.memo(VoteCommentModal)
