import { DisplayAddress } from '@cardinal/namespaces-components'
import { getExplorerUrl } from '@components/explorer/tools'
import {
  ChatAltIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  LogoutIcon,
  XCircleIcon,
} from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { getVoteRecordsByVoterMapByProposal } from '@models/api'
import { isYesVote } from '@models/voteRecords'
import { GOVERNANCE_CHAT_PROGRAM_ID, VoteRecord } from '@solana/spl-governance'
import { ChatMessage, ProgramAccount } from '@solana/spl-governance'
import { getGovernanceChatMessagesByVoter } from '@solana/spl-governance'

import { PublicKey } from '@solana/web3.js'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { accountsToPubkeyMap } from '@tools/sdk/accounts'
import { fmtMintAmount } from '@tools/sdk/units'
import { notify } from '@utils/notifications'
import tokenService from '@utils/services/token'
import { Member } from '@utils/uiTypes/members'
import React, { useEffect, useMemo, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { WalletTokenRecordWithProposal } from './types'
import PaginationComponent from '@components/Pagination'
import useMembersStore from 'stores/useMembersStore'

const MemberOverview = ({ member }: { member: Member }) => {
  const { realm } = useRealm()
  const connection = useWalletStore((s) => s.connection)
  const selectedRealm = useWalletStore((s) => s.selectedRealm)
  const { mint, councilMint, proposals, symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()
  const activeMembers = useMembersStore((s) => s.compact.activeMembers)
  const [ownVoteRecords, setOwnVoteRecords] = useState<
    WalletTokenRecordWithProposal[]
  >([])
  const [recentVotes, setRecentVotes] = useState<
    WalletTokenRecordWithProposal[]
  >([])
  const {
    walletAddress,
    councilVotes,
    communityVotes,
    votesCasted,
    hasCouncilTokenOutsideRealm,
    hasCommunityTokenOutsideRealm,
  } = member

  const walletPublicKey = tryParsePublicKey(walletAddress)
  const tokenName = realm
    ? tokenService.getTokenInfo(realm?.account.communityMint.toBase58())?.symbol
    : ''
  const communityAmount = useMemo(
    () =>
      communityVotes && communityVotes && !communityVotes.isZero()
        ? fmtMintAmount(mint, communityVotes)
        : '',
    [walletAddress]
  )

  const councilAmount = useMemo(
    () =>
      councilVotes && councilVotes && !councilVotes.isZero()
        ? fmtMintAmount(councilMint, councilVotes)
        : '',
    [walletAddress]
  )

  const getVoteRecordsAndChatMsgs = async () => {
    let voteRecords: { [pubKey: string]: ProgramAccount<VoteRecord> } = {}
    let chatMessages: { [pubKey: string]: ProgramAccount<ChatMessage> } = {}
    try {
      const results = await Promise.all([
        getVoteRecordsByVoterMapByProposal(
          connection.current,
          selectedRealm!.programId!,
          new PublicKey(walletAddress)
        ),
        getGovernanceChatMessagesByVoter(
          connection!.current,
          GOVERNANCE_CHAT_PROGRAM_ID,
          new PublicKey(walletAddress)
        ),
      ])
      voteRecords = results[0]
      chatMessages = accountsToPubkeyMap(results[1])
    } catch (e) {
      notify({
        message: 'Unable to fetch vote records for selected wallet address',
        type: 'error',
      })
    }
    return { voteRecords, chat: chatMessages }
  }

  useEffect(() => {
    //we get voteRecords sorted by proposal date and match it with proposal name and chat msgs leaved by token holder.
    const handleSetVoteRecords = async () => {
      const { voteRecords, chat } = await getVoteRecordsAndChatMsgs()
      const voteRecordsArray: WalletTokenRecordWithProposal[] = Object.keys(
        voteRecords
      )
        .sort((a, b) => {
          const prevProposal = proposals[a]
          const nextProposal = proposals[b]
          return (
            prevProposal?.account.getStateTimestamp() -
            nextProposal?.account.getStateTimestamp()
          )
        })
        .reverse()
        .filter((x) => proposals[x])
        .flatMap((x) => {
          const currentProposal = proposals[x]
          const currentChatsMsgPk = Object.keys(chat).filter(
            (c) =>
              chat[c]?.account.proposal.toBase58() ===
              currentProposal?.pubkey.toBase58()
          )
          const currentChatMsgs = currentChatsMsgPk.map(
            (c) => chat[c].account.body.value
          )
          return {
            proposalPublicKey: x,
            proposalName: currentProposal?.account.name,
            chatMessages: currentChatMsgs,
            ...voteRecords[x],
          }
        })

      setOwnVoteRecords(voteRecordsArray)
    }
    handleSetVoteRecords()
  }, [walletAddress])

  const memberVotePowerRank = useMemo(() => {
    const sortedMembers = activeMembers.sort((a, b) =>
      a.communityVotes.cmp(b.communityVotes) === 1 ? -1 : 1
    )
    return (
      sortedMembers.findIndex(
        (m) => m.walletAddress === member?.walletAddress
      ) + 1
    )
  }, [JSON.stringify(activeMembers.length), member.walletAddress])

  useEffect(() => {
    setRecentVotes(paginateVotes(0))
  }, [JSON.stringify(ownVoteRecords)])

  const perPage = 8
  const totalPages = Math.ceil(ownVoteRecords.length / perPage)
  const onPageChange = (page) => {
    setRecentVotes(paginateVotes(page))
  }
  const paginateVotes = (page) => {
    return ownVoteRecords.slice(page * perPage, (page + 1) * perPage)
  }

  const Address = useMemo(() => {
    return (
      <DisplayAddress
        connection={connection.current}
        address={walletPublicKey}
        height="12px"
        width="100px"
        dark={true}
      />
    )
  }, [walletPublicKey?.toBase58()])
  return (
    <>
      <div className="flex items-center justify-between mb-2 py-2">
        <h2 className="mb-0">{Address}</h2>
        <a
          className="default-transition flex items-center text-primary-light hover:text-primary-dark text-sm"
          href={
            walletAddress
              ? getExplorerUrl(connection.cluster, walletAddress)
              : ''
          }
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          Explorer
          <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 w-4" />
        </a>
      </div>
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:space-x-3">
        {(communityAmount || !councilAmount) && (
          <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all">
            <p>{tokenName} Votes</p>
            <div className="font-bold text-fgd-1 text-2xl flex items-center">
              {communityAmount || 0}{' '}
              {hasCommunityTokenOutsideRealm && (
                <LogoutIcon className="w-4 h-4 ml-1"></LogoutIcon>
              )}
            </div>

            <p>Vote Power Rank: {memberVotePowerRank}</p>
          </div>
        )}
        {councilAmount && (
          <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all">
            <p>Council Votes</p>
            <div className="font-bold text-fgd-1 text-2xl flex items-center">
              {councilAmount}{' '}
              {hasCouncilTokenOutsideRealm && (
                <LogoutIcon className="w-3 h-3 ml-1"></LogoutIcon>
              )}
            </div>
          </div>
        )}
        <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all">
          <p>Votes Cast</p>
          <div className="font-bold text-fgd-1 text-2xl">{votesCasted}</div>
          <div className="flex">
            <p>
              Yes Votes:{' '}
              {ownVoteRecords.filter((v) => isYesVote(v.account))?.length}
            </p>
            <span className="px-2 text-fgd-4">|</span>
            <p>
              No Votes:{' '}
              {ownVoteRecords.filter((v) => !isYesVote(v.account))?.length}
            </p>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <h3 className="mb-3 text-base">
          {ownVoteRecords?.length} Recent Votes
        </h3>
        {recentVotes.map((x) => (
          <a
            href={fmtUrlWithCluster(
              `/dao/${symbol}/proposal/${x.proposalPublicKey}`
            )}
            rel="noopener noreferrer"
            className="border border-fgd-4 default-transition rounded-lg hover:bg-bkg-3 p-4 text-xs text-th-fgd-1 mb-2 block"
            key={x.proposalPublicKey}
          >
            <div className="flex items-center justify-between">
              <p className="font-bold mb-0 text-fgd-1">{x.proposalName}</p>
              {isYesVote(x.account) ? (
                <p className="bg-bkg-4 flex items-center mb-0 ml-4 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                  <CheckCircleIcon className="flex-shrink-0 h-5 mr-1 text-green w-5" />
                  Voted Yes
                </p>
              ) : (
                <p className="bg-bkg-4 flex items-center mb-0 ml-4 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                  <XCircleIcon className="flex-shrink-0 h-5 mr-1 text-red w-5" />
                  Voted No
                </p>
              )}
            </div>
            {x.chatMessages?.length > 0 ? (
              <>
                {x.chatMessages.map((msg, index) => (
                  <div
                    className="bg-bkg-1 space-y-2 mt-2 px-4 py-3 rounded-md"
                    key={index}
                  >
                    <p className={`flex items-center text-fgd-3 text-xs`}>
                      <ChatAltIcon className="flex-shrink-0 h-5 mr-1.5 text-fgd-2 w-5" />
                      {msg}
                    </p>
                  </div>
                ))}
              </>
            ) : null}
          </a>
        ))}
        <div>
          <PaginationComponent
            totalPages={totalPages}
            onPageChange={onPageChange}
          ></PaginationComponent>
        </div>
      </div>
    </>
  )
}

export default MemberOverview
