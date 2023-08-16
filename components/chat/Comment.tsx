import {
  getTokenOwnerRecordAddress,
  getVoteRecordAddress,
  GovernanceAccountType,
  VoteType
} from '@solana/spl-governance'
import { ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/solid'
import { ExternalLinkIcon } from '@heroicons/react/solid'
import { ChatMessage } from '@solana/spl-governance'
import { abbreviateAddress, fmtTokenAmount } from '../../utils/formatting'
import useRealm from '../../hooks/useRealm'
import { isPublicKey } from '@tools/core/pubkey'
import { getVoteWeight, isYesVote } from '@models/voteRecords'
import dayjs from 'dayjs'
import { ProfilePopup, ProfileImage, useProfile } from '@components/Profile'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useAsync } from 'react-async-hook'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import { useVoteRecordByPubkeyQuery } from '@hooks/queries/voteRecord'

const relativeTime = require('dayjs/plugin/relativeTime')
const Comment = ({ chatMessage }: { chatMessage: ChatMessage }) => {
  dayjs.extend(relativeTime)
  const { author, postedAt, body } = chatMessage
  const { realmInfo } = useRealm()
  const { profile } = useProfile(author)
  const voteSymbol = !realmInfo
    ? ''
    : realmInfo.voteSymbol
    ? realmInfo.voteSymbol
    : isPublicKey(realmInfo.symbol)
    ? realmInfo.displayName
    : realmInfo.symbol

  //@ts-ignore
  const fromNow = dayjs(postedAt.toNumber() * 1000).fromNow()

  const proposal = useRouteProposalQuery().data?.result
  const proposalMint = useMintInfoByPubkeyQuery(
    proposal?.account.governingTokenMint
  ).data?.result

  const realmPk = useSelectedRealmPubkey()

  const { result: voteRecordPk } = useAsync(async () => {
    if (!proposal || !realmPk) return undefined
    const tokenPk = proposal.account.governingTokenMint
    const torPk = await getTokenOwnerRecordAddress(
      proposal.owner,
      realmPk,
      tokenPk,
      author
    )
    return getVoteRecordAddress(proposal.owner, proposal.pubkey, torPk)
  }, [proposal, realmPk, author])
  const voteRecord = useVoteRecordByPubkeyQuery(voteRecordPk).data?.result
    ?.account

  const isMulti = proposal?.account.voteType !== VoteType.SINGLE_CHOICE
    && proposal?.account.accountType === GovernanceAccountType.ProposalV2
    
  return (
    <div className="border-b border-fgd-4 mt-4 pb-4 last:pb-0 last:border-b-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-10 rounded-full w-10">
            <ProfilePopup publicKey={author} expanded={true}>
              <ProfileImage publicKey={author} className="h-8 text-fgd-3 w-8" />
            </ProfilePopup>
          </div>
          <div className="mx-3">
            <div className="flex items-center hover:brightness-[1.15] focus:outline-none">
              <a
                className="flex items-center hover:brightness-[1.15] focus:outline-none"
                href={`https://explorer.solana.com/address/${author.toString()}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="whitespace-nowrap">
                  {profile?.name?.value || abbreviateAddress(author)}
                </span>
                <ExternalLinkIcon
                  className={`flex-shrink-0 h-4 w-4 ml-1.5 text-primary-light`}
                />
              </a>
              {profile?.exists && (
                <ProfilePopup publicKey={author} expanded={true} />
              )}
            </div>
            <div className="text-fgd-3 text-xs">{fromNow}</div>
          </div>
        </div>
        {voteRecord && (
          <div className="bg-bkg-3 hidden lg:flex lg:items-center px-4 py-2 rounded-full">
            <div className="flex items-center pr-2 text-fgd-1 text-xs">
              {isYesVote(voteRecord) ? (
                <ThumbUpIcon className="h-4 mr-2 fill-[#8EFFDD] w-4" />
              ) : (
                <ThumbDownIcon className="h-4 mr-2 fill-[#FF7C7C] w-4" />
              )}
              {isYesVote(voteRecord) ? isMulti ? 'Voted' : 'Yes' : 'No'}
            </div>
            <span className="text-fgd-4">|</span>
            <span className="pl-2 text-xs">
              {`${fmtTokenAmount(
                getVoteWeight(voteRecord)!,
                proposalMint?.decimals
              ).toLocaleString()} ${voteSymbol}`}
            </span>
          </div>
        )}
      </div>
      <p>{body.value}</p>
    </div>
  )
}

export default Comment
