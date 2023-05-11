import { useMemo } from 'react'
import {
  Proposal,
  ProgramAccount,
  VoteRecord,
  Realm,
} from '@solana/spl-governance'
import classNames from 'classnames'
import { ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/solid'
import { isYesVote } from '@models/voteRecords'
import useWalletStore from '../stores/useWalletStore'
import Tooltip from './Tooltip'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useAddressQuery_VoteRecord } from '@hooks/queries/addresses/voteRecord'
import { useAddressQuery_TokenOwnerRecord } from '@hooks/queries/addresses/tokenOwnerRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useVoteRecordByPubkeyQuery } from '@hooks/queries/voteRecord'

interface VoteRecords {
  [proposal: string]: ProgramAccount<VoteRecord>
}

export function getOwnVoteRecord(
  communityDelegateVoteRecords: VoteRecords,
  councilDelegateVoteRecords: VoteRecords,
  ownVoteRecords: VoteRecords,
  proposal: Omit<ProgramAccount<Proposal>, 'owner'>,
  realm?: ProgramAccount<Realm>
): ProgramAccount<VoteRecord> | undefined {
  const proposalKey = proposal.pubkey.toBase58()
  const councilDelegateVote = councilDelegateVoteRecords[proposalKey]
  const communityDelegateVote = communityDelegateVoteRecords[proposalKey]
  const ownRecord = ownVoteRecords[proposalKey]
  const governingTokenMint = proposal.account.governingTokenMint.toBase58()

  if (
    councilDelegateVote &&
    governingTokenMint === realm?.account?.config?.councilMint?.toBase58()
  ) {
    return councilDelegateVote
  }

  if (
    communityDelegateVote &&
    governingTokenMint === realm?.account?.communityMint.toBase58()
  ) {
    return communityDelegateVote
  }

  return ownRecord
}

interface Props {
  className?: string
  proposal: Omit<ProgramAccount<Proposal>, 'owner'>
}

export default function ProposalMyVoteBadge(props: Props) {
  const realm = useRealmQuery().data?.result
  const wallet = useWalletOnePointOh()

  const { data: tokenOwnerRecordPk } = useAddressQuery_TokenOwnerRecord(
    realm?.owner,
    realm?.pubkey,
    props.proposal.account.governingTokenMint,
    wallet?.publicKey ?? undefined
  )
  const { data: voteRecordPk } = useAddressQuery_VoteRecord(
    realm?.owner,
    props.proposal.pubkey,
    tokenOwnerRecordPk
  )
  const { data: ownVoteRecord } = useVoteRecordByPubkeyQuery(voteRecordPk)

  if (!ownVoteRecord?.result?.account) {
    return null
  }

  const isYes = isYesVote(ownVoteRecord?.result?.account)
  return (
    <Tooltip content={isYes ? 'You voted "Yes"' : 'You voted "No"'}>
      <div
        className={classNames(
          props.className,
          'border',
          'rounded-full',
          'flex-row',
          'flex',
          'gap-1',
          'items-center',
          'p-[6px]',
          'text-white',
          'text-xs',
          isYes ? 'border-[#8EFFDD]' : 'border-[#FF7C7C]'
        )}
      >
        {isYes ? (
          <ThumbUpIcon className="w-3 h-3 fill-[#8EFFDD]" />
        ) : (
          <ThumbDownIcon className="w-3 h-3 fill-[#FF7C7C]" />
        )}
      </div>
    </Tooltip>
  )
}
