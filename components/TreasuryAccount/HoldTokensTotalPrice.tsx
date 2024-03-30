import { useTotalTreasuryPrice } from '@hooks/useTotalTreasuryPrice'
import { formatNumber } from '@utils/formatNumber'

const HoldTokensTotalPrice = () => {
  const { totalPriceFormatted, isFetching } = useTotalTreasuryPrice()

  return (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
      <p className="text-fgd-3">Treasury Balance</p>
      <span className="hero-text">
        {isFetching ? 'Fetching ...' : `$${formatNumber(totalPriceFormatted)}`}
      </span>
    </div>
  )
}

export default HoldTokensTotalPrice
