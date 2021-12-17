import { LinkButton } from '@components/Button'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { fmtMintAmount } from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import tokenService from '@utils/services/token'
import React from 'react'
import useMembersListStore from 'stores/useMembersListStore'
import { ViewState } from './types'

const MemberOverview = () => {
  const member = useMembersListStore((s) => s.compact.currentMember)
  const { walletAddress, info } = member!
  const { setCurrentCompactView, resetCompactViewState } = useMembersListStore()
  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  const tokenName = tokenService.tokenList.find(
    (x) => x.address === info.governingTokenMint.toBase58()
  )?.symbol
  const { mint, councilMint, realm } = useRealm()
  const currentMint =
    realm?.info.communityMint?.toBase58() === info.governingTokenMint.toBase58()
      ? mint
      : councilMint
  const isCouncilMint =
    realm?.info.communityMint?.toBase58() !== info.governingTokenMint.toBase58()
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
            Total Votes: {info.totalVotesCount}
          </div>
          <div className="text-fgd-3 text-xs flex flex-col">
            {isCouncilMint ? 'Council' : tokenName} Votes{' '}
            {fmtMintAmount(currentMint, info.governingTokenDepositAmount)}
          </div>
        </div>
        <div className="ml-auto">
          <LinkButton
            className="ml-4 text-th-fgd-1"
            onClick={() => {
              navigator.clipboard.writeText(walletAddress)
            }}
          >
            Copy address
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
