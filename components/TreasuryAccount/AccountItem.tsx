import { GovernedTokenAccount } from '@utils/tokens'
import useWalletStore from '../../stores/useWalletStore'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { ViewState } from './Types'
import { getTreasuryAccountItemInfo } from '@utils/treasuryTools'

const AccountItem = ({
  governedAccountTokenAccount,
}: {
  governedAccountTokenAccount: GovernedTokenAccount
}) => {
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  const {
    amountFormatted,
    logo,
    name,
    symbol,
    displayPrice,
  } = getTreasuryAccountItemInfo(governedAccountTokenAccount, governanceNfts)
  const {
    setCurrentCompactView,
    setCurrentCompactAccount,
  } = useTreasuryAccountStore()
  const connection = useWalletStore((s) => s.connection)
  async function handleGoToAccountOverview() {
    setCurrentCompactView(ViewState.AccountView)
    setCurrentCompactAccount(governedAccountTokenAccount, connection)
  }

  return (
    <div
      onClick={handleGoToAccountOverview}
      className="cursor-pointer default-transition flex items-start text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3"
    >
      {logo && <img className="flex-shrink-0 h-6 w-6 mr-2.5 mt-1" src={logo} />}
      <div className="w-full">
        <div className="flex items-start justify-between mb-1">
          <div className="text-xs text-th-fgd-1">{name}</div>
        </div>
        <div className="text-fgd-3 text-xs flex flex-col">
          {amountFormatted} {symbol}
        </div>
        {displayPrice ? (
          <div className="mt-0.5 text-fgd-3 text-xs">${displayPrice}</div>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default AccountItem
