import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import Loading from '@components/Loading'
import useWalletStore from 'stores/useWalletStore'
import Button from '@components/Button'
import { notify } from '@utils/notifications'

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

  ////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////// Added - Masaya ////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  const [RNG, setRNG] = useState({
    logo: '',
    nameOfOrg: '',
    twitter: '',
    website: '',
    proposals: 0,
    governanceTokens: 0,
    balance: 0,
    members: 0,
  })

  //functions

  //onMouseEnter, get key of organisation and fill out state
  const getOrganisation = (e: any) => {
    settingState(e)
  }

  //set RNG state in one go
  //Overall function to set RNG state information
  const settingState = (e: any) => {
    //set RNG logo and nameOfOrg state function
    getOrgInfoJSON(e._targetInst.key)
  }

  //shows changes to state on console
  useEffect(() => {
    console.log(RNG)
  }, [RNG])

  //random number generator function
  const randomNumGen = (x: number) => {
    return Math.floor(Math.random() * x)
  }

  const getOrgInfoJSON = (key: string) => {
    //fetching key data from mainnet-beta.json file
    fetch('/realms/mainnet-beta.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((myJson) => {
        //setting RNG logo, nameOfOrg, twitter, and website based on key
        for (const file of myJson) {
          if (file.realmId === key) {
            setRNG({
              ...RNG,
              logo: file.ogImage,
              nameOfOrg: file.displayName,
              twitter: file.twitter,
              website: file.website,
              //set rest of RNG state with random numbers
              proposals: randomNumGen(100),
              governanceTokens: randomNumGen(100),
              balance: randomNumGen(1000000),
              members: randomNumGen(100),
            })
          }
        }
      })
  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

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
                onMouseEnter={(e) => getOrganisation(e)}
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
            ))}
          </>
        )}
      </div>
    </div>
  )
}
