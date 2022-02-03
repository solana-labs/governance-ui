import tokenService from '@utils/services/token'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import ItemName from '../../components/ItemName'
import ItemWrapper from '../../components/ItemWrapper'
import { TreasuryStrategy } from '../../types/types'
import MangoDepositModal from './MangoDepositModal'
import { MANGO_MINT } from './tools'

const MangoItem = ({
  liquidity,
  apy,
  symbol,
  tokenImgSrc,
  strategy,
  mint,
}: TreasuryStrategy) => {
  const info = tokenService.getTokenInfo(MANGO_MINT)
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <>
      <ItemWrapper
        onClick={() => {
          setIsModalOpen(true)
        }}
      >
        <ItemName imgSrc={info?.logoURI} name={'Mango'}></ItemName>
        <div>{strategy}</div>
        <div className="flex flex-items">0</div>
        <div className="flex flex-items">
          <img src={tokenImgSrc} className="w-5 h-5 mr-3"></img> {symbol}
        </div>
        <div>${new BigNumber(liquidity).toFormat(0)}</div>
        <div>{apy}</div>
      </ItemWrapper>
      {isModalOpen && (
        <MangoDepositModal
          projectedYield={apy}
          liquidity={liquidity}
          mint={mint}
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
