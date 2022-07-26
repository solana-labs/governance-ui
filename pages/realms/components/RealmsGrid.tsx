import { useTheme } from 'next-themes'
import React, { useEffect, useState, useRef } from 'react'
import GridLayout, { Layout } from 'react-grid-layout'
import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { withSize } from 'react-sizeme'
import { AiOutlineDrag, AiOutlinePlusCircle } from 'react-icons/ai'
import { IoIosRemoveCircleOutline } from 'react-icons/io'

const RealmBox = ({ editing, realm, theme, removeItem, inGrid = false }) => {
  return (
    <div className="relative h-full w-full group">
      <div
        className={`flex relative w-full h-full flex-col items-center justify-center overflow-hidden p-8 rounded-lg cursor-pointer default-transition active:cursor-grabbing ${
          editing
            ? ` bg-bkg-4 cursor-grab opacity-75 group-hover:opacity-90`
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
      {editing && !inGrid && (
        <AiOutlineDrag className="absolute cursor-grab active:cursor-grabbing left-0 right-0 top-0 bottom-0 m-auto h-20 w-20 opacity-50" />
      )}
      {editing && inGrid && (
        <div
          onClick={() => removeItem(realm.realmId.toString())}
          className="absolute top-1 right-1 rounded-full cursor-pointer hover:opacity-50"
        >
          <IoIosRemoveCircleOutline className="h-8 w-8 z-50" />
        </div>
      )}
    </div>
  )
}

function RealmsGrid({
  certifiedRealms,
  unchartedRealms,
  filteredRealms,
  editing,
  searching,
  clearSearch,
  size,
}: {
  certifiedRealms: readonly RealmInfo[]
  unchartedRealms: readonly RealmInfo[]
  filteredRealms: readonly RealmInfo[]
  editing: boolean
  searching: boolean
  clearSearch: () => void
  size: { width: number }
}) {
  const [columns, setColumns] = useState(10)
  const [gridRealms, setGridRealms] = useState<readonly RealmInfo[]>([])
  const [draggedItem, setDraggedItem] = useState<string>()
  const [layout, setLayout] = useState<Layout>(generateLayout(10))
  const [top, setTop] = useState(0)

  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { theme } = useTheme()
  const gridRef = useRef<HTMLDivElement>(null)

  const { width } = size
  const GAP = 15
  const ROW_HEIGHT = 100
  const STORAGE_GRID = 'gridRealms'
  const STORAGE_IDS = 'gridRealmIds'

  const getGridRealms = () => {
    let gridRealmIds, realms
    if (typeof window !== undefined) {
      gridRealmIds = localStorage.getItem(STORAGE_IDS)
    }
    if (gridRealmIds) {
      realms = certifiedRealms
        .concat(unchartedRealms)
        .filter((item) => gridRealmIds.includes(item.realmId.toString()))
    }
    return realms ?? []
  }

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (!gridRef?.current?.clientHeight || typeof window === undefined) return
      if (gridRef?.current?.clientHeight >= window.innerHeight / 2 && editing) {
        setTop(-gridRef?.current?.clientHeight / 2)
      } else {
        setTop(0)
      }
    })
  }, [])

  useEffect(() => {
    setGridRealms(getGridRealms())
  }, [])

  useEffect(() => {
    const cols = width < 768 ? 4 : width < 1024 ? 6 : 10
    if (columns != cols) {
      setLayout(generateLayout(4))
    }
    setColumns(cols)
    setLayout(generateLayout(cols))
  }, [width, gridRealms])

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
    // disabled editing of grid for now
    // let savedGrid
    // if (typeof window !== 'undefined') {
    //   savedGrid = localStorage.getItem(STORAGE_GRID + cols)
    // }
    return (
      gridRealms &&
      gridRealms.map((realm) => {
        // disabled editing of grid for now
        // if (savedGrid) {
        //   const grid = JSON.parse(savedGrid)
        //   obj = grid.find((item) => item?.i == realm?.realmId.toString())
        // }
        const obj = {
          i: realm?.realmId.toString(),
          x: currX,
          y: -1,
          w: 2,
          h: 2,
        }
        currX = (currX + 2) % cols
        return { ...obj, isDraggable: editing }
      })
    )
  }

  const updateItem = (newLayout) => {
    setLayout(newLayout)
    localStorage.setItem(STORAGE_GRID + columns, JSON.stringify(newLayout))
  }

  const removeItem = (id) => {
    const newL = layout.filter((item) => item.i !== id)
    const newRealms = gridRealms.filter(
      (item) => item.realmId.toString() !== id
    )
    const currentRealms = localStorage.getItem(STORAGE_IDS)
    setLayout(newL)
    localStorage.setItem(STORAGE_GRID + columns, JSON.stringify(newL))
    setGridRealms(newRealms)
    if (currentRealms)
      localStorage.setItem(
        STORAGE_IDS,
        JSON.stringify(JSON.parse(currentRealms).filter((item) => item !== id))
      )
  }

  const onDrop = (newLayout, layoutItem) => {
    resetGrid()
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
      const newRealm = unchartedRealms
        .concat(certifiedRealms)
        .find((item) => item.realmId.toString() == draggedItem)
      if (
        newRealm &&
        !gridRealms.find(
          (item) => item.realmId.toString() == newRealm.realmId.toString()
        )
      )
        setGridRealms([...gridRealms, newRealm])
    }
    const currentRealms = localStorage.getItem(STORAGE_IDS)
    if (
      currentRealms &&
      draggedItem &&
      !JSON.parse(currentRealms).find((item) => item == draggedItem)
    ) {
      localStorage.setItem(
        STORAGE_IDS,
        JSON.stringify([...JSON.parse(currentRealms), draggedItem])
      )
    } else if (draggedItem) {
      localStorage.setItem(STORAGE_IDS, JSON.stringify([draggedItem]))
    }
    setLayout(newL)
    localStorage.setItem(STORAGE_GRID + columns, JSON.stringify(newL))
  }

  const resetGrid = () => {
    setGridRealms(getGridRealms())
    clearSearch()
  }

  const getRealmsOutsideGrid = (realms) => {
    return (
      realms &&
      realms.filter(
        (realm) =>
          !layout.map((item) => item.i).includes(realm.realmId.toString())
      )
    )
  }

  return (
    <>
      {(gridRealms?.length > 0 || editing) && (
        <div
          ref={gridRef}
          className={`${
            editing &&
            `border-bgk-5 border-dashed border-y-2 bg-bkg-2 !sticky backdrop-blur z-50`
          }`}
          style={{
            top: `${top}px`,
          }}
        >
          <GridLayout
            className={`layout relative min-h-[200px]`}
            layout={layout}
            width={width}
            cols={columns}
            rowHeight={ROW_HEIGHT}
            margin={[GAP, GAP]}
            containerPadding={[0, GAP]}
            onDragStop={(layout) => updateItem(layout)}
            onResizeStop={(layout) => updateItem(layout)}
            isResizable={false}
            isDraggable={editing}
            isDroppable={editing}
            onDrop={onDrop}
          >
            {gridRealms &&
              gridRealms.map(
                (realm) =>
                  layout &&
                  layout.find(
                    (item) => item.i == realm?.realmId.toString()
                  ) && (
                    <div
                      key={realm?.realmId.toString()}
                      onClick={() => (editing ? null : goToRealm(realm))}
                      data-grid={layout.find(
                        (item) => item?.i == realm?.realmId.toString()
                      )}
                    >
                      <RealmBox
                        realm={realm}
                        editing={editing}
                        theme={theme}
                        removeItem={removeItem}
                        inGrid={true}
                      />
                    </div>
                  )
              )}
          </GridLayout>
          {editing && gridRealms?.length === 0 && (
            <div className="text-confirm-green flex items-center -z-50 justify-center left-0 right-0 m-auto absolute top-[50%] -translate-y-[50%] gap-2 w-fit">
              <AiOutlinePlusCircle className="h-10 w-10" />
              <div>Add DAOs to this grid by dragging</div>
            </div>
          )}
        </div>
      )}
      <hr className="border border-bgk-1 mb-4" />
      {(editing || searching) && (
        <div className="pb-4 mb-4">
          <div className="pt-4 grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {filteredRealms &&
              filteredRealms.map(
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
                      <RealmBox
                        realm={realm}
                        editing={editing}
                        removeItem={() => null}
                        theme={theme}
                      />
                    </div>
                  )
              )}
          </div>
        </div>
      )}
      {!searching && !editing && (
        <div>
          <div className="grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {certifiedRealms &&
              getRealmsOutsideGrid(certifiedRealms).map((realm) => (
                <div
                  key={realm?.realmId.toString()}
                  onClick={() => (editing ? null : goToRealm(realm))}
                >
                  <RealmBox
                    realm={realm}
                    editing={editing}
                    removeItem={() => null}
                    theme={theme}
                  />
                </div>
              ))}
          </div>
          <h2 className="pt-12 mb-4">Uncharted DAOs</h2>
          <div className="grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {unchartedRealms &&
              getRealmsOutsideGrid(unchartedRealms).map((realm) => (
                <div
                  key={realm?.realmId.toString()}
                  onClick={() => (editing ? null : goToRealm(realm))}
                >
                  <RealmBox
                    realm={realm}
                    editing={false}
                    removeItem={() => null}
                    theme={theme}
                  />
                </div>
              ))}{' '}
          </div>
        </div>
      )}
    </>
  )
}

export default withSize()(RealmsGrid)
