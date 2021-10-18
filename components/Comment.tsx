import moment from 'moment'
import React from 'react'
import { VoteRecord } from '../models/accounts'
import {
  CheckCircleIcon,
  UserCircleIcon,
  XCircleIcon,
} from '@heroicons/react/solid'
import { ExternalLinkIcon } from '@heroicons/react/solid'
import { ChatMessage } from '../models/chat/accounts'
import { abbreviateAddress, fmtTokenAmount } from '../utils/formatting'
import useRealm from '../hooks/useRealm'

const Comment = ({
  chatMessage,
  voteRecord,
}: {
  chatMessage: ChatMessage
  voteRecord: VoteRecord | undefined
}) => {
  const { author, postedAt, body } = chatMessage
  const { mint, symbol } = useRealm()

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
            <div className="text-fgd-3 text-xs">
              {moment.unix(postedAt.toNumber()).fromNow()}
            </div>
          </div>
        </div>
        {voteRecord && (
          <div className="bg-bkg-2 hidden lg:flex lg:items-center px-4 py-2 rounded-full">
            <div className="flex items-center pr-2 text-fgd-1 text-xs">
              {voteRecord.isYes() ? (
                <CheckCircleIcon className="h-5 mr-1 text-green w-5" />
              ) : (
                <XCircleIcon className="h-5 mr-1 text-red w-5" />
              )}
              {voteRecord.isYes() ? 'Approve' : 'Deny'}
            </div>
            <span className="text-fgd-4">|</span>
            <span className="pl-2 text-xs">
              {`${fmtTokenAmount(
                voteRecord.getVoteWeight(),
                mint?.decimals
              ).toLocaleString()} ${symbol}`}
            </span>
          </div>
        )}
      </div>
      <p>{body.value}</p>
    </div>
  )
}

export default Comment
