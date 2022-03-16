import create, { State } from 'zustand'
import {
  getNfts,
  GovernedTokenAccount,
  ukraineDaoTokenAccountsOwnerAddress,
} from '@utils/tokens'
import tokenService from '@utils/services/token'
import { ConfirmedSignatureInfo, PublicKey } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { Connection } from '@solana/web3.js'
import { TokenInfo } from '@solana/spl-token-registry'
import { WSOL_MINT } from '@components/instructions/tools'
interface TreasuryAccountStore extends State {
  currentAccount: GovernedTokenAccount | null
  mintAddress: string
  tokenInfo: TokenInfo | null
  recentActivity: ConfirmedSignatureInfo[]

  allNfts: NFTWithMint[]
  governanceNfts: {
    [governance: string]: NFTWithMint[]
  }
  isLoadingNfts: boolean
  isLoadingRecentActivity: boolean
  setCurrentAccount: (account: GovernedTokenAccount, connection) => void
  handleFetchRecentActivity: (account: GovernedTokenAccount, connection) => void
  getNfts: (
    nftsGovernedTokenAccounts: GovernedTokenAccount[],
    connection: Connection
  ) => void
}

const useTreasuryAccountStore = create<TreasuryAccountStore>((set, _get) => ({
  currentAccount: null,
  mintAddress: '',
  tokenInfo: null,
  recentActivity: [],
  allNfts: [],
  governanceNfts: {},
  isLoadingNfts: false,
  isLoadingRecentActivity: false,
  getNfts: async (nftsGovernedTokenAccounts, connection) => {
    //Just for ukraine dao, it will be replaced with good abstraction
    const ukraineNftsGov = 'GVCbCA42c8B9WFkcr8uwKSZuQpXQErg4DKxTisfCGPCJ'
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
        //Just for ukraine dao, it will be replaced with good abstraction
        if (acc.governance?.pubkey.toBase58() === ukraineNftsGov) {
          const ukrainNfts = acc.governance?.pubkey
            ? await getNfts(
                connection,
                new PublicKey(ukraineDaoTokenAccountsOwnerAddress)
              )
            : []
          realmNfts = [...realmNfts, ...ukrainNfts]
        }
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
  setCurrentAccount: async (account, connection) => {
    let mintAddress =
      account && account.token ? account.token.account.mint.toBase58() : ''
    if (account.isSol) {
      mintAddress = WSOL_MINT
    }
    const tokenInfo = tokenService.getTokenInfo(mintAddress)
    set((s) => {
      s.currentAccount = account
      s.mintAddress = mintAddress
      s.tokenInfo = mintAddress && tokenInfo ? tokenInfo : null
    })
    _get().handleFetchRecentActivity(account, connection)
  },
  handleFetchRecentActivity: async (account, connection) => {
    set((s) => {
      s.isLoadingRecentActivity = true
    })
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
      s.recentActivity = recentActivity
      s.isLoadingRecentActivity = false
    })
  },
}))

export default useTreasuryAccountStore
