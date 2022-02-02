import tokenService from '@utils/services/token'
import { useState } from 'react'
import ItemName from '../../components/ItemName'
import ItemWrapper from '../../components/ItemWrapper'
import MangoDepositModal from './MangoDepositModal'

export const MANGO_MINT = 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'

const MangoItem = ({ liquidity, apy, symbol, tokenImgSrc }) => {
  const info = tokenService.getTokenInfo(MANGO_MINT)
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <>
      <ItemWrapper
        onClick={() => {
          setIsModalOpen(true)
        }}
      >
        <ItemName imgSrc={info?.logoURI} name={info?.name}></ItemName>
        <div>Deposit</div>
        <div className="flex flex-items text-right">
          0 {symbol} <img src={tokenImgSrc} className="w-5 h-5"></img>
        </div>
        <div>{liquidity}</div>
        <div>{apy}</div>
      </ItemWrapper>
      {isModalOpen && (
        <MangoDepositModal
          onClose={() => {
            setIsModalOpen(false)
          }}
          isOpen={isModalOpen}
        ></MangoDepositModal>
      )}
    </>
  )
}

export default MangoItem
