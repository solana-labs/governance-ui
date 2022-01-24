import create, { State } from 'zustand'
import { ViewState } from '@components/TreasuryAccount/Types'
import { getNfts, GovernedTokenAccount } from '@utils/tokens'
import tokenService from '@utils/services/token'
import { ConfirmedSignatureInfo } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { Connection } from '@solana/web3.js'
import { TokenInfo } from '@solana/spl-token-registry'
interface TreasuryAccountStore extends State {
  compact: {
    currentView: ViewState
    currentAccount: GovernedTokenAccount | null
    mintAddress: string
    tokenInfo: TokenInfo | null
    recentActivity: ConfirmedSignatureInfo[]
  }
  allNfts: NFTWithMint[]
  governanceNfts: {
    [governance: string]: NFTWithMint[]
  }
  isLoadingNfts: boolean
  setCurrentCompactView: (viewState: ViewState) => void
  setCurrentCompactAccount: (account: GovernedTokenAccount, connection) => void
  resetCompactViewState: () => void
  handleFetchRecentActivity: (account: GovernedTokenAccount, connection) => void
  getNfts: (
    nftsGovernedTokenAccounts: GovernedTokenAccount[],
    connection: Connection
  ) => void
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
  allNfts: [],
  governanceNfts: {},
  isLoadingNfts: false,
  getNfts: async (nftsGovernedTokenAccounts, connection) => {
    set((s) => {
      s.isLoadingNfts = true
    })
    let realmNfts: NFTWithMint[] = []
    const governanceNfts = {}
    for (const acc of nftsGovernedTokenAccounts) {
      const governance = acc.governance?.pubkey.toBase58()
      try {
        const nfts = acc.governance?.pubkey
          ? await getNfts(connection, acc.governance.pubkey)
          : []
        realmNfts = [...realmNfts, ...nfts]
        if (governance) {
          governanceNfts[governance] = [...nfts]
        }
      } catch (e) {
        notify({
          message: `Unable to fetch nfts for governance ${governance}`,
        })
      }
    }
    set((s) => {
      s.allNfts = realmNfts
      s.governanceNfts = governanceNfts
      s.isLoadingNfts = false
    })
  },
  setCurrentCompactView: (viewState) => {
    set((s) => {
      s.compact.currentView = viewState
    })
  },
  setCurrentCompactAccount: async (account, connection) => {
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
    const isNFT = account.isNft
    const address = isNFT
      ? account!.governance!.pubkey
      : account!.governance!.account.governedAccount
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
