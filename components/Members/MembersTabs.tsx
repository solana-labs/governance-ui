import { FunctionComponent } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { AddressImage, DisplayAddress } from '@cardinal/namespaces-components'
import { UserCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import tokenService from '@utils/services/token'
import { fmtMintAmount } from '@tools/sdk/units'

interface MembersTabsProps {
  activeTab: any
  onChange: (x) => void
  tabs: Array<any>
}

const MembersTabs: FunctionComponent<MembersTabsProps> = ({
  activeTab,
  onChange,
  tabs,
}) => {
  const { connection } = useWalletStore((s) => s)
  const { mint, councilMint, realm } = useRealm()
  const tokenName = realm
    ? tokenService.getTokenInfo(realm?.account.communityMint.toBase58())?.symbol
    : ''

  const renderAddressName = (walletAddress) => {
    return (
      <DisplayAddress
        connection={connection.current}
        address={walletAddress}
        height="12px"
        width="100px"
        dark={true}
      />
    )
  }
  const renderAddressImage = (walletAddress) => (
    <AddressImage
      dark={true}
      connection={connection.current}
      address={walletAddress}
      height="32px"
      width="32px"
      placeholder={<UserCircleIcon className="h-6 text-fgd-3 w-6" />}
    />
  )
  return (
    <div
      className={`overflow-y-auto relative thin-scroll`}
      style={{ maxHeight: '1065px' }}
    >
      <div
        className={`absolute bg-primary-light h-24 top-0 default-transition left-0 w-1 z-10`}
        style={{
          transform: `translateY(${
            tabs.findIndex(
              (t) => t.walletAddress === activeTab?.walletAddress
            ) * 100
          }%)`,
        }}
      />
      {tabs.map((x) => {
        const { walletAddress, councilVotes, communityVotes, votesCasted } = x
        const communityAmount =
          communityVotes && !communityVotes.isZero()
            ? fmtMintAmount(mint, communityVotes)
            : null
        const councilAmount =
          councilVotes && !councilVotes.isZero()
            ? fmtMintAmount(councilMint, councilVotes)
            : null
        return (
          <button
            key={walletAddress}
            onClick={() => onChange(x)}
            className={`cursor-pointer default-transition flex items-center h-24 px-4 relative w-full hover:bg-bkg-3 hover:rounded-md ${
              activeTab?.walletAddress === walletAddress
                ? `bg-bkg-3 rounded-md rounded-l-none text-primary-light`
                : `text-fgd-2 hover:text-primary-light`
            }
            `}
          >
            <div className="flex items-center text-left">
              <div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-8 rounded-full w-8 mr-2">
                {renderAddressImage(walletAddress)}
              </div>
              <div>
                <h3 className="mb-1 text-sm flex">
                  {renderAddressName(walletAddress)}
                </h3>
                <p className="mb-0 text-fgd-1 text-xs">
                  Votes Cast: {votesCasted}
                </p>
                <span className="text-fgd-3 text-xs">
                  {(communityAmount || !councilAmount) && (
                    <span className="flex items-center">
                      {tokenName} Votes {communityAmount || 0}
                    </span>
                  )}
                  {councilAmount && (
                    <span className="flex items-center">
                      Council Votes {councilAmount}{' '}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default MembersTabs
