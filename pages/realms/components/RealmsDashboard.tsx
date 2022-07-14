import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'
import RealmsGrid from './RealmsGrid'
import { BsLayoutWtf, BsCheck } from 'react-icons/bs'

const RealmBox = ({ goToRealm, realm }) => {
  return (
    <div
      onClick={() => goToRealm(realm)}
      className="flex flex-col items-center justify-center p-8 rounded-lg cursor-pointer bg-bkg-2 default-transition hover:bg-bkg-3"
    >
      <div className="pb-5">
        {realm.ogImage ? (
          <div className="bg-[rgba(255,255,255,0.06)] rounded-full h-16 w-16 flex items-center justify-center">
            <img className="w-10" src={realm.ogImage}></img>
          </div>
        ) : (
          <div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex font-bold items-center justify-center rounded-full text-fgd-3">
            {realm.displayName?.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="text-center break-all">
        {realm.displayName ?? realm.symbol}
      </h3>
    </div>
  )
}

export default function RealmsDashboard({
  realms,
  isSearching,
  isLoading,
  editing,
}: {
  realms: readonly RealmInfo[]
  isSearching: boolean
  isLoading: boolean
  editing: boolean
}) {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()

  const [editingUnchartedRealms, setEditingUnchartedRealms] = useState(false)

  const goToRealm = (realmInfo: RealmInfo) => {
    const symbol =
      realmInfo.isCertified && realmInfo.symbol
        ? realmInfo.symbol
        : realmInfo.realmId.toBase58()
    const url = fmtUrlWithCluster(`/dao/${symbol}`)
    router.push(url)
  }

  const certifiedRealms = useMemo(() => realms?.filter((r) => r.isCertified), [
    realms,
  ])

  const unchartedRealms = useMemo(() => realms?.filter((r) => !r.isCertified), [
    realms,
  ])

  return isLoading ? (
    <div className="grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <div className="col-span-1 rounded-lg animate-pulse bg-bkg-2 h-44" />
      <div className="col-span-1 rounded-lg animate-pulse bg-bkg-2 h-44" />
      <div className="col-span-1 rounded-lg animate-pulse bg-bkg-2 h-44" />
      <div className="col-span-1 rounded-lg animate-pulse bg-bkg-2 h-44" />
      <div className="col-span-1 rounded-lg animate-pulse bg-bkg-2 h-44" />
      <div className="col-span-1 rounded-lg animate-pulse bg-bkg-2 h-44" />
      <div className="col-span-1 rounded-lg animate-pulse bg-bkg-2 h-44" />
      <div className="col-span-1 rounded-lg animate-pulse bg-bkg-2 h-44" />
      <div className="col-span-1 rounded-lg animate-pulse bg-bkg-2 h-44" />
      <div className="col-span-1 rounded-lg animate-pulse bg-bkg-2 h-44" />
    </div>
  ) : (
    <>
      {!isSearching ? (
        <RealmsGrid
          realms={certifiedRealms}
          editing={editing}
          storageVariable={'certifiedRealms'}
        />
      ) : (
        <>
          <div className="grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {certifiedRealms?.length > 0 ? (
              certifiedRealms.map((realm: RealmInfo) => (
                <RealmBox
                  key={realm.realmId.toString()}
                  goToRealm={goToRealm}
                  realm={realm}
                />
              ))
            ) : (
              <div className="col-span-5 p-8 text-center rounded-lg bg-bkg-2">
                <p>No results</p>
              </div>
            )}
          </div>
        </>
      )}
      <div className="pt-12">
        <div className="flex items-center justify-between">
          <h2 className="mb-4">Unchartered DAOs</h2>
          <button
            className="bg-bkg-2 default-transition flex items-center justify-center h-10 rounded-full w-10 hover:bg-bkg-3"
            onClick={() => setEditingUnchartedRealms(!editingUnchartedRealms)}
          >
            {editingUnchartedRealms ? (
              <BsCheck className="h-6 w-6 text-fgd-1" />
            ) : (
              <BsLayoutWtf className="h-4 text-fgd-1 w-4" />
            )}
          </button>
        </div>
        {!isSearching ? (
          <RealmsGrid
            realms={unchartedRealms}
            editing={editingUnchartedRealms}
            storageVariable={'unchartedRealms'}
          />
        ) : (
          <>
            <div className="grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {unchartedRealms?.length > 0 ? (
                unchartedRealms.map((realm: RealmInfo) => (
                  <RealmBox
                    key={realm.realmId.toString()}
                    goToRealm={goToRealm}
                    realm={realm}
                  />
                ))
              ) : (
                <div className="col-span-5 p-8 text-center rounded-lg bg-bkg-2">
                  <p>No results</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
