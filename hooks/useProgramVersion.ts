import { useRouter } from 'next/router'
import useWalletStore from 'stores/useWalletStore'

const CACHE = {
  '7e75Nwsz8i5i4NiDa43CNzKJ4AeQGyRimha46VKTM1Ls': 3,
  GTesTBiEWE32WHXXE2S4XbZvA5CrEc4xs6ZgRe895dP: 2,
  GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw: 2,
} as const

const useProgramVersion = () => {
  const router = useRouter()
  const { symbol } = router.query
  const cachedVersion = CACHE[symbol as string]

  const queriedVersion = useWalletStore((s) => s.selectedRealm.programVersion)
  return cachedVersion ?? queriedVersion
}

export default useProgramVersion
