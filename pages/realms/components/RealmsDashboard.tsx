import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'

export default function RealmsDashboard({
  realms,
  isLoading,
}: {
  realms: readonly RealmInfo[]
  isLoading: boolean
}) {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { theme } = useTheme()

  const goToRealm = (realmInfo: RealmInfo) => {
    const symbol =
      realmInfo.isCertified && realmInfo.symbol
        ? realmInfo.symbol
        : realmInfo.realmId.toBase58()
    const url = fmtUrlWithCluster(`/dao/${symbol}`)
    router.push(url)
  }

  const certifiedRealms = useMemo(
    () => realms?.filter((r) => r.isCertified),
    [realms]
  )

  const unchartedRealms = useMemo(
    () => realms?.filter((r) => !r.isCertified),
    [realms]
  )

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
      <div className="grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {certifiedRealms?.length > 0 ? (
          certifiedRealms.map((realm: RealmInfo) => (
            <div
              onClick={() => goToRealm(realm)}
              className="flex flex-col items-center justify-center p-8 rounded-lg cursor-pointer bg-bkg-2 default-transition hover:bg-bkg-3"
              key={realm.realmId.toString()}
            >
              <div className="pb-5">
                {realm.ogImage ? (
                  <div
                    className={`${
                      theme === 'Dark'
                        ? 'bg-[rgba(255,255,255,0.06)]'
                        : 'bg-[rgba(0,0,0,0.06)]'
                    } rounded-full h-16 w-16 flex items-center justify-center`}
                  >
                    <img className="w-10" src={realm.ogImage}></img>
                  </div>
                ) : (
                  <div
                    className={`${
                      theme === 'Dark'
                        ? 'bg-[rgba(255,255,255,0.06)]'
                        : 'bg-[rgba(0,0,0,0.06)]'
                    } h-16 w-16 flex font-bold items-center justify-center rounded-full text-fgd-3`}
                  >
                    {realm.displayName?.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-center ">
                {realm.displayName ?? realm.symbol}
              </h3>
            </div>
          ))
        ) : (
          <div className="col-span-5 p-8 text-center rounded-lg bg-bkg-2">
            <p>No results</p>
          </div>
        )}
      </div>
      <div className="pt-12">
        <h2 className="mb-4">Unchartered DAOs</h2>
        <div className="grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {unchartedRealms?.length > 0 ? (
            unchartedRealms.map((realm: RealmInfo) => (
              <div
                onClick={() => goToRealm(realm)}
                className="flex flex-col items-center justify-center p-8 rounded-lg cursor-pointer bg-bkg-2 default-transition hover:bg-bkg-3"
                key={realm.realmId.toString()}
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
            ))
          ) : (
            <div className="col-span-5 p-8 text-center rounded-lg bg-bkg-2">
              <p>No results</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
