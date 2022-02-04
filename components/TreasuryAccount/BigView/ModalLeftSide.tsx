import BigNumber from 'bignumber.js'

const ModalLeftSide = ({ strategy, liquidity, projectedYield, children }) => {
  return (
    <div className="flex-items w-1/2">
      <div className="flex flex-col mb-5 w-1/2">
        <div className="grid grid-cols-3 text-xs mb-1">
          <div>Strategy</div>
          <div>Liquidity</div>
          <div>Projected yield</div>
        </div>
        <div className="grid grid-cols-3 text-xs font-bold">
          <div>{strategy}</div>
          <div>${new BigNumber(liquidity).toFormat(0)}</div>
          <div className="text-right">{projectedYield}</div>
        </div>
      </div>
      {/* description */}
      <div>{children}</div>
    </div>
  )
}

export default ModalLeftSide
