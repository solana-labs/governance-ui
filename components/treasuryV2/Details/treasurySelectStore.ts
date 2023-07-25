import create from 'zustand'

type PubkeyAsString = string

type NftCollectionView = {
  _kind: 'NftCollection'
  collectionId: PubkeyAsString | 'none' // 'none' is for showing NFTs without a collection
}

/** Used whenever the view state should use the legacy, non-zustand props */
type LegacyView = {
  _kind: 'Legacy'
}
type View = NftCollectionView | LegacyView

type TreasurySelectState =
  | LegacyView
  | ({
      selectedGovernance: PubkeyAsString
    } & View)

// @asktree: Eventually I would like all of this state to live in the url query params. But we aren't ready for that.
// But, as a result of this, it's best if the state is easy to encode as url query params.
const useStore = create<{
  state: TreasurySelectState | undefined
  set: (x: TreasurySelectState | undefined) => void
}>((set) => ({
  state: undefined,
  set: (x) => set(() => ({ state: x })),
}))

export const useTreasurySelectState = () => {
  const { state, set } = useStore((s) => s)

  /* const router = useRouter()

  const set = (state: TreasurySelectState) => {
    router.replace({
      query: { ...router.query, view: JSON.stringify(state) },
    })
  }

  const viewQuery = router.query['view']
  const state = viewQuery
    ? (JSON.parse(viewQuery as string) as TreasurySelectState)
    : undefined
 */

  return [state, set] as const
}
