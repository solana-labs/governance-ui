import BigNumber from 'bignumber.js'
import { useState } from 'react'
import ItemName from './ItemName'
import DepositModal from './DepositModal'
import { TreasuryStrategy } from 'Strategies/types/types'
import ItemWrapper from './ItemWrapper'

const MangoItem = ({
  // liquidity,
  apy,
  protocolName,
  handledMint,
  handledTokenSymbol,
  handledTokenImgSrc,
  protocolLogoSrc,
  strategyName,
  currentPosition,
  // strategyDescription,
  createProposalFcn,
}: TreasuryStrategy) => {
  const depositedFmtAmount = new BigNumber(123).toFormat()
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
        <div className="flex flex-items">{depositedFmtAmount}</div>
        <div className="flex flex-items">
          <img src={handledTokenImgSrc} className="w-5 h-5 mr-3"></img>{' '}
          {handledTokenSymbol}
        </div>
        {/* <div>${new BigNumber(liquidity).toFormat(0)}</div> */}
        <div>{apy}</div>
      </ItemWrapper>
      {isModalOpen && (
        <DepositModal
          currentPosition={currentPosition.toNumber()}
          apy={apy}
          // liquidity={liquidity}
          handledMint={handledMint}
          onClose={() => {
            setIsModalOpen(false)
          }}
          isOpen={isModalOpen}
          protocolName={protocolName}
          protocolLogoSrc={protocolLogoSrc}
          handledTokenName={handledTokenSymbol}
          strategyName={strategyName}
          // strategyDescription={strategyDescription}
          createProposalFcn={createProposalFcn}
        ></DepositModal>
      )}
    </>
  )
}

export default MangoItem
