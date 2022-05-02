import create, { State } from 'zustand'
import { getNfts } from '@utils/tokens'
import tokenService from '@utils/services/token'
import { ConfirmedSignatureInfo, PublicKey } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { Connection } from '@solana/web3.js'
import { TokenInfo } from '@solana/spl-token-registry'
import { WSOL_MINT } from '@components/instructions/tools'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'

interface TreasuryAccountStore extends State {
  currentAccount: AssetAccount | null
  mintAddress: string
  tokenInfo?: TokenInfo
  recentActivity: ConfirmedSignatureInfo[]

  allNfts: NFTWithMint[]
  governanceNfts: {
    [governance: string]: NFTWithMint[]
  }
  isLoadingNfts: boolean
  isLoadingRecentActivity: boolean
  isLoadingTokenAccounts: boolean
  setCurrentAccount: (account: AssetAccount, connection) => void
  handleFetchRecentActivity: (account: AssetAccount, connection) => void
  getNfts: (
    nftsGovernedTokenAccounts: AssetAccount[],
    connection: Connection
  ) => void
}

const useTreasuryAccountStore = create<TreasuryAccountStore>((set, _get) => ({
  currentAccount: null,
  mintAddress: '',
  tokenInfo: undefined,
  recentActivity: [],
  allNfts: [],
  governanceNfts: {},
  isLoadingNfts: false,
  isLoadingRecentActivity: false,
  isLoadingTokenAccounts: false,
  getNfts: async (nftsGovernedTokenAccounts, connection) => {
    set((s) => {
      s.isLoadingNfts = true
    })
    let realmNfts: NFTWithMint[] = []
    const nftsPerPubkey = {}
    for (const acc of nftsGovernedTokenAccounts) {
      const governance = acc.governance.pubkey.toBase58()
      try {
        const nfts = acc.governance.pubkey
          ? await getNfts(connection, acc.governance.pubkey)
          : []
        if (acc.isSol) {
          const solAccountNfts = acc.extensions.transferAddress
            ? await getNfts(
                connection,
                new PublicKey(acc.extensions.transferAddress!)
              )
            : []
          realmNfts = [...realmNfts, ...solAccountNfts]

          nftsPerPubkey[acc.extensions.transferAddress!.toBase58()] = [
            ...solAccountNfts,
          ]
        }
        realmNfts = [...realmNfts, ...nfts]
        if (governance) {
          if (nftsPerPubkey[governance]) {
            nftsPerPubkey[governance] = [...nftsPerPubkey[governance], ...nfts]
          } else {
            nftsPerPubkey[governance] = [...nfts]
          }
        }
      } catch (e) {
        console.log(e)
        notify({
          message: `Unable to fetch nfts for governance ${governance}`,
        })
      }
    }
    set((s) => {
      s.allNfts = realmNfts
      s.governanceNfts = nftsPerPubkey
      s.isLoadingNfts = false
    })
  },
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
    const tokenInfo = tokenService.getTokenInfo(mintAddress)
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
