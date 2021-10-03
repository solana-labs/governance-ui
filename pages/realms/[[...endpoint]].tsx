import React, { useEffect, useState } from 'react'
import { getAllRealmInfos, RealmInfo } from '../../models/registry/api'
// import Input from '../../components/Input'
// import Button from '../../components/Button'
import { useRouter } from 'next/router'
import useWalletStore from '../../stores/useWalletStore'
import Loading from '../../components/Loading'
import { EndpointTypes } from '../../models/types'

// const COL = 'flex-col'
// const ROW = 'flex-row'

const Realms = () => {
  const router = useRouter()

  //TODO when we fetch realms data from api add loader handling
  const isLoading = false
  const [realms, setRealms] = useState([])
  // const [realmsSearchResults, setSearchResult] = useState([])
  // const [search, setSerach] = useState('')
  // const [viewType, setViewType] = useState(ROW)
  const { actions, selectedRealm } = useWalletStore((s) => s)
  const endpoint = router.query.endpoint
    ? (router.query.endpoint[0] as EndpointTypes)
    : 'mainnet'
  useEffect(() => {
    const data: RealmInfo[] = getAllRealmInfos(endpoint)
    setRealms(data)
    if (selectedRealm.realm) {
      actions.deselectRealm()
    }
  }, [endpoint])

  // useEffect(() => {
  //   const results = realms.filter((realm: RealmInfo) =>
  //     realm.symbol.toLowerCase().includes(search.toLowerCase())
  //   )
  //   setSearchResult(results)
  // }, [search, realms])

  const goToRealm = ({ name }) => {
    router.push(`/dao/${name}`)
  }

  return (
    <div>
      <h1 className="mb-6">Organizations</h1>
      {/* Re-instate when there are enough DAOs for this to be useful. Maybe > 25 */}
      {/* <div className="mb-10 flex">
        <Input
          value={search}
          type="text"
          onChange={(e) => setSerach(e.target.value)}
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
          realms.map((realm: RealmInfo) => (
            <div
              onClick={() => goToRealm({ name: realm.symbol })}
              className="bg-bkg-2 border border-bkg-3 cursor-pointer default-transition flex flex-col items-center p-8 rounded-lg hover:bg-bkg-3"
              key={realm.realmId.toString()}
            >
              <div className="pb-5">
                {realm.ogImage ? (
                  <div className="bg-[rgba(255,255,255,0.1)] rounded-full h-16 w-16 flex items-center justify-center">
                    <img className="w-10" src={realm.ogImage}></img>
                  </div>
                ) : (
                  <div className="bg-[rgba(255,255,255,0.1)] h-16 w-16 flex font-bold items-center justify-center rounded-full text-fgd-3">
                    {realm.symbol?.charAt(0)}
                  </div>
                )}
              </div>
              <h3>{realm.symbol}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Realms
