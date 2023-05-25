import { useEffect, useMemo } from 'react'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import { useRealmQuery } from './queries/realm'
import { useRealmGovernancesQuery } from './queries/governance'
import useLegacyConnectionContext from './useLegacyConnectionContext'

export default function useHandleGovernanceAssetsStore() {
  const realm = useRealmQuery().data?.result

  const connection = useLegacyConnectionContext()

  const governancesArray = useRealmGovernancesQuery().data
  const governancesByGovernance = useMemo(
    () =>
      governancesArray &&
      Object.fromEntries(governancesArray.map((x) => [x.pubkey.toString(), x])),
    [governancesArray]
  )
  const { setGovernancesArray } = useGovernanceAssetsStore()

  useEffect(() => {
    if (realm && governancesByGovernance) {
      setGovernancesArray(connection, realm, governancesByGovernance)
    }
  }, [connection, governancesByGovernance, realm, setGovernancesArray])
}
