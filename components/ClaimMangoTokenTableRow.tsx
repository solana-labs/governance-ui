import { MangoV3ReimbursementClient } from '@blockworks-foundation/mango-v3-reimbursement-lib/dist'
import { BN } from '@coral-xyz/anchor'
import { CheckIcon } from '@heroicons/react/solid'
import { PublicKey } from '@solana/web3.js'
import tokenPriceService from '@utils/services/tokenPrice'
import { useEffect, useState } from 'react'

function toDecimalAmount(amount: BN, decimals: number) {
  return amount.toNumber() / 10 ** decimals!
}

const usdFormatter = (value, decimals = 2, currency = true) => {
  if (decimals === 0) {
    value = Math.abs(value)
  }
  const config = currency ? { style: 'currency', currency: 'USD' } : {}
  return new Intl.NumberFormat('en-US', {
    ...config,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export type TableInfo = {
  nativeAmount: BN
  mintPubKey: PublicKey
  index: number
}

export type MintInfo = {
  decimals: number
  symbol: string
}

export type ReimbursementAccount = {
  claimTransferred: number
  reimbursed: number
}

const ClaimMangoTokensTableRow = ({
  mintsForAvailableAmounts,
  item,
  reimbursementAccount,
  reimbursementClient,
}: {
  mintsForAvailableAmounts: { [key: string]: MintInfo }
  item: TableInfo
  reimbursementAccount: ReimbursementAccount | null
  reimbursementClient: MangoV3ReimbursementClient
}) => {
  const mintPk = item.mintPubKey
  const symbol = mintsForAvailableAmounts[mintPk.toBase58()]?.symbol
  const mintInfo = mintsForAvailableAmounts[mintPk.toBase58()]
  const [isClaimed, setIsClaimed] = useState(false)
  const handleSetIsReimbused = async () => {
    const isTokenClaimed = await reimbursementClient!.reimbursed(
      reimbursementAccount,
      item.index
    )
    setIsClaimed(isTokenClaimed)
  }
  useEffect(() => {
    if (reimbursementClient && reimbursementAccount) {
      handleSetIsReimbused()
    } else {
      setIsClaimed(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    reimbursementClient !== null,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    reimbursementAccount && JSON.stringify(reimbursementAccount),
  ])
  const tokenInfo = tokenPriceService.getTokenInfo(item.mintPubKey.toBase58())
  return (
    <div className="grid grid-cols-12 items-center gap-3 rounded-md border border-th-bkg-3 p-4">
      <div className="col-span-5 flex flex-col overflow-hidden">
        <div className="flex items-center text-sm text-th-fgd-1">
          <img className="mr-2 w-5" src={tokenInfo?.logoURI}></img>
          {symbol}
        </div>
      </div>

      <div className="col-span-4 text-right">
        {mintInfo
          ? usdFormatter(
              toDecimalAmount(item.nativeAmount, mintInfo.decimals),
              mintInfo.decimals,
              false
            )
          : null}
      </div>
      <div className="col-span-3 flex justify-end">
        {isClaimed ? (
          <CheckIcon className="w-5 text-th-green"></CheckIcon>
        ) : (
          <span>—</span>
        )}
      </div>
    </div>
  )
}

export default ClaimMangoTokensTableRow
