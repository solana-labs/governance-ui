import useProgramSelector from '@components/Mango/useProgramSelector'
import UseMangoV4 from '@hooks/useMangoV4'
import { useTotalTreasuryPrice } from '@hooks/useTotalTreasuryPrice'
import { fetchMangoAccounts } from '@hooks/useTreasuryInfo/assembleWallets'
import { convertAccountToAsset } from '@hooks/useTreasuryInfo/convertAccountToAsset'
import { Asset } from '@models/treasury/Asset'
import { formatNumber } from '@utils/formatNumber'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'

const HoldTokensTotalPrice = () => {
  const { totalPriceFormatted, assetAccounts } = useTotalTreasuryPrice()

  const programSelectorHook = useProgramSelector()
  const { mangoClient, mangoGroup } = UseMangoV4(
    programSelectorHook.program?.val,
    programSelectorHook.program?.group
  )
  const [mangoAccountsValue, setMangoAccountsValue] = useState(new BigNumber(0))
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    async function fetchMangoValue() {
      const assets = (
        await Promise.all(assetAccounts.map((a) => convertAccountToAsset(a)))
      ).filter((asset): asset is Asset => asset !== null)

      const { mangoAccountsValue: newMangoValue } = await fetchMangoAccounts(
        assets!,
        mangoClient!,
        mangoGroup
      )

      setMangoAccountsValue(newMangoValue)
    }
    if (assetAccounts.length > 0 && isFetching && mangoClient && mangoGroup) {
      fetchMangoValue().finally(() => {
        setIsFetching(false)
      })
    }
  }, [assetAccounts, isFetching, mangoClient, mangoGroup])

  return (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
      <p className="text-fgd-3">Treasury Balance</p>
      <span className="hero-text">
        {isFetching
          ? 'Fetching ...'
          : `$${formatNumber(
              totalPriceFormatted.gt(0)
                ? totalPriceFormatted.plus(mangoAccountsValue)
                : mangoAccountsValue
            )}`}
      </span>
    </div>
  )
}

export default HoldTokensTotalPrice
