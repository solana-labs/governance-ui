import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'

const SAVED_LAYOUTS = 'realmsGrid'

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function RealmsGrid({
  realms,
  editing,
}: {
  realms: readonly RealmInfo[]
  editing: boolean
}) {
  const columns = { lg: 10, md: 10, sm: 4, xs: 4, xxs: 4 }
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
  const [currBreakpoint, setCurrBreakpoint] = useState('lg')
  const [layouts, setLayouts] = useState({
    lg: generateLayout('lg'),
    md: generateLayout('md'),
    sm: generateLayout('sm'),
    xs: generateLayout('xs'),
    xxs: generateLayout('xxs'),
  })
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { theme } = useTheme()

  useEffect(() => {
    const savedGrid = localStorage.getItem(SAVED_LAYOUTS)
    if (savedGrid) {
      if (
        !JSON.parse(savedGrid)['lg'].find(
          (item) => item.i == realms[0].realmId.toString()
        )
      ) {
        localStorage.removeItem(SAVED_LAYOUTS)
      }
    }
    setLayouts({
      lg: generateLayout('lg'),
      md: generateLayout('md'),
      sm: generateLayout('sm'),
      xs: generateLayout('xs'),
      xxs: generateLayout('xxs'),
    })
  }, [realms])

  const goToRealm = (realmInfo: RealmInfo) => {
    const symbol =
      realmInfo.isCertified && realmInfo.symbol
        ? realmInfo.symbol
        : realmInfo.realmId.toBase58()
    const url = fmtUrlWithCluster(`/dao/${symbol}`)
    router.push(url)
  }

  function generateLayout(bp) {
    let currX = 0
    let savedGrid
    if (typeof window !== 'undefined') {
      savedGrid = localStorage.getItem(SAVED_LAYOUTS)
    }
    return (
      realms &&
      realms.map((realm) => {
        let obj
        if (savedGrid) {
          obj = JSON.parse(savedGrid)[bp].find(
            (item) => item?.i == realm.realmId.toString()
          )
        }
        if (!obj) {
          localStorage.removeItem(SAVED_LAYOUTS)
          obj = {
            i: realm.realmId.toString(),
            x: currX,
            y: 0,
            w: 2,
            h: 2,
          }
        }
        currX = (currX + 2) % columns[bp]
        return obj
      })
    )
  }

  const updateLayouts = (currentLayout, allLayouts) => {
    setLayouts(allLayouts)
    localStorage.setItem(SAVED_LAYOUTS, JSON.stringify(allLayouts))
  }

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={breakpoints}
      cols={columns}
      rowHeight={100}
      margin={[15, 15]}
      containerPadding={[0, 0]}
      onLayoutChange={(currentLayout, allLayouts) =>
        updateLayouts(currentLayout, allLayouts)
      }
      onBreakpointChange={(newBreakpoint) => setCurrBreakpoint(newBreakpoint)}
      isResizable={editing}
      isDraggable={editing}
    >
      {realms &&
        realms.map((realm) => (
          <div
            onClick={() => (editing ? null : goToRealm(realm))}
            className={`flex group flex-col items-center justify-center overflow-hidden p-8 rounded-lg cursor-pointer default-transition active:cursor-grabbing ${
              editing
                ? ` bg-bkg-4 opacity-75 cursor-grab`
                : `hover:bg-bkg-3 bg-bkg-2`
            }`}
            key={realm.realmId.toString()}
            data-grid={layouts[currBreakpoint].find(
              (item) => item?.i == realm.realmId.toString()
            )}
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
            <h3 className="text-center">{realm.displayName ?? realm.symbol}</h3>
          </div>
        ))}
    </ResponsiveGridLayout>
  )
}
