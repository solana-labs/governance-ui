import { useEffect, useRef, useState } from 'react'

import PreviousRouteBtn from '@components/PreviousRouteBtn'
import TotalValueTitle from '@components/treasuryV2/TotalValueTitle'
import WalletList from '@components/treasuryV2/WalletList'
import Details from '@components/treasuryV2/Details'
import { map, Status } from '@utils/uiTypes/Result'
import useTreasuryInfo from '@hooks/useTreasuryInfo'
import { AuxiliaryWallet, Wallet } from '@models/treasury/Wallet'
import { Asset } from '@models/treasury/Asset'

export default function Treasury() {
  const data = useTreasuryInfo()
  const [isStickied, setIsStickied] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<
    AuxiliaryWallet | Wallet | null
  >(null)
  const stickyTracker = useRef<HTMLDivElement>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (data.status === Status.Ok && !selectedWallet) {
      setSelectedWallet(data.data.wallets[0])
    }
  }, [data.status])

  useEffect(() => {
    if (stickyTracker.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          const item = entries[0]
          setIsStickied(item.intersectionRatio < 1)
        },
        { threshold: [1] }
      )

      observer.current.observe(stickyTracker.current)
    }

    return () => observer.current?.disconnect()
  }, [stickyTracker, observer, setIsStickied])

  return (
    <div className="rounded-lg bg-bkg-2 p-6 min-h-full flex flex-col">
      <header className="space-y-6 border-b border-white/10 pb-4">
        <PreviousRouteBtn />
        <TotalValueTitle
          data={map(data, (data) => ({
            realm: {
              icon: data.icon,
              name: data.name,
            },
            value: data.totalValue,
          }))}
        />
      </header>
      <article className="grid grid-cols-[458px_1fr] flex-grow gap-x-4">
        <WalletList
          className="w-full pt-9"
          data={map(data, (data) => ({
            auxiliaryWallets: data.auxiliaryWallets,
            wallets: data.wallets,
          }))}
          selectedAsset={selectedAsset}
          selectedWallet={selectedWallet}
          onSelectAsset={(asset, wallet) => {
            setSelectedWallet(wallet)
            setSelectedAsset(() => asset)
          }}
          onSelectWallet={(wallet) => {
            setSelectedWallet(() => wallet)
            setSelectedAsset(null)
          }}
        />
        <div>
          <div className="text-lg pb-10">&nbsp;</div>
          <div className="sticky top-0">
            <div
              className="h-[1px] top-[-1px] relative mb-[-1px]"
              ref={stickyTracker}
            />
            <Details
              className="pt-4"
              data={map(data, () => ({
                asset: selectedAsset,
                wallet: selectedWallet,
              }))}
              isStickied={isStickied}
            />
          </div>
        </div>
      </article>
    </div>
  )
}
