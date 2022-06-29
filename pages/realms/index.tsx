import React, { useMemo, useState } from 'react'

import {
  getCertifiedRealmInfos,
  getUnchartedRealmInfos,
  RealmInfo,
} from '../../models/registry/api'

import { SearchIcon } from '@heroicons/react/outline'
import useWalletStore from '../../stores/useWalletStore'
import useQueryContext from '@hooks/useQueryContext'
import Button from '@components/Button'
import { notify } from '@utils/notifications'
import { useRouter } from 'next/router'
import Input from '@components/inputs/Input'
import dynamic from 'next/dynamic'

const RealmsDashboard = dynamic(() => import('./components/RealmsDashboard'))

const Realms = () => {
  const [realms, setRealms] = useState<ReadonlyArray<RealmInfo>>([])
  const [filteredRealms, setFilteredRealms] = useState<
    ReadonlyArray<RealmInfo>
  >([])
  const [isLoadingRealms, setIsLoadingRealms] = useState(true)
  const { actions, selectedRealm, connection } = useWalletStore((s) => s)
  const { connected, current: wallet } = useWalletStore((s) => s)
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const [searchString, setSearchString] = useState('')
  const { cluster } = router.query
  //Small hack to prevent race conditions with cluster change until we remove connection from store and move it to global dep.
  const routeHasClusterInPath = router.asPath.includes('cluster')

  useMemo(async () => {
    if (
      connection &&
      ((routeHasClusterInPath && cluster) || !routeHasClusterInPath)
    ) {
      const [certifiedRealms, uncharteredRealms] = await Promise.all([
        getCertifiedRealmInfos(connection),
        getUnchartedRealmInfos(connection),
      ])
      const allRealms = [...certifiedRealms, ...uncharteredRealms]
      setRealms(sortDaos(allRealms))
      setFilteredRealms(sortDaos(allRealms))
      setIsLoadingRealms(false)
    }
    if (selectedRealm.realm) {
      actions.deselectRealm()
    }
  }, [connection])

  const handleCreateRealmButtonClick = async () => {
    if (!connected) {
      try {
        if (wallet) {
          await wallet.connect()
        } else {
          throw new Error('You need to connect a wallet to continue')
        }
      } catch (error) {
        const err = error as Error
        let message = err.message

        if (err.name === 'WalletNotReadyError') {
          message = 'You must connect a wallet to create a DAO'
        }

        return notify({ message, type: 'error' })
      }
    }
    router.push(fmtUrlWithCluster(`/realms/new`))
  }
  const sortDaos = (realmInfoData: RealmInfo[]) => {
    return realmInfoData.sort((a: RealmInfo, b: RealmInfo) => {
      return (b.sortRank ?? -0) - (a.sortRank ?? -0)
    })
  }
  const filterDaos = (v) => {
    setSearchString(v)
    if (v.length > 0) {
      const filtered = realms.filter(
        (r) =>
          r.displayName?.toLowerCase().includes(v.toLowerCase()) ||
          r.symbol?.toLowerCase().includes(v.toLowerCase())
      )
      setFilteredRealms(filtered)
    } else {
      setFilteredRealms(realms)
    }
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between w-full mb-6">
        <h1 className="mb-4 sm:mb-0">DAOs</h1>
        <div className="flex space-x-4">
          <Input
            className="pl-8"
            value={searchString}
            type="text"
            onChange={(e) => filterDaos(e.target.value)}
            placeholder={`Search DAOs...`}
            prefix={<SearchIcon className="w-5 h-5 text-fgd-3" />}
          />
          <Button
            className="whitespace-nowrap"
            onClick={handleCreateRealmButtonClick}
          >
            Create DAO
          </Button>
        </div>
      </div>
      <RealmsDashboard
        realms={filteredRealms}
        isLoading={isLoadingRealms}
      ></RealmsDashboard>
    </div>
  )
}

export default Realms
