import usePool from '../hooks/usePool'
import useVaults from '../hooks/useVaults'
import PoolCountdown from './PoolCountdown'

const Card = (props: any) => {
  return (
    <div
      className="m-2 p-4 rounded-lg"
      style={{ backgroundColor: 'rgba(44, 41, 66, 1)' }}
    >
      <p className="pb-2">{props.title}</p>
      {props.children}
    </div>
  )
}

const PoolInfoCards = () => {
  const { endIdo, endDeposits } = usePool()
  const vaults = useVaults()

  return (
    <div className="flex flex-row justify-center mb-12">
      <Card title="Deposits closing in">
        <PoolCountdown date={endDeposits} />
      </Card>

      <Card title="Sale event ends in">
        <PoolCountdown date={endIdo} />
      </Card>

      <Card title="Total $MNGO for sale">
        <div className="flex">
          <img className="h-5 mr-1 w-auto" src="/logo.svg" alt="MNGO" />
          <div className="font-bold text-fgd-1 text-base">
            {vaults.mangoBalance}
          </div>
        </div>
      </Card>

      <Card title="Total contributions">
        <div className="flex">
          <img
            alt="USDC"
            width="20"
            height="20"
            src="/icons/usdc.svg"
            className={`mr-1`}
          />{' '}
          <div className="font-bold text-fgd-1 text-base">
            {vaults.usdcBalance}
          </div>
        </div>
      </Card>

      <Card title="Estimated token price">
        <div className="flex">
          <img
            alt="USDC"
            width="20"
            height="20"
            src="/icons/usdc.svg"
            className={`mr-1`}
          />{' '}
          <div className="font-bold text-fgd-1 text-base">
            {vaults.estimatedPrice.substring(0, 9)}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default PoolInfoCards
