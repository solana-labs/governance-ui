import { LinkButton } from '@components/Button'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { fmtMintAmount } from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import tokenService from '@utils/services/token'
import React, { useMemo } from 'react'
import useMembersListStore from 'stores/useMembersListStore'
import { ViewState } from './types'

const MemberOverview = () => {
  const member = useMembersListStore((s) => s.compact.currentMember)
  const { walletAddress, community, council } = member!
  const { setCurrentCompactView, resetCompactViewState } = useMembersListStore()
  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  const tokenName = tokenService.tokenList.find(
    (x) => x.address === community?.info.governingTokenMint.toBase58()
  )?.symbol
  const { mint, councilMint } = useRealm()
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
  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>
          <ArrowLeftIcon
            onClick={handleGoBackToMainView}
            className="h-4 w-4 mr-1 text-primary-light mr-2 hover:cursor-pointer"
          />
          {abbreviateAddress(new PublicKey(walletAddress))}
        </>
      </h3>
      <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex items-center">
        <div>
          {abbreviateAddress(new PublicKey(walletAddress))}
          <div className="text-fgd-3 text-xs flex flex-col">
            Total Votes: {totalVotes}
          </div>
          <div className="text-fgd-3 text-xs flex flex-col">
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
          <LinkButton
            className="ml-4 text-th-fgd-1"
            onClick={() => {
              navigator.clipboard.writeText(walletAddress)
            }}
          >
            Copy
          </LinkButton>
        </div>
      </div>
      <div className="font-normal mr-1 text-xs text-fgd-3 mb-4 mt-4">
        Recent votes
      </div>
      <div>lol</div>
    </>
  )
}

export default MemberOverview
