import Button from '@components/Button'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { Token } from '@models/treasury/Asset'
import { useState } from 'react'
import BuyModal from '../Auction/BuyModal'
import SellModal from '../Auction/SellModal'

interface Props {
  className: string | undefined
  asset: Token
}

export default function Auction(props: Props) {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const [sellModalOpen, setSellModalOpen] = useState(false)
  const closeSellModal = () => {
    setSellModalOpen(false)
  }
  const openSellModal = () => {
    setSellModalOpen(true)
  }
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const closeBuyModal = () => {
    setBuyModalOpen(false)
  }
  const openBuyModal = () => {
    setBuyModalOpen(true)
  }
  return (
    <div className={props.className}>
      <header className="mb-3">
        <div className="text-fgd-1 text-lg font-bold">Auction</div>
      </header>
      <section className="overflow-y-auto flex-grow space-y-4 space-x-4">
        <Button
          disabled={!connected}
          tooltipMessage={!connected ? 'Please connect your wallet' : ''}
          onClick={openSellModal}
        >
          Sell
        </Button>
        <Button
          disabled={!connected}
          tooltipMessage={!connected ? 'Please connect your wallet' : ''}
          onClick={openBuyModal}
        >
          Buy
        </Button>
        <SellModal
          //asset={props.asset}
          isOpen={sellModalOpen}
          onClose={closeSellModal}
        ></SellModal>
        <BuyModal
          //asset={props.asset}
          isOpen={buyModalOpen}
          onClose={closeBuyModal}
        ></BuyModal>
      </section>
    </div>
  )
}
