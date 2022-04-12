import { useEffect } from 'react'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import useWalletStore from 'stores/useWalletStore'
import { usePrevious } from './usePrevious'
import useRealm from './useRealm'

export default function handleGovernanceAssetsStore() {
  const { governances, realm } = useRealm()
  const previousStringifyGovernances = usePrevious(
    JSON.stringify(Object.keys(governances))
  )
  const connection = useWalletStore((s) => s.connection)
  const { setGovernancesArray } = useGovernanceAssetsStore()
  useEffect(() => {
    if (
      realm &&
      previousStringifyGovernances !== JSON.stringify(Object.keys(governances))
    ) {
      setGovernancesArray(connection, realm, governances)
    }
  }, [
    JSON.stringify(Object.keys(governances)),
    realm?.pubkey.toBase58(),
    realm?.account.authority?.toBase58(),
  ])
}
