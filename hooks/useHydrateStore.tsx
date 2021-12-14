import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useWalletStore from '../stores/useWalletStore'

export default function useHydrateStore() {
  const router = useRouter()
  const { symbol, cluster, pk } = router.query
  const selectedRealmMints = useWalletStore((s) => s.selectedRealm.mints)
  const { fetchRealmBySymbol, fetchProposal } = useWalletStore((s) => s.actions)

  useEffect(() => {
    fetchRealmBySymbol(cluster as string, symbol as string)
  }, [symbol, cluster])

  useEffect(() => {
    if (pk && Object.entries(selectedRealmMints).length > 0) {
      fetchProposal(pk)
    }
  }, [pk, selectedRealmMints])
}
