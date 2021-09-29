import React, { useEffect, useState } from 'react'
import { getAllRealmInfos, RealmInfo } from '../../models/registry/api'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useRouter } from 'next/router'
import useWalletStore from '../../stores/useWalletStore'
import Loading from '../../components/Loading'

const COL = 'flex-col'
const ROW = 'flex-row'

const Realms = () => {
  const router = useRouter()

  //TODO when we fetch realms data from api add loader handling
  const isLoading = false
  const [realms, setRealms] = useState([])
  const [realmsSearchResults, setSearchResult] = useState([])
  const [search, setSerach] = useState('')
  const [viewType, setViewType] = useState(ROW)
  const { actions, selectedRealm } = useWalletStore((s) => s)

  useEffect(() => {
    const data: RealmInfo[] = getAllRealmInfos()
    setRealms(data)
    if (selectedRealm.realm) {
      actions.deselectRealm()
    }
  }, [])

  useEffect(() => {
    const results = realms.filter((realm: RealmInfo) =>
      realm.symbol.toLowerCase().includes(search.toLowerCase())
    )
    setSearchResult(results)
  }, [search, realms])

  const goToRealm = ({ name }) => {
    router.push(`/dao/${name}`)
  }

  return (
    <div>
      <div className="mb-10">Organizations</div>
      <div className="mb-10 flex">
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
      </div>
      <div className={`flex flex-wrap ${viewType}`}>
        {isLoading ? (
          <Loading></Loading>
        ) : (
          realmsSearchResults.map((realm: RealmInfo) => (
            <div
              onClick={() => goToRealm({ name: realm.symbol })}
              className="flex flex-col flex-1 p-10 items-center border-gray-500 border cursor-pointer hover:border-white"
              key={realm.realmId.toString()}
            >
              <div className="pb-5">
                {realm.ogImage ? (
                  <img width="80px" src={realm.ogImage}></img>
                ) : (
                  <div className="rounded-full h-20 w-20 flex items-center justify-center border-2 font-bold border-gray-500 text-gray-300">
                    {realm.symbol?.charAt(0)}
                  </div>
                )}
              </div>
              <div>{realm.symbol}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Realms
