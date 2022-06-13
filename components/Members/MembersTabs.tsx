import { FunctionComponent, useMemo } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { UserCircleIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import tokenService from '@utils/services/token'
import { fmtMintAmount } from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { AddressImage, DisplayAddress } from '@cardinal/namespaces-components'
import { Member } from '@utils/uiTypes/members'
import { MintInfo } from '@solana/spl-token'

interface MembersTabsProps {
  activeTab: Member
  onChange: (x) => void
  tabs: Array<Member>
}

const MembersTabs: FunctionComponent<MembersTabsProps> = ({
  activeTab,
  onChange,
  tabs,
}) => {
  const { mint, councilMint, realm } = useRealm()
  const tokenName = realm
    ? tokenService.getTokenInfo(realm?.account.communityMint.toBase58())?.symbol
    : ''
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
        return (
          (mint || councilMint) && (
            <MemberItems
              key={x.walletAddress}
              member={x}
              mint={mint}
              councilMint={councilMint}
              activeTab={activeTab}
              tokenName={tokenName || ''}
              onChange={onChange}
            ></MemberItems>
          )
        )
      })}
    </div>
  )
}

export default MembersTabs

const MemberItems = ({
  member,
  mint,
  councilMint,
  activeTab,
  tokenName,
  onChange,
}: {
  member: Member
  mint?: MintInfo
  councilMint?: MintInfo
  activeTab: Member
  tokenName: string
  onChange: (member: Member) => void
}) => {
  const { walletAddress, councilVotes, communityVotes, votesCasted } = member
  const communityAmount =
    communityVotes && !communityVotes.isZero()
      ? fmtMintAmount(mint, communityVotes)
      : null
  const councilAmount =
    councilVotes && !councilVotes.isZero()
      ? fmtMintAmount(councilMint, councilVotes)
      : null
  const { connection } = useWalletStore((s) => s)

  const renderAddressName = useMemo(() => {
    return (
      <DisplayAddress
        connection={connection.current}
        address={new PublicKey(walletAddress)}
        height="12px"
        width="100px"
        dark={true}
      />
    )
  }, [walletAddress])
  const renderAddressImage = useMemo(
    () => (
      <AddressImage
        dark={true}
        connection={connection.current}
        address={new PublicKey(walletAddress)}
        height="32px"
        width="32px"
        placeholder={<UserCircleIcon className="w-6 h-6 text-fgd-3" />}
      />
    ),
    [walletAddress]
  )
  return (
    <button
      key={walletAddress}
      onClick={() => onChange(member)}
      className={`cursor-pointer default-transition flex items-center h-24 px-4 relative w-full hover:bg-bkg-3 hover:rounded-md ${
        activeTab?.walletAddress === walletAddress
          ? `bg-bkg-3 rounded-md rounded-l-none text-primary-light`
          : `text-fgd-2 hover:text-primary-light`
      }
          `}
    >
      <div className="flex items-center text-left">
        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2 rounded-full bg-bkg-4">
          {renderAddressImage}
        </div>
        <div>
          <h3 className="flex mb-1 text-base font-bold">{renderAddressName}</h3>
          <p className="mb-0 text-xs text-fgd-1">Votes Cast: {votesCasted}</p>
          <span className="text-xs text-fgd-3">
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
}
