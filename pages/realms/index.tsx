import { useEffect, useState } from 'react'
import { getAllRealmInfos, RealmInfo } from '../../models/registry/api'
import Input from '../../components/Input'
import Button from '../../components/Button'

const COL = 'flex-col'
const ROW = 'flex-row'

const Realms = () => {
  const [realms, setRealms] = useState([])
  const [search, setSerach] = useState('')
  const [viewType, setViewType] = useState(ROW)

  useEffect(() => {
    const data: RealmInfo[] = getAllRealmInfos()
    console.log(data)
    setRealms(data)
  }, [])
  return (
    <div className="mt-20">
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
        {realms
          .filter((realm: RealmInfo) =>
            search
              ? realm.symbol.toLowerCase().includes(search.toLowerCase())
              : realm
          )
          .map((realm: RealmInfo) => (
            <div
              className="flex flex-col flex-1 p-10 items-center border-gray-500 border"
              key={realm.realmId.toString()}
            >
              <div className="pb-5">
                <img src={realm.ogImage}></img>
              </div>
              <div>{realm.symbol}</div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default Realms
