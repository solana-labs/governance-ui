import create, { State } from 'zustand'
import { ViewState } from '@components/TreasuryAccount/Types'
import { GovernedTokenAccount } from '@utils/tokens'
import tokenService, { TokenRecord } from '@utils/services/token'
import { ConfirmedSignatureInfo } from '@solana/web3.js'
import { notify } from '@utils/notifications'

interface TreasuryAccountStore extends State {
  compact: {
    currentView: ViewState
    currentAccount: GovernedTokenAccount | null
    mintAddress: string
    tokenInfo: TokenRecord | null
    recentActivity: ConfirmedSignatureInfo[]
  }
  setCurrentCompactView: (viewState: ViewState) => void
  setCurrentCompactAccount: (account: GovernedTokenAccount, connection) => void
  resetCompactViewState: () => void
  handleFetchRecentActivity: (account: GovernedTokenAccount, connection) => void
}

const compactDefaultState = {
  currentView: ViewState.MainView,
  currentAccount: null,
  mintAddress: '',
  tokenInfo: null,
  recentActivity: [],
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
  setCurrentCompactAccount: (account, connection) => {
    const mintAddress =
      account && account.token ? account.token.account.mint.toBase58() : ''
    const tokenInfo = tokenService.getTokenInfo(mintAddress)

    set((s) => {
      s.compact.currentAccount = account
      s.compact.mintAddress = mintAddress
      s.compact.tokenInfo = mintAddress && tokenInfo ? tokenInfo : null
    })
    _get().handleFetchRecentActivity(account, connection)
  },
  handleFetchRecentActivity: async (account, connection) => {
    let recentActivity = []
    try {
      recentActivity = await connection.current.getConfirmedSignaturesForAddress2(
        account!.governance!.info.governedAccount,
        {
          limit: 6,
        },
        'confirmed'
      )
    } catch (e) {
      notify({
        type: 'error',
        message: 'Unable to fetch recent account history',
      })
    }
    set((s) => {
      s.compact.recentActivity = recentActivity
    })
  },
  resetCompactViewState: () => {
    set((s) => {
      s.compact = { ...compactDefaultState }
    })
  },
}))

export default useTreasuryAccountStore
