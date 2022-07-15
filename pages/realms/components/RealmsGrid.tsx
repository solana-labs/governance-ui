import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'
import GridLayout, { Layout } from 'react-grid-layout'
import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { withSize } from 'react-sizeme'

const RealmBox = ({ editing, realm, theme }) => {
  return (
    <div
      className={`flex w-full h-full group flex-col items-center justify-center overflow-hidden p-8 rounded-lg cursor-pointer default-transition active:cursor-grabbing ${
        editing
          ? ` bg-bkg-4 opacity-75 cursor-grab hover:opacity-90`
          : `hover:bg-bkg-3 bg-bkg-2`
      }`}
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
  )
}

function RealmsGrid({
  certifiedRealms,
  unchartedRealms,
  filteredCertified,
  filteredUncharted,
  editing,
  searching,
  storageVariable,
  clearSearch,
  size,
}: {
  certifiedRealms: readonly RealmInfo[]
  unchartedRealms: readonly RealmInfo[]
  filteredCertified: readonly RealmInfo[]
  filteredUncharted: readonly RealmInfo[]
  editing: boolean
  searching: boolean
  storageVariable: string
  clearSearch: () => void
  size: { width: number }
}) {
  const [columns, setColumns] = useState(10)
  const [gridRealms, setGridRealms] = useState<readonly RealmInfo[]>(
    filteredCertified
  )
  const [draggedItem, setDraggedItem] = useState<string>()
  const [layout, setLayout] = useState<Layout>(generateLayout(10))

  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { theme } = useTheme()

  const { width } = size
  const GAP = 15
  const ROW_HEIGHT = 100

  const getNewRealms = () => {
    let newRealmIds, newRealms
    if (typeof window !== undefined) {
      newRealmIds = localStorage.getItem('newRealms')
    }
    if (newRealmIds) {
      newRealms = filteredUncharted.filter((item) =>
        newRealmIds.includes(item.realmId.toString())
      )
    }
    return newRealms
  }

  const getGridRealms = () => {
    const newRealms = getNewRealms()
    const r = newRealms
      ? filteredCertified.concat(newRealms)
      : filteredCertified
    setGridRealms(r)
  }

  useEffect(() => {
    getGridRealms()
  }, [filteredCertified])

  useEffect(() => {
    const cols = width < 800 ? 4 : width < 1000 ? 6 : 10
    if (columns != cols) setLayout(generateLayout(4))
    setColumns(cols)
    if (gridRealms.length > layout.length) {
      setLayout(generateLayout(cols))
    }
  }, [width, gridRealms])

  const goToRealm = (realmInfo: RealmInfo) => {
    console.log(realmInfo)
    const symbol =
      realmInfo.isCertified && realmInfo.symbol
        ? realmInfo.symbol
        : realmInfo.realmId.toBase58()
    const url = fmtUrlWithCluster(`/dao/${symbol}`)
    console.log(realmInfo.displayName ?? realmInfo.symbol, url)
    router.push(url)
  }

  function generateLayout(cols) {
    let currX = 0
    let savedGrid
    if (typeof window !== 'undefined') {
      savedGrid = localStorage.getItem(storageVariable + cols)
    }
    return (
      gridRealms &&
      gridRealms.map((realm) => {
        let obj
        if (savedGrid) {
          const grid = JSON.parse(savedGrid)
          obj = grid.find((item) => item?.i == realm?.realmId.toString())
        }
        if (!obj) {
          obj = {
            i: realm?.realmId.toString(),
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
    if (newLayout.length >= certifiedRealms.length)
      localStorage.setItem(storageVariable + columns, JSON.stringify(newLayout))
  }

  const onDrop = (newLayout, layoutItem) => {
    if (!layoutItem) {
      return
    }
    const newL = [
      ...newLayout.filter(
        (item) => !item.i.includes('dropping') && item.i != draggedItem
      ),
      { ...layoutItem, w: 2, h: 2, i: draggedItem },
    ]
    if (draggedItem) {
      const newRealm = unchartedRealms.find(
        (item) => item.realmId.toString() == draggedItem
      )
      if (newRealm) setGridRealms([...gridRealms, newRealm])
    }
    const newRealms = localStorage.getItem('newRealms')
    if (newRealms && draggedItem) {
      localStorage.setItem(
        'newRealms',
        JSON.stringify([...JSON.parse(newRealms), draggedItem])
      )
    } else if (draggedItem) {
      localStorage.setItem('newRealms', JSON.stringify([draggedItem]))
    }
    setLayout(newL)
    localStorage.setItem(storageVariable + columns, JSON.stringify(newL))
  }

  const resetGrid = () => {
    setGridRealms(certifiedRealms.concat(getNewRealms()))
    clearSearch()
  }

  return (
    <>
      {searching && (
        <div className="border-t border-b border-white py-4 my-4 flex flex-col gap-4">
          <h2>Uncharted DAOs</h2>
          <div
            className="overflow-scroll flex flex-nowrap"
            style={{ gridGap: GAP, width: width }}
          >
            {filteredUncharted &&
              filteredUncharted.map(
                (realm) =>
                  layout &&
                  !layout
                    .map((item) => item.i)
                    .includes(realm?.realmId.toString()) && (
                    <div
                      draggable={editing}
                      unselectable="on"
                      onMouseDown={
                        editing
                          ? () => {
                              setGridRealms(
                                certifiedRealms.concat(getNewRealms())
                              )
                              setDraggedItem(realm?.realmId.toString())
                            }
                          : () => null
                      }
                      // this is a hack for firefox
                      // Firefox requires some kind of initialization
                      // which we can do by adding this attribute
                      // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
                      onDragStart={(e) =>
                        editing && e.dataTransfer.setData('text/plain', '')
                      }
                      onClick={() => (editing ? null : goToRealm(realm))}
                      style={{
                        minWidth: (width / columns) * 2 - GAP + 1,
                        height: ROW_HEIGHT * 2 + GAP,
                      }}
                      key={realm.realmId.toString()}
                    >
                      <RealmBox realm={realm} editing={editing} theme={theme} />
                    </div>
                  )
              )}
          </div>
        </div>
      )}
      <GridLayout
        className="layout"
        layout={layout}
        width={width}
        cols={columns}
        rowHeight={ROW_HEIGHT}
        margin={[GAP, GAP]}
        containerPadding={[0, 0]}
        onDragStart={resetGrid}
        onDragStop={(layout) => updateItem(layout)}
        onResizeStart={resetGrid}
        onResizeStop={(layout) => updateItem(layout)}
        isResizable={editing}
        isDraggable={editing}
        isDroppable={true}
        onDrop={onDrop}
      >
        {gridRealms &&
          gridRealms.map(
            (realm) =>
              layout &&
              layout.find((item) => item.i == realm?.realmId.toString()) && (
                <div
                  key={realm?.realmId.toString()}
                  onClick={() => (editing ? null : goToRealm(realm))}
                  data-grid={layout.find(
                    (item) => item?.i == realm?.realmId.toString()
                  )}
                >
                  <RealmBox realm={realm} editing={editing} theme={theme} />
                </div>
              )
          )}
      </GridLayout>
      {/* <hr className="my-6 border-white" /> */}
      {/* <div className="grid grid-flow-row grid-cols-2 GAP-4 md:grid-cols-3 lg:grid-cols-5">
        {unchartedItems}
      </div> */}
    </>
  )
}

export default withSize()(RealmsGrid)
