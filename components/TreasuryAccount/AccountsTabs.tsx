import { FunctionComponent } from 'react'
import { getTreasuryAccountItemInfo } from '@utils/treasuryTools'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'

interface AccountsTabsProps {
  activeTab: any
  onChange: (x) => void
  tabs: Array<any>
}

const AccountsTabs: FunctionComponent<AccountsTabsProps> = ({
  activeTab,
  onChange,
  tabs,
}) => {
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  return (
    <div className={`relative`}>
      <div
        className={`absolute bg-primary-light top-0 default-transition left-0 w-1 z-10`}
        style={{
          transform: `translateY(${
            tabs.findIndex(
              (t) => t.transferAddress === activeTab?.transferAddress
            ) * 100
          }%)`,
          height: `${100 / tabs.length}%`,
        }}
      />
      {tabs.map((x) => {
        const {
          amountFormatted,
          logo,
          name,
          symbol,
          displayPrice,
        } = getTreasuryAccountItemInfo(x, governanceNfts)
        return (
          <button
            key={x.transferAddress}
            onClick={() => onChange(x)}
            className={`cursor-pointer default-transition flex items-center h-24 px-4 relative w-full hover:bg-bkg-3 hover:rounded-md ${
              activeTab?.transferAddress === x.transferAddress
                ? `bg-bkg-3 rounded-md rounded-l-none text-primary-light`
                : `text-fgd-2 hover:text-primary-light`
            }
            `}
          >
            <div className="text-left">
              <h3 className="mb-1 text-sm flex">
                {logo && <img src={logo} className="w-5 h-5 mr-2"></img>} {name}
              </h3>
              <p className="mb-0 text-fgd-1 text-xs">
                {amountFormatted} {symbol}
              </p>
              {displayPrice && (
                <span className="text-fgd-3 text-xs">${displayPrice}</span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default AccountsTabs
