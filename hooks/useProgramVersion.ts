import {
  V2_DEFAULT_GOVERNANCE_PROGRAM_ID,
  V3_DEFAULT_GOVERNANCE_PROGRAM_ID,
} from '@components/instructions/tools'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import useWalletStore from 'stores/useWalletStore'

const useProgramVersion = () => {
  const router = useRouter()
  const { symbol } = router.query

  // @asktree: Why is this in the body of the hook despite depending on no data from it, you ask?
  // I was suddenly getting some insane `ReferenceError: Cannot access 'V3_DEFAULT_GOVERNANCE_PROGRAM_ID' before initialization` error that I cannot fathom.
  // Rather than lose time and braincells I am just going to put this constant in the body of the hook.
  const CACHE = useMemo(
    () =>
      ({
        [V3_DEFAULT_GOVERNANCE_PROGRAM_ID]: 3,
        GTesTBiEWE32WHXXE2S4XbZvA5CrEc4xs6ZgRe895dP: 2,
        [V2_DEFAULT_GOVERNANCE_PROGRAM_ID]: 2,
      } as const),
    []
  )

  const cachedVersion = CACHE[symbol as string] as 2 | 3 | undefined

  // TODO this should really return undefined, not 1, when we don't know the answer yet.
  const queriedVersion = useWalletStore(
    (s) => s.selectedRealm.programVersion as 1 | 2 | 3
  )
  return cachedVersion ?? queriedVersion
}

export default useProgramVersion
