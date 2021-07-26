import PoolCountdown from './PoolCountdown'
import useVaults from '../hooks/useVaults'
import usePool from '../hooks/usePool'
import 'twin.macro'

const StatsModal = () => {
  const vaults = useVaults()
  const { endIdo, endDeposits } = usePool()

  // const mangoRedeemable = vaults.usdc
  //   ? (redeemableBalance * vaults.mango.balance) / vaults.usdc.balance
  //   : 0

  const priceFormat = new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 4,
  })

  return (
    <>
      <div className="flex-1 m-3 sm:-ml-8 bg-secondary-4-dark backdrop-filter backdrop-blur-md bg-opacity-40 border border-bkg-3  p-7 rounded-xl shadow-md divide-y-2 divide-white divide-opacity-5 z-0">
        <div className="pb-4 text-center">
          <p className="text-fgd-3">Deposits Close</p>
          <PoolCountdown date={endDeposits} className="justify-center pt-1" />
        </div>

        <div className="py-4 text-center">
          <p className="text-fgd-3">Withdrawals Close</p>
          <PoolCountdown date={endIdo} className="justify-center pt-1" />
        </div>

        <div className="py-4 text-center">
          <p className="text-fgd-3">Estimated Token Price</p>
          <div className="flex items-center justify-center pt-0.5">
            <img
              alt=""
              width="20"
              height="20"
              src="/icons/usdc.svg"
              className={`mr-2`}
            />
            <div className="font-bold text-fgd-1 text-xl">
              {priceFormat.format(vaults.estimatedPrice)}
            </div>
          </div>
        </div>
        <div className="py-4 text-center">
          <p className="text-fgd-3">Total USDC Deposited</p>
          <div className="flex items-center justify-center pt-0.5">
            <div className="font-bold text-fgd-1 text-base">
              {vaults.usdcBalance}
            </div>
          </div>
        </div>
        <div className="pt-4 text-center">
          <p className="text-fgd-3">Locked MNGO in Pool</p>
          <div className="flex items-center justify-center pt-0.5">
            <img className="h-5 mr-2 w-auto" src="/logo.svg" alt="mango" />
            <div className="font-bold text-fgd-1 text-base">
              {vaults.mangoBalance}
            </div>
        </div>

        {/* <p>
              Start: {startIdo?.fromNow()} ({startIdo?.format()})
              </p>
            <p>
              End Deposits: {endDeposits?.fromNow()} ({endDeposits?.format()})
            </p>
            <p>
              End Withdraws: {endIdo?.fromNow()} ({endIdo?.format()})
            </p>
            <p>Current USDC in Pool: {vaults.usdc?.balance || 'N/A'}</p>
            <p>Locked MNGO in Pool: {vaults.mango?.balance || 'N/A'}</p> */}
          </div>
      </div>
    </>
  )
}

export default StatsModal
