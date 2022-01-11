import { CogIcon } from '@heroicons/react/outline'
import { ViewState } from './types'
import useAssetsStore from 'stores/useAssetsStore'
import { ParsedAccount } from '@models/core/accounts'
import { Governance } from '@models/accounts'
import { getProgramName } from '@components/instructions/programs/names'
import { abbreviateAddress } from '@utils/formatting'
import { PublicKey } from '@solana/web3.js'

const MemberItem = ({ item }: { item: ParsedAccount<Governance> }) => {
  const { setCurrentCompactView, setCurrentCompactViewAsset } = useAssetsStore()
  const name = item ? getProgramName(item.account.governedAccount) : ''
  async function handleGoToMemberOverview() {
    setCurrentCompactView(ViewState.AssetOverview)
    setCurrentCompactViewAsset(item)
  }
  const governedAccount = item
    ? abbreviateAddress(item?.account.governedAccount as PublicKey)
    : ''
  return (
    <div
      onClick={handleGoToMemberOverview}
      className="cursor-pointer default-transition flex items-start text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3"
    >
      <div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-8 rounded-full w-8 mr-2">
        <CogIcon className="h-6 text-fgd-3 w-6" />
      </div>
      <div className="flex flex-col">
        <div className="text-xs text-th-fgd-1">
          Program{name && `: ${name}`}
        </div>
        <div className="text-fgd-3 text-xs flex flex-row break-all">
          {governedAccount}
        </div>
      </div>
    </div>
  )
}

export default MemberItem
