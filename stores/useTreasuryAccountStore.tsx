import create, { State } from 'zustand'
import tokenPriceService, {
  TokenInfoWithoutDecimals,
} from '@utils/services/tokenPrice'
import { ConfirmedSignatureInfo } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { WSOL_MINT } from '@components/instructions/tools'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'

interface TreasuryAccountStore extends State {
  currentAccount: AssetAccount | null
  mintAddress: string
  tokenInfo?: TokenInfoWithoutDecimals
  recentActivity: ConfirmedSignatureInfo[]

  isLoadingRecentActivity: boolean
  isLoadingTokenAccounts: boolean
  setCurrentAccount: (account: AssetAccount, connection) => void
  handleFetchRecentActivity: (account: AssetAccount, connection) => void
}

const useTreasuryAccountStore = create<TreasuryAccountStore>((set, _get) => ({
  currentAccount: null,
  mintAddress: '',
  tokenInfo: undefined,
  recentActivity: [],
  isLoadingRecentActivity: false,
  isLoadingTokenAccounts: false,

  setCurrentAccount: async (account, connection) => {
    if (!account) {
      set((s) => {
        s.currentAccount = null
        s.mintAddress = ''
        s.tokenInfo = undefined
        s.recentActivity = []
      })
      return
    }
    let mintAddress =
      account && account.extensions.token
        ? account.extensions.token.account.mint.toBase58()
        : ''
    if (account.type === AccountType.SOL) {
      mintAddress = WSOL_MINT
    }
    const tokenInfo = tokenPriceService.getTokenInfo(mintAddress)
    set((s) => {
      s.currentAccount = account
      s.mintAddress = mintAddress
      s.tokenInfo = mintAddress && tokenInfo ? tokenInfo : undefined
    })
    _get().handleFetchRecentActivity(account, connection)
  },
  handleFetchRecentActivity: async (account, connection) => {
    set((s) => {
      s.isLoadingRecentActivity = true
    })
    let recentActivity = []
    const address = account.extensions.transferAddress
    try {
      recentActivity = await connection.current.getConfirmedSignaturesForAddress2(
        address,
        {
          limit: 5,
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
      s.recentActivity = recentActivity
      s.isLoadingRecentActivity = false
    })
  },
}))

export default useTreasuryAccountStore
