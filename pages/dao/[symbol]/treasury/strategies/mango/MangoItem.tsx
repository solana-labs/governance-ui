import tokenService from '@utils/services/token'
import { useState } from 'react'
import ItemName from '../../components/ItemName'
import ItemWrapper from '../../components/ItemWrapper'
import MangoDepositModal from './MangoDepositModal'

export const MANGO_MINT = 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'

const MangoItem = () => {
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
        <div>0</div>
        <div>0</div>
        <div>0</div>
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
