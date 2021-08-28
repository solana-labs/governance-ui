import { Connection } from '@solana/web3.js'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useWalletStore, { ENDPOINTS } from '../stores/useWalletStore'
import { REALMS } from './useRealm'

export default function useHydrateStore() {
  const router = useRouter()
  const { pk, symbol } = router.query
  const mints = useWalletStore((s) => s.mints)
  const setWalletStore = useWalletStore((s) => s.set)
  const { fetchAllRealms, fetchRealm, fetchProposal } = useWalletStore(
    (s) => s.actions
  )
  useEffect(() => {
    const fetch = async () => {
      const realmInfo = REALMS.find((r) => r.symbol === symbol)
      if (realmInfo) {
        setWalletStore((s) => {
          const ENDPOINT = ENDPOINTS.find((e) => e.name === realmInfo.endpoint)
          s.connection.cluster = ENDPOINT.name
          s.connection.current = new Connection(ENDPOINT.url, 'recent')
          s.connection.endpoint = ENDPOINT.url
        })
        await fetchAllRealms(realmInfo.programId)
        fetchRealm(realmInfo.programId, realmInfo.realmId)
      }
    }
    fetch()
  }, [symbol])

  useEffect(() => {
    const fetch = async () => {
      if (pk && Object.entries(mints).length > 0) {
        await fetchProposal(pk)
      }
    }
    fetch()
  }, [pk, mints])
}
