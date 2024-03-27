import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'
import useTreasuryAddressForGovernance from '@hooks/useTreasuryAddressForGovernance'
import { useRealmDigitalAssetsQuery } from '@hooks/queries/digitalAssets'
import { useMemo } from 'react'

/** this is just an item in the NFTAccountSelect */
const AccountItemNFT = ({
  governance,
  className,
  border = false,
}: {
  governance: PublicKey
  className?: string
  border?: boolean
}) => {
  const { result: treasuryAddress } = useTreasuryAddressForGovernance(
    governance
  )

  const { data: nfts } = useRealmDigitalAssetsQuery()

  const nftsCount = useMemo(
    () =>
      nfts
        ?.flat()
        .filter(
          (x) =>
            x.ownership.owner === governance.toString() ||
            x.ownership.owner === treasuryAddress?.toString()
        ).length,
    [governance, nfts, treasuryAddress]
  )
  return (
    <div
      className={`cursor-pointer default-transition flex items-center text-fgd-1 ${
        border && 'border'
      } border-fgd-4 p-3 rounded-lg w-full hover:bg-bkg-3 ${
        className && className
      }`}
    >
      <img
        src="/img/collectablesIcon.svg"
        className="flex-shrink-0 h-5 w-5 mr-2.5"
      />

      <div className="w-full">
        <div className="flex items-start justify-between mb-0.5">
          <div className="text-xs text-th-fgd-1">
            {treasuryAddress ? abbreviateAddress(treasuryAddress) : ''}
          </div>
        </div>
        <div className="text-fgd-3 text-xs flex flex-col">
          {nftsCount ?? '...'} NFTS
        </div>
      </div>
    </div>
  )
}

export default AccountItemNFT
