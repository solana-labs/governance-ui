import { useRouter } from 'next/router'
import useRealm from '../hooks/useRealm'
import Button from './Button'

const TokenBalanceCard = () => {
  const router = useRouter()
  const { symbol } = router.query
  const { ownTokenRecord } = useRealm(symbol as string)
  return (
    <div className="bg-bkg-2 p-6 rounded-md">
      <h3 className="mb-4">Deposit Tokens</h3>

      <div className="flex space-x-4 items-center">
        <div className="bg-bkg-1 px-4 py-2 rounded w-full">
          <p className="text-fgd-3 text-xs">{symbol} Votes</p>
          <div className="font-bold">
            {ownTokenRecord
              ? ownTokenRecord.info.governingTokenDepositAmount.toNumber()
              : '0'}
          </div>
        </div>
      </div>

      <div className="flex pt-6 space-x-4">
        <Button className="w-1/2">Deposit</Button>
        <Button className="w-1/2">Withdraw</Button>
      </div>
    </div>
  )
}

export default TokenBalanceCard
