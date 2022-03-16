import { GovernedTokenAccount } from '@utils/tokens'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
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
    isSol,
  } = getTreasuryAccountItemInfo(governedAccountTokenAccount, governanceNfts)

  return (
    <div className="flex items-start text-fgd-1 border border-fgd-4 p-3 rounded-lg w-full">
      {logo && (
        <img
          className={`flex-shrink-0 h-6 w-6 mr-2.5 mt-1 ${
            isSol && 'rounded-full'
          }`}
          src={logo}
        />
      )}
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
