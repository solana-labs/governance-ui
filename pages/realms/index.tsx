import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { PlusIcon, XIcon } from '@heroicons/react/outline'
import { getAllRealmInfos, RealmInfo } from '../../models/registry/api'
// import Input from '../../components/Input'
// import Button from '../../components/Button'
import { useRouter } from 'next/router'
import useWalletStore from '../../stores/useWalletStore'
import Loading from '../../components/Loading'
import useQueryContext from '../../hooks/useQueryContext'
import { notify } from '@utils/notifications'
import { removeRealm } from 'actions/removeRealm'
import { PublicKey } from '@solana/web3.js'
import { RpcContext } from '@models/core/api'

// const COL = 'flex-col'
// const ROW = 'flex-row'

const Realms = () => {
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()

  //TODO when we fetch realms data from api add loader handling
  const [isLoading, setIsLoading] = useState(true)
  const [realms, setRealms] = useState<RealmInfo[]>([])
  //   const [realmsSearchResults, setSearchResult] = useState([])
  //   const [search, setSearch] = useState('')
  //   const [viewType, setViewType] = useState(ROW)
  const wallet = useWalletStore((s) => s.current)
  const { actions, selectedRealm, connected, connection } = useWalletStore(
    (s) => s
  )

  useMemo(async () => {
    if (connection) {
      setIsLoading(true)
      const data: RealmInfo[] = await getAllRealmInfos(connection)
      setRealms(data)
      setIsLoading(false)
    }
    if (selectedRealm.realm) {
      actions.deselectRealm()
    }
  }, [connection])

  //   useEffect(() => {
  //     const results = realms.filter((realm: RealmInfo) =>
  //       realm.symbol.toLowerCase().includes(search.toLowerCase())
  //     )
  //     setSearchResult(results)
  //   }, [search, realms])

  const goToRealm = ({ symbol }) => {
    const url = fmtUrlWithCluster(`/dao/${symbol}`)
    router.push(url)
  }

  const handleDeleteRealm = async (
    governanceProgramId: PublicKey,
    programVersion: number | undefined,
    realmId: string
  ) => {
    setIsLoading(true)
    try {
      const rpcContext = new RpcContext(
        governanceProgramId,
        programVersion,
        wallet,
        connection.current,
        connection.endpoint
      )
      await removeRealm(rpcContext, new PublicKey(realmId))
      const realms = await getAllRealmInfos(connection)
      setRealms(realms)
    } catch (ex) {
      console.log(ex)
      notify({ type: 'error', message: `${ex}` })
    }
    setIsLoading(false)
  }

  return (
    <div>
      <h1 className="mb-6">Organizations</h1>
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
      <div
        className={`grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`}
      >
        {isLoading ? (
          <Loading></Loading>
        ) : (
          <>
            {realms.map((realm: RealmInfo) => (
              <div
                className="bg-bkg-2 rounded-lg relative"
                key={realm.realmId.toString()}
              >
                {wallet?.publicKey && realm.creator?.equals(wallet?.publicKey) && (
                  <div
                    className="h-6 w-6 text-fgd-3 absolute top-2 right-2 hover:bg-bkg-3 cursor-pointer rounded-full default-transition p-1"
                    onClick={() =>
                      handleDeleteRealm(
                        realm.programId,
                        realm.programVersion,
                        realm.realmId.toString()
                      )
                    }
                  >
                    <XIcon />
                  </div>
                )}
                <div
                  onClick={() => goToRealm(realm)}
                  className="cursor-pointer default-transition flex flex-col items-center p-8 rounded-lg hover:bg-bkg-3 h-full"
                >
                  <div className="pb-5">
                    {realm.ogImage ? (
                      <div className="bg-[rgba(255,255,255,0.06)] rounded-full h-16 w-16 flex items-center justify-center">
                        <img className="w-10" src={realm.ogImage}></img>
                      </div>
                    ) : (
                      <div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex font-bold items-center justify-center rounded-full text-fgd-3">
                        {realm.symbol?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-center">
                    {realm.displayName ?? realm.symbol}
                  </h3>
                </div>
              </div>
            ))}
            {connected && (
              <Link href={fmtUrlWithCluster(`/realms/new`)}>
                <div className="bg-bkg-2 p-14 cursor-pointer default-transition flex flex-col items-center justify-center rounded-lg hover:bg-bkg-3">
                  <div className="bg-[rgba(255,255,255,0.06)] h-16 w-16 flex font-bold items-center justify-center rounded-full text-fgd-3">
                    <PlusIcon />
                  </div>
                </div>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Realms
