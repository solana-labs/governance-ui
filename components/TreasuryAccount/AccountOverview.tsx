import Button from '@components/Button'
import { TreasuryStrategy } from 'Strategies/types/types'
import BigNumber from 'bignumber.js'

interface StrategyCardProps {
  onClick?: () => void
  strat: TreasuryStrategy
  currentDeposits: number
}

export const StrategyCard = ({
  onClick,
  strat,
  currentDeposits,
}: StrategyCardProps) => {
  const {
    handledTokenImgSrc,
    strategyName,
    protocolName,
    strategySubtext,
    handledTokenSymbol,
    apy,
    apyHeader,
    noProtocol,
  } = strat
  const currentPositionFtm = new BigNumber(
    currentDeposits.toFixed(2)
  ).toFormat()
  return (
    <div className="flex items-center justify-between p-4 mt-2 border rounded-md border-fgd-4">
      <div className="flex items-center">
        {strat.protocolLogoSrc ? (
          <img
            src={strat.protocolLogoSrc}
            style={{
              marginRight: -8,
            }}
            className="h-8 rounded-full w-8"
          ></img>
        ) : null}
        {handledTokenImgSrc ? (
          <img
            src={strat.handledTokenImgSrc}
            className="w-8 h-8 mr-3 rounded-full"
          ></img>
        ) : (
          <div className="w-8 h-8 mr-3 rounded-full"></div>
        )}
        <div>
          <p className="text-xs">{`${strategyName} ${handledTokenSymbol} ${
            noProtocol ? '' : `on ${protocolName}`
          }${strategySubtext ? ` - ${strategySubtext}` : ''}`}</p>
          {(handledTokenSymbol || currentPositionFtm !== '0') && (
            <p className="font-bold text-fgd-1">{`${currentPositionFtm} ${handledTokenSymbol}`}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          {apy && <p className="text-xs">{apyHeader ?? 'Interest Rate'}</p>}
          <p className="font-bold text-green">{apy}</p>
        </div>
        {onClick ? <Button onClick={onClick}>{`Propose`}</Button> : null}
      </div>
    </div>
  )
}
