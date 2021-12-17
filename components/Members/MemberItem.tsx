import { UserCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { fmtMintAmount } from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import { TokenRecordWithWallet } from './types'
import tokenService from '@utils/services/token'
import useMembersListStore from 'stores/useMembersListStore'
import { ViewState } from './types'
import { useMemo } from 'react'

const MemberItem = ({ item }: { item: TokenRecordWithWallet }) => {
  const { mint, councilMint, realm } = useRealm()
  const {
    setCurrentCompactView,
    setCurrentCompactViewMember,
  } = useMembersListStore()
  const { walletAddress, info } = item
  const tokenName = tokenService.tokenList.find(
    (x) => x.address === realm?.info.communityMint.toBase58()
  )?.symbol
  const walletPublicKey = tryParsePublicKey(walletAddress)
  const currentMint =
    realm?.info.communityMint?.toBase58() === info.governingTokenMint.toBase58()
      ? mint
      : councilMint
  const isCouncilMint =
    realm?.info.communityMint?.toBase58() !== info.governingTokenMint.toBase58()

  async function handleGoToMemberOverview() {
    setCurrentCompactView(ViewState.MemberOverview)
    setCurrentCompactViewMember(item)
  }
  const amount = useMemo(
    () => fmtMintAmount(currentMint, info.governingTokenDepositAmount),
    [info.governingTokenDepositAmount]
  )
  const walletAddressFormated = useMemo(
    () => abbreviateAddress(walletPublicKey as PublicKey),
    [walletAddress]
  )
  return (
    <div
      onClick={handleGoToMemberOverview}
      className="cursor-pointer default-transition flex items-start text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3"
    >
      <div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-8 rounded-full w-8 mr-2">
        <UserCircleIcon className="h-6 text-fgd-3 w-6" />
      </div>
      <div>
        <div className="text-xs text-th-fgd-1">{walletAddressFormated}</div>
        <div className="text-fgd-3 text-xs flex flex-col">
          Total Votes: {info.totalVotesCount}
        </div>
        <div className="text-fgd-3 text-xs flex flex-col">
          {isCouncilMint ? 'Council' : tokenName} Votes {amount}
        </div>
      </div>
    </div>
  )
}

export default MemberItem
