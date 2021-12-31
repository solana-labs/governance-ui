import { getExplorerUrl } from '@components/explorer/tools'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  XCircleIcon,
} from '@heroicons/react/solid'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { VoteRecord } from '@models/accounts'
import { ChatMessage } from '@models/chat/accounts'
import { getGovernanceChatMessagesByVoter } from '@models/chat/api'
import { ParsedAccount } from '@models/core/accounts'
import { PublicKey } from '@solana/web3.js'
import { fmtMintAmount } from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import { notify } from '@utils/notifications'
import tokenService from '@utils/services/token'
import React, { useEffect, useMemo, useState } from 'react'
import useMembersListStore from 'stores/useMembersStore'
import useWalletStore, { getVoteRecordsByProposal } from 'stores/useWalletStore'
import { ViewState, WalletTokenRecordWithProposal } from './types'

const MemberOverview = () => {
  const member = useMembersListStore((s) => s.compact.currentMember)
  const connection = useWalletStore((s) => s.connection)
  const selectedRealm = useWalletStore((s) => s.selectedRealm)
  const { mint, councilMint, proposals, symbol } = useRealm()
  const { setCurrentCompactView, resetCompactViewState } = useMembersListStore()
  const { walletAddress, community, council } = member!
  const { fmtUrlWithCluster } = useQueryContext()
  const tokenName = tokenService.tokenList.find(
    (x) => x.address === community?.info.governingTokenMint.toBase58()
  )?.symbol
  const [ownVoteRecords, setOwnVoteRecords] = useState<
    WalletTokenRecordWithProposal[]
  >([])
  const totalCommunityVotes = community?.info.totalVotesCount || 0
  const totalCouncilVotes = council?.info.totalVotesCount || 0
  const totalVotes = totalCommunityVotes + totalCouncilVotes

  const communityAmount = community
    ? useMemo(
        () => fmtMintAmount(mint, community.info.governingTokenDepositAmount),
        [community.info.governingTokenDepositAmount]
      )
    : null
  const councilAmount = council
    ? useMemo(
        () =>
          fmtMintAmount(councilMint, council.info.governingTokenDepositAmount),
        [council.info.governingTokenDepositAmount]
      )
    : null

  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  const getVoteRecordsAndChatMsgs = async () => {
    let voteRecords: { [pubKey: string]: ParsedAccount<VoteRecord> } = {}
    let chat: { [pubKey: string]: ParsedAccount<ChatMessage> } = {}
    try {
      const responsnes = await Promise.all([
        getVoteRecordsByProposal(
          selectedRealm!.programId!,
          connection.endpoint,
          new PublicKey(member!.walletAddress)
        ),
        getGovernanceChatMessagesByVoter(
          connection!.endpoint,
          new PublicKey(member!.walletAddress)
        ),
      ])
      voteRecords = responsnes[0]
      chat = responsnes[1]
    } catch (e) {
      notify({
        message: 'Unable to fetch vote records for selected wallet address',
        type: 'error',
      })
    }
    return { voteRecords, chat }
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
            prevProposal?.info.getStateTimestamp() -
            nextProposal?.info.getStateTimestamp()
          )
        })
        .reverse()
        .filter((x) => proposals[x])
        .flatMap((x) => {
          const currentProposal = proposals[x]
          const currentChatsMsgPk = Object.keys(chat).filter(
            (c) =>
              chat[c]?.info.proposal.toBase58() ===
              currentProposal?.pubkey.toBase58()
          )
          const currentChatMsgs = currentChatsMsgPk.map(
            (c) => chat[c].info.body.value
          )
          return {
            proposalPublicKey: x,
            proposalName: currentProposal?.info.name,
            chatMessages: currentChatMsgs,
            ...voteRecords[x],
          }
        })

      setOwnVoteRecords(voteRecordsArray)
    }
    handleSetVoteRecords()
  }, [walletAddress])

  return (
    <>
      <h3 className="mb-4 flex items-center hover:cursor-pointer">
        <>
          <ArrowLeftIcon
            onClick={handleGoBackToMainView}
            className="h-4 w-4 text-primary-light mr-2"
          />
          {abbreviateAddress(new PublicKey(walletAddress))}
        </>
      </h3>
      <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex">
        <div>
          {abbreviateAddress(new PublicKey(walletAddress))}
          <div className="text-fgd-3 text-xs flex flex-col">
            Votes cast: {totalVotes}
          </div>
          <div className="text-fgd-3 text-xs flex flex-row">
            {communityAmount && (
              <span>
                {tokenName} Votes {communityAmount}
              </span>
            )}
            {communityAmount && council && <span className="ml-1 mr-1">|</span>}
            {council && <span>Council Votes {councilAmount}</span>}
          </div>
        </div>
        <div className="ml-auto">
          <a
            href={
              walletAddress
                ? getExplorerUrl(connection.endpoint, walletAddress)
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
          </a>
        </div>
      </div>
      <div className="font-normal mr-1 text-xs text-fgd-3 mb-4 mt-4">
        Recent votes
      </div>
      {/* TODO virtual scroll */}
      <div style={{ maxHeight: '350px' }} className="overflow-auto">
        {ownVoteRecords.map((x) => (
          <a
            href={fmtUrlWithCluster(
              `/dao/${symbol}/proposal/${x.proposalPublicKey}`
            )}
            rel="noopener noreferrer"
            className="border border-fgd-4 default-transition rounded-lg hover:bg-bkg-3 css-1ug690d-StyledCardWrapepr elzt7lo0 p-4 text-xs text-th-fgd-1 mb-2 flex"
            key={x.proposalPublicKey}
          >
            <div className="w-full pr-6">
              <div className="break-all mb-2">
                {x.proposalName.slice(0, 30)}
                {x.proposalName.length > 30 ? '...' : ''}
              </div>
              {x.chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`text-xs text-fgd-3 p-2 border-t border-fgd-4`}
                >
                  {msg}
                </div>
              ))}
            </div>
            <div className="ml-auto text-fgd-3 text-xs flex flex-col">
              {x.info.isYes() ? (
                <CheckCircleIcon className="h-4 mr-1 text-green w-4" />
              ) : (
                <XCircleIcon className="h-4 mr-1 text-red w-4" />
              )}
            </div>
          </a>
        ))}
      </div>
    </>
  )
}

export default MemberOverview
