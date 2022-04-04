import React from 'react'
import { VoteRecord } from '@solana/spl-governance'
import {
  CheckCircleIcon,
  UserCircleIcon,
  XCircleIcon,
} from '@heroicons/react/solid'
import { ExternalLinkIcon } from '@heroicons/react/solid'
import { ChatMessage } from '@solana/spl-governance'
import { abbreviateAddress, fmtTokenAmount } from '../../utils/formatting'
import useRealm from '../../hooks/useRealm'
import { MintInfo } from '@solana/spl-token'
import { isPublicKey } from '@tools/core/pubkey'
import { getVoteWeight, isYesVote } from '@models/voteRecords'
import dayjs from 'dayjs'
const relativeTime = require('dayjs/plugin/relativeTime')
const Comment = ({
  chatMessage,
  voteRecord,
  proposalMint,
}: {
  chatMessage: ChatMessage
  voteRecord: VoteRecord | undefined
  proposalMint: MintInfo | undefined
}) => {
  dayjs.extend(relativeTime)
  const { author, postedAt, body } = chatMessage
  const { realmInfo } = useRealm()
  const voteSymbol = !realmInfo
    ? ''
    : isPublicKey(realmInfo.symbol)
    ? realmInfo.displayName
    : realmInfo.symbol
  //@ts-ignore
  const fromNow = dayjs(postedAt.toNumber() * 1000).fromNow()
  return (
    <div className="border-b border-fgd-4 mt-4 pb-4 last:pb-0 last:border-b-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-10 rounded-full w-10">
            <UserCircleIcon className="h-8 text-fgd-3 w-8" />
          </div>
          <div className="mx-3">
            <a
              className="flex items-center hover:brightness-[1.15] focus:outline-none"
              href={`https://explorer.solana.com/address/${author.toString()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="whitespace-nowrap">
                {abbreviateAddress(author)}
              </span>
              <ExternalLinkIcon
                className={`flex-shrink-0 h-4 w-4 ml-1.5 text-primary-light`}
              />
            </a>
            <div className="text-fgd-3 text-xs">{fromNow}</div>
          </div>
        </div>
        {voteRecord && (
          <div className="bg-bkg-3 hidden lg:flex lg:items-center px-4 py-2 rounded-full">
            <div className="flex items-center pr-2 text-fgd-1 text-xs">
              {isYesVote(voteRecord) ? (
                <CheckCircleIcon className="h-5 mr-1 text-green w-5" />
              ) : (
                <XCircleIcon className="h-5 mr-1 text-red w-5" />
              )}
              {isYesVote(voteRecord) ? 'Approve' : 'Deny'}
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
