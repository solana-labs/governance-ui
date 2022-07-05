import {
  Proposal,
  ProgramAccount,
  VoteRecord,
  Realm,
} from '@solana/spl-governance'
import classNames from 'classnames'
import { ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/solid'

import { isYesVote } from '@models/voteRecords'
import useRealm from '@hooks/useRealm'
import useWalletStore from '../stores/useWalletStore'

interface VoteRecords {
  [proposal: string]: ProgramAccount<VoteRecord>
}

function getOwnVoteRecord(
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
  const { realm } = useRealm()
  const communityDelegateVoteRecords = useWalletStore(
    (s) => s.communityDelegateVoteRecordsByProposal
  )
  const councilDelegateVoteRecords = useWalletStore(
    (s) => s.councilDelegateVoteRecordsByProposal
  )
  const ownVoteRecords = useWalletStore((s) => s.ownVoteRecordsByProposal)

  const ownVoteRecord = getOwnVoteRecord(
    communityDelegateVoteRecords,
    councilDelegateVoteRecords,
    ownVoteRecords,
    props.proposal,
    realm
  )

  console.log(
    communityDelegateVoteRecords,
    councilDelegateVoteRecords,
    ownVoteRecords
  )

  if (!ownVoteRecord) {
    return null
  }

  return (
    <div
      className={classNames(
        props.className,
        'flex-row',
        'flex',
        'gap-1',
        'items-center',
        'opacity-70',
        'text-white',
        'text-xs'
      )}
    >
      My vote
      {isYesVote(ownVoteRecord.account) ? (
        <ThumbUpIcon className="w-4 h-4" />
      ) : (
        <ThumbDownIcon className="w-4 h-4" />
      )}
    </div>
  )
}
