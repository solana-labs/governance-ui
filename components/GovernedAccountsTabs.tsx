import { FunctionComponent } from 'react'

interface GovernedAccountsTabsProps {
  activeTab: any
  onChange: (x) => void
  tabs: Array<any>
}

const GovernedAccountsTabs: FunctionComponent<GovernedAccountsTabsProps> = ({
  activeTab,
  onChange,
  tabs,
}) => {
  return (
    <div className={`relative`}>
      <div
        className={`absolute bg-primary-light top-0 default-transition left-0 w-1 z-10`}
        style={{
          transform: `translateY(${
            tabs.findIndex(
              (t) => t.pubkey.toBase58() === activeTab?.pubkey.toBase58()
            ) * 100
          }%)`,
          height: `${100 / tabs.length}%`,
        }}
      />
      {tabs.map((x) => {
        const pubKey = x.pubkey
        const activePubKey = activeTab?.pubkey
        return (
          <button
            key={pubKey}
            onClick={() => onChange(x)}
            className={`cursor-pointer default-transition flex items-center h-16 px-4 relative w-full hover:bg-bkg-3 hover:rounded-md ${
              activePubKey?.toBase58() === pubKey.toBase58()
                ? `bg-bkg-3 rounded-md rounded-l-none text-primary-light`
                : `text-fgd-2 hover:text-primary-light`
            }
            `}
          >
            <div className="text-left">
              <span className="break-all text-sm">{pubKey.toBase58()}</span>
              {/* <p className="mb-0 text-fgd-1 text-xs">
                {amountFormatted} {symbol}
              </p>
              {displayPrice && (
                <span className="text-fgd-3 text-xs">${displayPrice}</span>
              )} */}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default GovernedAccountsTabs
