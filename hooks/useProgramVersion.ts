import {
  V2_DEFAULT_GOVERNANCE_PROGRAM_ID,
  V3_DEFAULT_GOVERNANCE_PROGRAM_ID,
} from '@components/instructions/tools'
import { useRouter } from 'next/router'
import useWalletStore from 'stores/useWalletStore'

const CACHE = {
  [V3_DEFAULT_GOVERNANCE_PROGRAM_ID]: 3,
  GTesTBiEWE32WHXXE2S4XbZvA5CrEc4xs6ZgRe895dP: 2,
  [V2_DEFAULT_GOVERNANCE_PROGRAM_ID]: 2,
} as const

const useProgramVersion = () => {
  const router = useRouter()
  const { symbol } = router.query
  const cachedVersion = CACHE[symbol as string]

  const queriedVersion = useWalletStore((s) => s.selectedRealm.programVersion)
  return cachedVersion ?? queriedVersion
}

export default useProgramVersion
