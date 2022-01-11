import { PublicKey } from '@solana/web3.js'

import useRealm from './useRealm'

/// Returns Governance for the given pk  from the current realm
export default function useRealmGovernance(governance: PublicKey) {
  const realm = useRealm()

  return realm.governances[governance.toBase58()]?.account
}
