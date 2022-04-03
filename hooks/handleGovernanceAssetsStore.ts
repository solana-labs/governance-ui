import { useEffect } from 'react'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import useWalletStore from 'stores/useWalletStore'
import useRealm from './useRealm'

export default function handleGovernanceAssetsStore() {
  const { governances, realm } = useRealm()
  const connection = useWalletStore((s) => s.connection)
  const { setGovernancesArray } = useGovernanceAssetsStore()
  useEffect(() => {
    if (realm) {
      setGovernancesArray(connection, realm, governances)
    }
  }, [
    JSON.stringify(governances),
    realm?.pubkey.toBase58(),
    realm?.account.authority?.toBase58(),
  ])
}
