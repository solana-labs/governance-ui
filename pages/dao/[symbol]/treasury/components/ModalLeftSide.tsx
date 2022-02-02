const ModalLeftSide = ({
  logoSrc,
  strategy,
  protocol,
  liquidity,
  projectedYield,
  children,
}) => {
  return (
    <div className="flex-items">
      <div className="flex flex-items mb-5">
        <img src={logoSrc} className="w-16 h-16 mr-3"></img>
        <div className="flex-items">
          <h1>{strategy}</h1>
          <h2>{protocol}</h2>
        </div>
      </div>
      <div className="flex flex-col mb-5">
        <div className="grid grid-cols-3 text-xs mb-1">
          <div>Strategy</div>
          <div>Liquidity</div>
          <div>Projected yield</div>
        </div>
        <div className="grid grid-cols-3 text-xs font-bold">
          <div>{strategy}</div>
          <div>{liquidity}</div>
          <div className="text-right">{projectedYield}</div>
        </div>
      </div>
      {/* description */}
      <div>{children}</div>
    </div>
  )
}

export default ModalLeftSide
