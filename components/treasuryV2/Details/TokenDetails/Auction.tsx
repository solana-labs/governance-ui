import Button from '@components/Button'
import { Sol, Token } from '@models/treasury/Asset'
import { useState } from 'react'
import SellModal from '../Auction/SellModal'

interface Props {
  className: string | undefined
  asset: Token | Sol
}

export default function Auction(props: Props) {
  const [sellModalOpen, setSellModalOpen] = useState(false)
  const closeSellModal = () => {
    setSellModalOpen(false)
  }
  const openSellModal = () => {
    setSellModalOpen(true)
  }
  return (
    <div className={props.className}>
      <header className="mb-3">
        <div className="text-fgd-1 text-lg font-bold">Auction</div>
      </header>
      <section className="overflow-y-auto flex-grow space-y-4">
        <Button onClick={openSellModal}>Sell</Button>
        <SellModal
          asset={props.asset}
          isOpen={sellModalOpen}
          onClose={closeSellModal}
        ></SellModal>
      </section>
    </div>
  )
}
