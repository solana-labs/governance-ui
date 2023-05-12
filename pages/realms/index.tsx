import { useMemo, useState } from 'react'

import {
  createUnchartedRealmInfo,
  getCertifiedRealmInfos,
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

import { BsLayoutWtf, BsCheck } from 'react-icons/bs'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { PublicKey } from '@solana/web3.js'
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools'
import { useRealmsByProgramQuery } from '@hooks/queries/realm'

const RealmsDashboard = dynamic(() => import('./components/RealmsDashboard'))

const Realms = () => {
  const [realms, setRealms] = useState<ReadonlyArray<RealmInfo>>([])
  const [filteredRealms, setFilteredRealms] = useState<
    ReadonlyArray<RealmInfo>
  >([])
  const [isLoadingRealms, setIsLoadingRealms] = useState(true)
  const [editingGrid, setEditingGrid] = useState(false)
  const { actions } = useWalletStore((s) => s)
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const [searchString, setSearchString] = useState('')
  const { cluster } = router.query
  //Small hack to prevent race conditions with cluster change until we remove connection from store and move it to global dep.
  const routeHasClusterInPath = router.asPath.includes('cluster')
  const programs = useMemo(
    () => new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID),
    []
  )
  const { data: queryRealms } = useRealmsByProgramQuery(programs)

  useMemo(async () => {
    if (
      connection &&
      ((routeHasClusterInPath && cluster) || !routeHasClusterInPath)
    ) {
      const [certifiedRealms] = await Promise.all([
        getCertifiedRealmInfos(connection),
      ])
      const unchartedRealms =
        queryRealms
          ?.filter(
            (x) => !certifiedRealms.find((y) => y.realmId.equals(x.pubkey))
          )
          .map((x) =>
            createUnchartedRealmInfo({
              name: x.account.name,
              programId: x.owner.toBase58(),
              address: x.pubkey.toBase58(),
            })
          ) ?? []
      const allRealms = [...certifiedRealms, ...unchartedRealms]
      setRealms(sortDaos(allRealms))
      setFilteredRealms(sortDaos(allRealms))
      setIsLoadingRealms(false)
    }
  }, [connection, routeHasClusterInPath, cluster, queryRealms])

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
