import { useTheme } from 'next-themes'
import React, { useEffect, useState, useMemo } from 'react'
import GridLayout from 'react-grid-layout'
import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { withSize } from 'react-sizeme'

function RealmsGrid({
  realms,
  editing,
  storageVariable,
  clearSearch,
  size,
}: {
  realms: readonly RealmInfo[]
  editing: boolean
  storageVariable: string
  clearSearch: () => void
  size: { width: number | null }
}) {
  const [columns, setColumns] = useState(10)
  const [layout, setLayout] = useState(generateLayout(10))
  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { theme } = useTheme()
  const { width } = size

  useEffect(() => {
    if (width && width < 800 && columns != 4) {
      setColumns(4)
      setLayout(generateLayout(4))
    } else if (width && width >= 800 && width < 1000 && columns != 6) {
      setColumns(6)
      setLayout(generateLayout(6))
    } else if (width && width >= 1000 && columns != 10) {
      setColumns(10)
      setLayout(generateLayout(10))
    }
  }, [width])

  const goToRealm = (realmInfo: RealmInfo) => {
    const symbol =
      realmInfo.isCertified && realmInfo.symbol
        ? realmInfo.symbol
        : realmInfo.realmId.toBase58()
    const url = fmtUrlWithCluster(`/dao/${symbol}`)
    router.push(url)
  }

  function generateLayout(cols) {
    let currX = 0
    let savedGrid
    if (typeof window !== 'undefined') {
      savedGrid = localStorage.getItem(storageVariable + cols)
    }
    return (
      realms &&
      realms.map((realm) => {
        let obj
        if (savedGrid) {
          const grid = JSON.parse(savedGrid)
          obj = grid.find((item) => item?.i == realm.realmId.toString())
        }
        if (!obj) {
          obj = {
            i: realm.realmId.toString(),
            x: currX,
            y: 0,
            w: 2,
            h: 2,
          }
        }
        currX = (currX + 2) % cols
        return obj
      })
    )
  }

  const updateItem = (newLayout) => {
    setLayout(newLayout)
    localStorage.setItem(storageVariable + columns, JSON.stringify(newLayout))
  }

  const gridItems = useMemo(() => {
    return (
      realms &&
      realms.map(
        (realm) =>
          layout.find((item) => item?.i == realm.realmId.toString()) && (
            <div
              onClick={() => (editing ? null : goToRealm(realm))}
              className={`flex group flex-col items-center justify-center overflow-hidden p-8 rounded-lg cursor-pointer default-transition active:cursor-grabbing ${
                editing
                  ? ` bg-bkg-4 opacity-75 cursor-grab`
                  : `hover:bg-bkg-3 bg-bkg-2`
              }`}
              key={realm.realmId.toString()}
              data-grid={layout.find(
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
              <h3 className="text-center">
                {realm.displayName ?? realm.symbol}
              </h3>
            </div>
          )
      )
    )
  }, [realms, editing, layout])

  return (
    <GridLayout
      className="layout"
      layout={layout}
      width={width}
      cols={columns}
      rowHeight={100}
      margin={[15, 15]}
      containerPadding={[0, 0]}
      onDragStart={clearSearch}
      onDragStop={(layout) => updateItem(layout)}
      onResizeStart={clearSearch}
      onResizeStop={(layout) => updateItem(layout)}
      isResizable={editing}
      isDraggable={editing}
    >
      {gridItems}
    </GridLayout>
  )
}

export default withSize()(RealmsGrid)
