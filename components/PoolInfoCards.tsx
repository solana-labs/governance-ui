import usePool from '../hooks/usePool'
import useVaults from '../hooks/useVaults'
import PoolCountdown from './PoolCountdown'

const Card = (props: any) => {
  return (
    <div
      className="flex-1 m-2 p-5 border border-bkg-3 rounded-xl h-auto w-auto z-10 shadow-md"
      style={{ backgroundColor: 'rgba(44, 41, 66, 1)' }}
    >
      <p className="pb-2 text-white text-opacity-50 text-md">{props.title}</p>
      {props.children}
    </div>
  )
}

const PoolInfoCards = () => {
  const { endIdo, endDeposits } = usePool()
  const vaults = useVaults()

  const numberFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 10,
  })

  return (
    <div className="max-w-7xl flex flex-wrap mx-auto px-6 mb-16 z-10">
      <Card title="Deposits closing in">
        <PoolCountdown date={endDeposits} />
      </Card>

      <Card title="Sale event ends in">
        <PoolCountdown date={endIdo} />
      </Card>
      <Card title="Total contributions">
        <div className="flex">
          <img
            alt="USDC"
            width="25"
            height="25"
            src="/icons/usdc.svg"
            className={`mr-4`}
          />{' '}
          <div className="font-bold text-fgd-1 text-xl">
            {vaults.usdcBalance}
          </div>
        </div>
      </Card>
      <Card title="Total $MNGO for sale">
        <div className="flex">
          <img className="h-7 mr-2 w-auto" src="/logo.svg" alt="MNGO" />
          <div className="font-bold text-fgd-1 text-xl">
            {vaults.mangoBalance}
          </div>
        </div>
      </Card>
      {/* 
      <Card title="Estimated token price">
        <div className="flex">
          <img
            alt="USDC"
            width="25"
            height="25"
            src="/icons/usdc.svg"
            className={`mr-2`}
          />{' '}
          <div className="font-bold text-fgd-1 text-xl">
            {vaults.estimatedPrice
              ? numberFormat.format(vaults.estimatedPrice)
              : 'N/A'}
          </div>
        </div>
      </Card>
      */}
    </div>
  )
}

export default PoolInfoCards
