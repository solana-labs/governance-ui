import ItemWrapper from '@components/TreasuryAccount/BigView/ItemWrapper'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import ItemName from './ItemName'
import { TreasuryStrategy } from './types/types'
import DepositModal from './DepositModal'

const StrategyItem = ({
  liquidity,
  apy,
  protocolName,
  handledMint,
  handledTokenSymbol,
  handledTokenImgSrc,
  protocolLogoSrc,
  strategyName,
  currentPosition,
  strategyDescription,
  handleDeposit,
}: TreasuryStrategy) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <>
      <ItemWrapper
        onClick={() => {
          setIsModalOpen(true)
        }}
      >
        <ItemName imgSrc={protocolLogoSrc} name={protocolName}></ItemName>
        <div>{strategyName}</div>
        {/* TODO format current position with mint */}
        <div className="flex flex-items">{currentPosition.toNumber()}</div>
        <div className="flex flex-items">
          <img src={handledTokenImgSrc} className="w-5 h-5 mr-3"></img>{' '}
          {handledTokenSymbol}
        </div>
        <div>${new BigNumber(liquidity).toFormat(0)}</div>
        <div>{apy}</div>
      </ItemWrapper>
      {isModalOpen && (
        <DepositModal
          currentPosition={currentPosition}
          apy={apy}
          liquidity={liquidity}
          handledMint={handledMint}
          onClose={() => {
            setIsModalOpen(false)
          }}
          isOpen={isModalOpen}
          protocolName={protocolName}
          protocolLogoSrc={protocolLogoSrc}
          handledTokenName={handledTokenSymbol}
          strategyName={strategyName}
          strategyDescription={strategyDescription}
          handleDeposit={handleDeposit}
        ></DepositModal>
      )}
    </>
  )
}

export default StrategyItem
