import { UserCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { fmtMintAmount } from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import { TokenRecordsWithWalletAddress } from './types'
import tokenService from '@utils/services/token'
import useMembersListStore from 'stores/useMembersListStore'
import { ViewState } from './types'
import { useMemo } from 'react'

const MemberItem = ({ item }: { item: TokenRecordsWithWalletAddress }) => {
  const { mint, councilMint, realm } = useRealm()
  const {
    setCurrentCompactView,
    setCurrentCompactViewMember,
  } = useMembersListStore()
  const { walletAddress, council, community } = item
  const tokenName = tokenService.tokenList.find(
    (x) => x.address === realm?.info.communityMint.toBase58()
  )?.symbol
  const walletPublicKey = tryParsePublicKey(walletAddress)

  async function handleGoToMemberOverview() {
    setCurrentCompactView(ViewState.MemberOverview)
    setCurrentCompactViewMember(item)
  }
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
  const walletAddressFormatted = abbreviateAddress(walletPublicKey as PublicKey)
  return (
    <div
      onClick={handleGoToMemberOverview}
      className="cursor-pointer default-transition flex items-start text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3"
    >
      <div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-8 rounded-full w-8 mr-2">
        <UserCircleIcon className="h-6 text-fgd-3 w-6" />
      </div>
      <div>
        <div className="text-xs text-th-fgd-1">{walletAddressFormatted}</div>
        <div className="text-fgd-3 text-xs flex flex-col">
          Total Votes: {totalVotes}
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
    </div>
  )
}

export default MemberItem
