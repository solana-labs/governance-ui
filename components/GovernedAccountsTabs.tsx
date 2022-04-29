import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'
import { emptyPk } from 'NftVotePlugin/sdk/accounts'
import { FunctionComponent } from 'react'
import { getAccountName } from './instructions/tools'

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
  const activePubKey = activeTab?.pubkey
  const unusedMintPublicKey = new PublicKey(emptyPk)
  return (
    <div className={`relative`}>
      <div
        className={`absolute bg-primary-light top-0 default-transition left-0 w-1 z-10`}
      />
      {tabs.map((x) => {
        const pubKey = x.pubkey
        const name = getAccountName(pubKey)
        return (
          <button
            key={pubKey}
            onClick={() => onChange(x)}
            className={`cursor-pointer flex items-center h-16 px-4 relative w-full hover:bg-bkg-3 hover:rounded-md ${
              activePubKey?.toBase58() === pubKey.toBase58()
                ? `bg-bkg-3 rounded-md rounded-l-none text-primary-light border-l-2 border-primary-light`
                : `text-fgd-2 hover:text-primary-light`
            }
            `}
          >
            <div className="text-left">
              <div className="text-xs text-fgd-3">{name}</div>
              <span className="break-all text-xs">
                {abbreviateAddress(pubKey)}
              </span>
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
      <button
        key={emptyPk}
        onClick={() => onChange({ pubkey: unusedMintPublicKey })}
        className={`cursor-pointer flex items-center h-16 px-4 relative w-full hover:bg-bkg-3 hover:rounded-md ${
          activePubKey?.toBase58() === unusedMintPublicKey.toBase58()
            ? `bg-bkg-3 rounded-md rounded-l-none text-primary-light border-l-2 border-primary-light`
            : `text-fgd-2 hover:text-primary-light`
        }
            `}
      >
        <div className="text-left">
          <div className="text-xs text-fgd-3">Auxiliary Accounts</div>
        </div>
      </button>
    </div>
  )
}

export default GovernedAccountsTabs
