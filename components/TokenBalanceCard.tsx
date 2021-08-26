import { useRouter } from 'next/router'
import useRealm from '../hooks/useRealm'
import Button from './Button'

const TokenBalanceCard = () => {
  const router = useRouter()
  const { symbol } = router.query
  const { realmTokenAccount, ownTokenRecord } = useRealm(symbol as string)
  return (
    <div className="bg-bkg-2 p-6 rounded-md space-y-6">
      <h3 className="mb-4">MNGO balance</h3>

      <div className="flex space-x-4 items-center">
        <div>Deposited</div>
        <div className="col-span-3 bg-bkg-3 p-4 rounded">
          <div className="text-xl">
            {ownTokenRecord
              ? ownTokenRecord.info.governingTokenDepositAmount.toNumber()
              : 'N/A'}
          </div>
        </div>
      </div>
      <div className="flex space-x-4 items-center">
        <div>In Wallet</div>
        <div className="col-span-3 bg-bkg-3 p-4 rounded">
          <div className="text-xl">
            {realmTokenAccount
              ? realmTokenAccount.account.amount.toString()
              : 'N/A'}
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button className="w-1/2">Deposit</Button>
        <Button className="w-1/2">Withdraw</Button>
      </div>
    </div>
  )
}

export default TokenBalanceCard
