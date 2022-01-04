import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import Loading from '@components/Loading'
import useWalletStore from 'stores/useWalletStore'
import Button from '@components/Button'
import { notify } from '@utils/notifications'
import { getNumberOfProposalsInVotingState } from 'scripts/accountQueries'

export default function RealmsDashboard({
  realms,
  isLoading,
  showNewButton,
  header = 'Organisations',
}: {
  realms: readonly RealmInfo[]
  isLoading: boolean
  showNewButton?: boolean
  header?: string
}) {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()

  const { connected, current: wallet } = useWalletStore((s) => s)
  const [counts, setCounts] = useState({})

  useEffect(() => {
    const fetchBadgeCounts = async () => {
      setCounts(await getNumberOfProposalsInVotingState(realms))
    }
    // xxx: exclude badge counts for uncharted realms for now
    if (!header.match(/uncharted/i)) fetchBadgeCounts()
  }, [realms])

  const goToRealm = (realmInfo: RealmInfo) => {
    const symbol =
      realmInfo.isCertified && realmInfo.symbol
        ? realmInfo.symbol
        : realmInfo.realmId.toBase58()
    const url = fmtUrlWithCluster(`/dao/${symbol}`)
    router.push(url)
  }

  const handleCreateRealmButtonClick = async () => {
    if (!connected) {
      try {
        if (wallet) await wallet.connect()
      } catch (error) {
        const err = error as Error
        return notify({
          type: 'error',
          message: err.message,
        })
      }
    }
    router.push(fmtUrlWithCluster(`/realms/new`))
  }

  return (
    <div>
      {/* Re-instate when there are enough REALMs for this to be useful. Maybe > 25 */}
      {/* <div className="mb-10 flex">
            <Input
              value={search}
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search here...`}
            />
            <div className="flex flex-row ml-10">
              <Button className="mr-3" onClick={() => setViewType(COL)}>
                List
              </Button>
              <Button onClick={() => setViewType(ROW)}>Columns</Button>
            </div>
          </div> */}
      <div className="flex w-full justify-between mb-6">
        <h1>{header}</h1>
        {showNewButton && (
          <Button className="px-10 " onClick={handleCreateRealmButtonClick}>
            Create DAO
          </Button>
        )}
      </div>
      <div
        className={`grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`}
      >
        {isLoading ? (
          <Loading></Loading>
        ) : (
          <>
            {realms?.map((realm: RealmInfo) => (
              <div
                onClick={() => goToRealm(realm)}
                className="bg-bkg-2 cursor-pointer default-transition flex flex-col items-center p-8 rounded-lg hover:bg-bkg-3"
                key={realm.realmId.toString()}
              >
                <div className="pb-5 relative">
                  {realm.ogImage ? (
                    <div className="bg-[rgba(255,255,255,0.06)] rounded-full h-16 w-16 flex items-center justify-center">
                      <img className="w-10" src={realm.ogImage}></img>
                    </div>
                  ) : (
                    <div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex font-bold items-center justify-center rounded-full text-fgd-3">
                      {realm.displayName?.charAt(0)}
                    </div>
                  )}
                  <BadgeWithCount number={counts[realm.realmId.toString()]} />
                </div>
                <h3 className="text-center break-all">
                  {realm.displayName ?? realm.symbol}
                </h3>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function BadgeWithCount({ number }: { number: number }) {
  return number > 0 ? (
    <span className="inline-flex items-center justify-center px-2 py-1 mr-2 text-s font-bold leading-none text-primary bg-red rounded-full absolute -top-1 -right-3">
      {number}
    </span>
  ) : null
}
