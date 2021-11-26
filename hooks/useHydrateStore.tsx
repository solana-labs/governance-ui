import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { getRealmInfo } from '../models/registry/api'
import { EndpointTypes } from '../models/types'
import useWalletStore from '../stores/useWalletStore'

export default function useHydrateStore() {
  const router = useRouter()
  const { symbol, cluster, pk } = router.query
  const apiEndpoint = cluster ? (cluster as EndpointTypes) : 'mainnet'
  const selectedRealmMints = useWalletStore((s) => s.selectedRealm.mints)
  const {
    fetchAllRealms,
    fetchRealm,
    fetchProposal,
    setConnectionConfig,
  } = useWalletStore((s) => s.actions)
  useEffect(() => {
    const fetch = async () => {
      setConnectionConfig(apiEndpoint)
      const realmInfo = getRealmInfo(symbol as string, apiEndpoint)
      if (realmInfo) {
        await fetchAllRealms(realmInfo.programId)
        fetchRealm(realmInfo.programId, realmInfo.realmId)
      }
    }
    fetch()
  }, [symbol, cluster])

  useEffect(() => {
    const fetch = async () => {
      if (pk && Object.entries(selectedRealmMints).length > 0) {
        await fetchProposal(pk)
      }
    }
    fetch()
  }, [pk, selectedRealmMints])
}
