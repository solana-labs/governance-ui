import { useMemo, useState } from 'react'

import { getCertifiedRealmInfos, RealmInfo } from '../../models/registry/api'

import { SearchIcon } from '@heroicons/react/outline'
import useWalletStore from '../../stores/useWalletStore'
import useQueryContext from '@hooks/useQueryContext'
import Button from '@components/Button'
import { notify } from '@utils/notifications'
import { useRouter } from 'next/router'
import Input from '@components/inputs/Input'
import dynamic from 'next/dynamic'

import { BsLayoutWtf, BsCheck } from 'react-icons/bs'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

const RealmsDashboard = dynamic(() => import('./components/RealmsDashboard'))

const Realms = () => {
  const [realms, setRealms] = useState<ReadonlyArray<RealmInfo>>([])
  const [filteredRealms, setFilteredRealms] = useState<
    ReadonlyArray<RealmInfo>
  >([])
  const [isLoadingRealms, setIsLoadingRealms] = useState(true)
  const [editingGrid, setEditingGrid] = useState(false)
  const { actions, selectedRealm } = useWalletStore((s) => s)
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
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
      const [
        certifiedRealms, //uncharteredRealms
      ] = await Promise.all([
        getCertifiedRealmInfos(connection),
        // getUnchartedRealmInfos(connection),
      ])
      const allRealms = [
        ...certifiedRealms,
        //...uncharteredRealms
      ]
      setRealms(sortDaos(allRealms))
      setFilteredRealms(sortDaos(allRealms))
      setIsLoadingRealms(false)
    }
    if (selectedRealm.realm) {
      actions.deselectRealm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [connection.cluster, connection.endpoint, connection.current.commitment])

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
        <div className="flex space-x-4 items-center">
          <div className="w-10 h-10">
            <button
              className="bg-bkg-2 default-transition flex items-center justify-center h-10 rounded-full w-10 hover:bg-bkg-3"
              onClick={() => setEditingGrid(!editingGrid)}
            >
              {editingGrid ? (
                <BsCheck className="h-6 w-6 text-fgd-1" />
              ) : (
                <BsLayoutWtf className="h-4 text-fgd-1 w-4" />
              )}
            </button>
          </div>
          <Input
            className="pl-8"
            value={searchString}
            type="text"
            onChange={(e) => filterDaos(e.target.value)}
            placeholder={`Search DAOs...`}
            prefix={<SearchIcon className="w-5 h-5 text-fgd-3" />}
          />
          {!editingGrid && (
            <Button
              className="whitespace-nowrap"
              onClick={handleCreateRealmButtonClick}
            >
              Create DAO
            </Button>
          )}
        </div>
      </div>
      <RealmsDashboard
        realms={realms}
        filteredRealms={filteredRealms}
        isLoading={isLoadingRealms}
        editing={editingGrid}
        searching={searchString.length > 0}
        clearSearch={() => filterDaos('')}
        cluster={cluster}
      ></RealmsDashboard>
    </div>
  )
}

export default Realms
