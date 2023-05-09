import { useTheme } from 'next-themes'
import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import { RealmInfo } from '@models/registry/api'
import { AiOutlineDrag, AiOutlinePlusCircle } from 'react-icons/ai'
import { IoIosRemoveCircleOutline } from 'react-icons/io'
import SortableList, { SortableItem } from 'react-easy-sort'
import arrayMove from 'array-move'

interface IRealmBox {
  onClick: () => void
  editing: boolean
  realm: RealmInfo
  theme: string
  removeItem: (id: string) => void
  inGrid?: boolean
}

const RealmBox = React.forwardRef<HTMLDivElement, IRealmBox>(
  ({ onClick, editing, realm, theme, removeItem, inGrid = false }, ref) => (
    <div className="relative h-full w-full group" onClick={onClick} ref={ref}>
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
      {editing && (
        <AiOutlineDrag className="absolute cursor-grab active:cursor-grabbing left-1 top-1 h-8 w-8 hover:opacity-50" />
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
)

function RealmsGrid({
  certifiedRealms,
  //unchartedRealms,
  filteredRealms,
  editing,
  searching,
  clearSearch,
  cluster,
}: {
  certifiedRealms: readonly RealmInfo[]
  unchartedRealms: readonly RealmInfo[]
  filteredRealms: readonly RealmInfo[]
  editing: boolean
  searching: boolean
  clearSearch: () => void
  cluster: string | string[] | undefined
}) {
  const [gridRealms, setGridRealms] = useState<RealmInfo[]>([])
  const [draggedItem, setDraggedItem] = useState<RealmInfo>()
  const [top, setTop] = useState(0)

  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()
  const { theme } = useTheme()
  const gridRef = useRef<HTMLDivElement>(null)

  const STORAGE_REALMS = useMemo(() => {
    return 'gridRealms' + cluster
  }, [cluster])

  const onSortEnd = (oldIndex: number, newIndex: number) => {
    setGridRealms((array) => arrayMove(array, oldIndex, newIndex))
    localStorage.setItem(
      STORAGE_REALMS,
      JSON.stringify(arrayMove(gridRealms, oldIndex, newIndex))
    )
  }

  function getGridRealms() {
    let storageRealms
    if (typeof window !== undefined) {
      storageRealms = localStorage.getItem(STORAGE_REALMS)
    }
    return storageRealms ? JSON.parse(storageRealms) : []
  }

  useEffect(() => {
    // for the anchoring of the grid to the top of the screen
    window.onscroll = () => {
      if (gridRef?.current?.clientHeight && typeof window !== undefined) {
        if (
          gridRef?.current?.clientHeight >= window.innerHeight / 2 &&
          editing
        ) {
          setTop(-gridRef?.current?.clientHeight / 2)
        } else {
          setTop(0)
        }
      }
    }
  })

  useEffect(() => {
    // grid inserts random blank space for an empty scroll element, so we dont display it
    Array.from(
      document.getElementsByClassName(
        'erd_scroll_detection_container'
      ) as HTMLCollectionOf<HTMLElement>
    ).forEach((el) => (el.style['display'] = 'none'))
  })

  useEffect(() => {
    setGridRealms(getGridRealms())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])

  const goToRealm = (realmInfo: RealmInfo) => {
    const symbol =
      realmInfo.isCertified && realmInfo.symbol
        ? realmInfo.symbol
        : realmInfo.realmId.toString()
    const url = fmtUrlWithCluster(`/dao/${symbol}`)
    router.push(url)
  }

  const removeItem = (id) => {
    const newRealms =
      gridRealms && gridRealms.filter((item) => item.realmId.toString() !== id)
    setGridRealms(newRealms)
    localStorage.setItem(STORAGE_REALMS, JSON.stringify(newRealms))
  }

  const onDrop = () => {
    // when item is dropped onto the grid, add it to favourites
    const newGridRealms = gridRealms
    if (
      draggedItem &&
      !newGridRealms.find(
        (r) => r.realmId.toString() == draggedItem.realmId.toString()
      )
    )
      newGridRealms.push(draggedItem)
    setGridRealms(newGridRealms)
    localStorage.setItem(STORAGE_REALMS, JSON.stringify(newGridRealms))
    resetGrid()
  }

  const resetGrid = () => {
    setGridRealms(getGridRealms())
    clearSearch()
  }

  return (
    <>
      {(gridRealms?.length > 0 || editing) && (
        <div
          ref={gridRef}
          className={`pb-4 ${
            editing &&
            `border-bgk-5 border-dashed border-y-2 bg-bkg-2 !sticky backdrop-blur z-10 min-h-[200px]`
          }`}
          style={{
            top: `${top}px`,
          }}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <SortableList
            onSortEnd={onSortEnd}
            className="z-10 relative py-4 grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 select-none"
            draggedItemClassName="relative z-10"
            allowDrag={editing}
          >
            {gridRealms &&
              gridRealms.map(
                (realm) =>
                  filteredRealms.find(
                    (r) => r.realmId.toString() === realm.realmId.toString()
                  ) && (
                    <SortableItem key={realm?.realmId.toString()}>
                      <RealmBox
                        onClick={() => (editing ? null : goToRealm(realm))}
                        realm={realm}
                        editing={editing}
                        removeItem={removeItem}
                        theme={theme}
                        inGrid={true}
                      />
                    </SortableItem>
                  )
              )}
          </SortableList>
          {editing && gridRealms?.length === 0 && (
            <div className="text-confirm-green flex items-center -z-50 justify-center left-0 right-0 m-auto absolute top-[50%] -translate-y-[50%] gap-2 w-fit">
              <AiOutlinePlusCircle className="h-10 w-10" />
              <div>Add DAOs to this grid by dragging</div>
            </div>
          )}
        </div>
      )}
      {(editing || searching) && (
        <div className="pb-4 mb-4">
          <div className="pt-4 grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {filteredRealms &&
              filteredRealms.map(
                (realm) =>
                  !gridRealms?.find(
                    (r) => r.realmId.toString() == realm.realmId.toString()
                  ) && (
                    <div
                      draggable={editing}
                      // eslint-disable-next-line react/no-unknown-property
                      unselectable="on"
                      onMouseDown={
                        editing
                          ? () => {
                              setDraggedItem(realm)
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
                      key={realm.realmId.toString()}
                    >
                      <RealmBox
                        onClick={() => (editing ? null : goToRealm(realm))}
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
              certifiedRealms.map(
                (realm) =>
                  !gridRealms?.find(
                    (r) => r.realmId.toString() == realm.realmId.toString()
                  ) && (
                    <div key={realm?.realmId.toString()}>
                      <RealmBox
                        onClick={() => (editing ? null : goToRealm(realm))}
                        realm={realm}
                        editing={editing}
                        removeItem={() => null}
                        theme={theme}
                      />
                    </div>
                  )
              )}
          </div>
          {/* <h2 className="pt-12 mb-4">Uncharted DAOs</h2>
          <div className="grid grid-flow-row grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {unchartedRealms &&
              unchartedRealms.map(
                (realm) =>
                  !gridRealms?.find(
                    (r) => r.realmId.toString() == realm.realmId.toString()
                  ) && (
                    <div key={realm?.realmId.toString()}>
                      <RealmBox
                        realm={realm}
                        onClick={() => (editing ? null : goToRealm(realm))}
                        editing={editing}
                        removeItem={() => null}
                        theme={theme}
                      />
                    </div>
                  )
              )}
          </div> */}
        </div>
      )}
    </>
  )
}

export default RealmsGrid
