import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import Loading from '@components/Loading'
import useWalletStore from 'stores/useWalletStore'
import Button from '@components/Button'
import { notify } from '@utils/notifications'
import TwitterIcon from '@components/TwitterIcon'

import ReactCardFlip from 'react-card-flip'

//Types for RNG state
type RNGtypes = {
  key: string
  logo: string
  symbol: string
  twitter: string
  website: string
  proposals: number
  governanceTokens: number
  balance: number
  members: number
}

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
  //boolean state for flipping a card...
  const [isFlipped, setIsFlipped] = useState(false)
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { connected, current: wallet } = useWalletStore((s) => s)

  //Stores information for the session, so that the numbers stay consistent
  const [sessionStorage, setSessionStorage] = useState(new Map())
  const [rNG, setRNG] = useState<RNGtypes>({
    key: '',
    logo: '',
    symbol: '',
    twitter: '',
    website: '',
    proposals: 1,
    governanceTokens: 1,
    balance: 1,
    members: 1,
  })

  //functions

  //onMouseEnter, get key of organisation and fill out state
  const getOrganisation = (e: any) => {
    setIsFlipped(!isFlipped)
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
    //if key doesn't exist within sessionStorage, add it in
    if (!sessionStorage.has(rNG.key)) {
      console.log('set new set')
      setSessionStorage(new Map(sessionStorage.set(rNG.key, rNG)))
    }
    //logging info on console
    console.log('Org Data: ', rNG, 'sessionStorage: ', sessionStorage)
  }, [rNG])

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
          if (sessionStorage.has(file.realmId) && file.realmId === key) {
            //get information that already exists from sessionStorage, setRNG to existing info
            setRNG({
              ...rNG,
              key: file.realmId,
              logo: sessionStorage.get(file.realmId).logo,
              symbol: sessionStorage.get(file.realmId).symbol,
              twitter: sessionStorage.get(file.realmId).twitter,
              website: sessionStorage.get(file.realmId).website,
              //set rest of RNG state with random numbers
              proposals: sessionStorage.get(file.realmId).proposals,
              governanceTokens: sessionStorage.get(file.realmId)
                .governanceTokens,
              balance: sessionStorage.get(file.realmId).balance,
              members: sessionStorage.get(file.realmId).members,
            })
          } else {
            //if it doesn't exists or is new, create new data
            if (file.realmId === key) {
              setRNG({
                ...rNG,
                key: file.realmId,
                logo: file.ogImage,
                symbol: file.symbol,
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
        }
      })
  }

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
              <ReactCardFlip
                isFlipped={isFlipped}
                flipDirection="horizontal"
                key={realm.realmId.toString()}
              >
                {/* card front side */}
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
                <div
                  className="bg-bkg-2 cursor-pointer default-transition flex flex-col items-center p-8 rounded-lg hover:bg-bkg-3"
                  onMouseLeave={(e) => getOrganisation(e)}
                  key={realm.realmId.toString()}
                  onClick={() => goToRealm(realm)}
                >
                  <div className="flex flex-row pb-3">
                    <div
                      className="flex
                    flex-wrap"
                    >
                      {rNG.logo ? (
                        <img
                          className="w-6 flex-none mr-1.5"
                          src={rNG.logo}
                        ></img>
                      ) : (
                        <span className="bg-[rgba(255,255,255,0.06)] h-8 w-8 mr-1.5 flex font-bold items-center justify-center rounded-full text-fgd-3">
                          {rNG.symbol.charAt(0)}
                        </span>
                      )}

                      <p>{rNG.symbol}</p>
                    </div>
                    <div className="flex pl-8">
                      <p className="pl-2 no-underline hover:underline">
                        <a href={rNG.website}>Website</a>
                      </p>
                      <a href={`http://twitter.com/${rNG.twitter}`}>
                        <TwitterIcon className={'w-6 ml-2'}></TwitterIcon>
                      </a>
                    </div>
                  </div>

                  <p>
                    <strong>Balance:</strong> {rNG.balance}
                  </p>
                  <p>
                    <strong>Members:</strong> {rNG.members}
                  </p>
                  <p>
                    <strong>Proposals:</strong> {rNG.proposals}
                  </p>
                </div>
              </ReactCardFlip>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
