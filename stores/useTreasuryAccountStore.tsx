import create, { State } from 'zustand'
import { ViewState } from '@components/TreasuryAccount/Types'
import { GovernedTokenAccount } from '@utils/tokens'
import tokenService, { TokenRecord } from '@utils/services/token'

interface TreasuryAccountStore extends State {
  compact: {
    currentView: ViewState
    currentAccount: GovernedTokenAccount | null
    mintAddress: string
    tokenInfo: TokenRecord | null
  }
  setCurrentCompactView: (viewState: ViewState) => void
  setCurrentCompactAccount: (account: GovernedTokenAccount) => void
  resetCompactViewState: () => void
}

const compactDefaultState = {
  currentView: ViewState.MainView,
  currentAccount: null,
  mintAddress: '',
  tokenInfo: null,
}

const useTreasuryAccountStore = create<TreasuryAccountStore>((set, _get) => ({
  compact: {
    ...compactDefaultState,
  },
  setCurrentCompactView: (viewState) => {
    set((s) => {
      s.compact.currentView = viewState
    })
  },
  setCurrentCompactAccount: (account) => {
    const mintAddress =
      account && account.token ? account.token.account.mint.toBase58() : ''
    const tokenInfo = tokenService.getTokenInfo(mintAddress)
    set((s) => {
      s.compact.currentAccount = account
      s.compact.mintAddress = mintAddress
      s.compact.tokenInfo = mintAddress && tokenInfo ? tokenInfo : null
    })
  },
  resetCompactViewState: () => {
    set((s) => {
      s.compact = { ...compactDefaultState }
    })
  },
}))

export default useTreasuryAccountStore
