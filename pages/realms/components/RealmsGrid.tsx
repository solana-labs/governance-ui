import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'
import GridLayout from 'react-grid-layout'
import "/node_modules/react-grid-layout/css/styles.css"
import "/node_modules/react-resizable/css/styles.css"
import { withSize } from 'react-sizeme'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { LastUpdateLayout } from '@solendprotocol/solend-sdk'

const SAVED_GRID = "realmsGrid"

export default function RealmsGrid({
  realms,
}: {
  realms: readonly RealmInfo[]
}) {

    useEffect(() => {
        console.log(layout)
    })

    const [layout, setLayout] = useState(generateLayout())
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


  function generateLayout() {    
    let currX = 0;
    return realms.map((realm) => {
        let obj;
        const savedItem = localStorage.getItem(SAVED_GRID);
        if (savedItem) {
            obj = JSON.parse(savedItem).find(item => item['i'] == realm.realmId.toString());
        } else {
            obj = {
                i: realm.realmId.toString(),
                x: currX,
                y: 0,
                w: 2,
                h: 3
            }    
        }
        currX = (currX + 2) % 10
        return obj;
    })
  }

  const updateLayout = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem(SAVED_GRID, JSON.stringify(newLayout));
  } 

  return (
    <GridLayout
    className="layout"
    layout={layout}
    cols={10}
    rowHeight={50}
    width={1200}
    onLayoutChange={(layout) => updateLayout(layout)}
    >
        {realms.length > 0 && realms.map((realm) => (
            <div
              onClick={() => goToRealm(realm)}
              className="flex flex-col items-center justify-center p-8 rounded-lg cursor-pointer bg-bkg-2 default-transition hover:bg-bkg-3"
              key={realm.realmId.toString()}
              data-grid={layout.find(item => item['i'] == realm.realmId.toString())}
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
        ))}
    </GridLayout>
  )
}