import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { getRealmInfo } from '../models/registry/api'
import { EndpointTypes } from '../models/types'
import useWalletStore from '../stores/useWalletStore'

export default function useHydrateStore() {
  const router = useRouter()
  const { symbol, cluster, pk } = router.query
  const connection = useWalletStore((s) => s.connection)
  const selectedRealmMints = useWalletStore((s) => s.selectedRealm.mints)
  const {
    fetchAllRealms,
    fetchRealm,
    fetchProposal,
    setConnectionContext,
  } = useWalletStore((s) => s.actions)

  useEffect(() => {
    setConnectionContext(cluster ? (cluster as EndpointTypes) : 'mainnet')
  }, [cluster])

  useEffect(() => {
    const fetch = async () => {
      const realmInfo = await getRealmInfo(symbol as string, connection)
      if (realmInfo) {
        await fetchAllRealms(realmInfo.programId)
        fetchRealm(realmInfo.programId, realmInfo.realmId)
      }
    }
    fetch()
  }, [symbol, connection])

  useEffect(() => {
    const fetch = async () => {
      if (pk && Object.entries(selectedRealmMints).length > 0) {
        await fetchProposal(pk)
      }
    }
    fetch()
  }, [pk, selectedRealmMints])
}
