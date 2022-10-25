import { ProgramAccount, Realm, getRealm } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

const useRealmAccount = (realmId?: PublicKey) => {
  const router = useRouter()
  const { cluster } = router.query
  //Small hack to prevent race conditions with cluster change until we remove connection from store and move it to global dep.
  const routeHasClusterInPath = router.asPath.includes('cluster')

  const connection = useWalletStore((s) => s.connection)
  const [
    realmAccount,
    setRealmAccount,
  ] = useState<ProgramAccount<Realm> | null>(null)

  useEffect(() => {
    async function fetchRealm() {
      if (
        connection &&
        ((routeHasClusterInPath && cluster) || !routeHasClusterInPath) &&
        realmId
      ) {
        const realm = await getRealm(connection.current, realmId)
        setRealmAccount(realm)
      } else setRealmAccount(null)
    }
    fetchRealm()
  }, [connection, realmId])

  return realmAccount
}

export default useRealmAccount
