import { RealmInfo } from '@models/registry/api'
import React, { useMemo } from 'react'
import RealmsGrid from './RealmsGrid'

export default function RealmsDashboard({
  realms,
  filteredRealms,
  isLoading,
  editing,
  searching,
  clearSearch,
}: {
  realms: readonly RealmInfo[]
  filteredRealms: readonly RealmInfo[]
  isLoading: boolean
  editing: boolean
  searching: boolean
  clearSearch: () => void
}) {
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
    <RealmsGrid
      certifiedRealms={certifiedRealms}
      unchartedRealms={unchartedRealms}
      filteredRealms={filteredRealms}
      editing={editing}
      searching={searching}
      clearSearch={clearSearch}
    />
  )
}
