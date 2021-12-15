import React, { useMemo, useState } from 'react'

import {
  getCertifiedRealmInfos,
  getUnchartedRealmInfos,
  RealmInfo,
} from '../../models/registry/api'

import useWalletStore from '../../stores/useWalletStore'

import RealmsDashboard from './components/RealmsDashboard'

// const COL = 'flex-col'
// const ROW = 'flex-row'

const Realms = () => {
  const [isLoadingCertified, setIsLoadingCertified] = useState(true)
  const [certifiedRealms, setCertifiedRealms] = useState<
    ReadonlyArray<RealmInfo>
  >([])

  const [unchartedRealms, setUnchartedRealms] = useState<
    ReadonlyArray<RealmInfo>
  >([])
  const [isLoadingUncharted, setIsLoadingUncharted] = useState(true)

  const { actions, selectedRealm, connection } = useWalletStore((s) => s)

  useMemo(async () => {
    if (connection) {
      const data = await getCertifiedRealmInfos(connection)
      setCertifiedRealms(data)
      setIsLoadingCertified(false)
    }
    if (selectedRealm.realm) {
      actions.deselectRealm()
    }
  }, [connection])

  useMemo(async () => {
    if (connection) {
      const data = await getUnchartedRealmInfos(connection)
      setUnchartedRealms(data)
      setIsLoadingUncharted(false)
    }
    if (selectedRealm.realm) {
      actions.deselectRealm()
    }
  }, [connection])

  return (
    <div>
      <RealmsDashboard
        realms={certifiedRealms}
        isLoading={isLoadingCertified}
        showNewButton
      ></RealmsDashboard>
      <div className="mt-20">
        <RealmsDashboard
          realms={unchartedRealms}
          isLoading={isLoadingUncharted}
          header={'Uncharted Realms'}
        ></RealmsDashboard>
      </div>
    </div>
  )
}

export default Realms
