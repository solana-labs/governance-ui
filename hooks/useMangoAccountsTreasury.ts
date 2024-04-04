import useProgramSelector from '@components/Mango/useProgramSelector'
import BigNumber from 'bignumber.js'
import { useState, useEffect } from 'react'
import UseMangoV4 from './useMangoV4'
import { fetchMangoAccounts } from './useTreasuryInfo/assembleWallets'
import { convertAccountToAsset } from './useTreasuryInfo/convertAccountToAsset'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import { Asset } from '@models/treasury/Asset'
import { useRealmQuery } from './queries/realm'

export function useMangoAccountsTreasury(assetAccounts: AssetAccount[]) {
  const programSelectorHook = useProgramSelector()
  const { mangoClient, mangoGroup } = UseMangoV4(
    programSelectorHook.program?.val,
    programSelectorHook.program?.group
  )
  const [mangoAccountsValue, setMangoAccountsValue] = useState(new BigNumber(0))
  const [isFetching, setIsFetching] = useState(true)
  const realm = useRealmQuery().data?.result

  useEffect(() => {
    async function fetchMangoValue() {
      setMangoAccountsValue(new BigNumber(0))
      const filteredAssetAccounts = assetAccounts.filter(
        (a) => a.type !== AccountType.PROGRAM && a.type !== AccountType.NFT
      )
      const assets = (
        await Promise.all(
          filteredAssetAccounts.map((a) => convertAccountToAsset(a))
        )
      ).filter((asset): asset is Asset => asset !== null)

      const { mangoAccountsValue: newMangoValue } = await fetchMangoAccounts(
        assets!,
        mangoClient!,
        mangoGroup
      )

      setMangoAccountsValue(newMangoValue)
    }
    if (
      assetAccounts.length > 0 &&
      isFetching &&
      mangoClient &&
      mangoGroup &&
      realm
    ) {
      fetchMangoValue().finally(() => {
        setIsFetching(false)
      })
    }
  }, [assetAccounts, isFetching, mangoClient, mangoGroup, realm])

  return {
    isFetching,
    mangoAccountsValue,
    setMangoAccountsValue,
    setIsFetching,
  }
}
