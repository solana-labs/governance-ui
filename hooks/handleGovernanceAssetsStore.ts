import { useEffect } from 'react'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import useWalletStore from 'stores/useWalletStore'
import useRealm from './useRealm'

export default function handleGovernanceAssetsStore() {
  const { governances, realm } = useRealm()
  const connection = useWalletStore((s) => s.connection)
  const {
    setGovernancesArray,
    setGovernedAccounts,
  } = useGovernanceAssetsStore()
  useEffect(() => {
    if (realm) {
      setGovernancesArray(governances)
      setGovernedAccounts(connection, realm)
    }
  }, [
    JSON.stringify(governances),
    realm?.pubkey.toBase58(),
    realm?.account.authority?.toBase58(),
  ])
}
