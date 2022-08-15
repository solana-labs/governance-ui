import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import * as anchor from '@project-serum/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { MintAccount, tryGetMint } from '@utils/tokens'
import produce from 'immer'
import create, { State } from 'zustand'
import IDL from '../idls/serum_gov.json'

export type ClaimTicketType = {
  owner: PublicKey
  gsrmAmount: anchor.BN
  claimDelay: number
  createdAt: number
}

export type RedeemTicketType = {
  owner: PublicKey
  amount: anchor.BN
  isMsrm: boolean
  redeemDelay: number
  createdAt: number
}

export type UserAccountType = {
  owner: PublicKey
  lockIndex: number
  vestIndex: number
}

// const SRM_MINT = new PublicKey('6pJxsghghEcgpwmukyhtaFEjibAPdQyXQQb69Jn7CdST')
const GSRM_MINT = new PublicKey('AjLzmnzpfBQUwX3rE9kjrVAxmL1xM2Q5xZFX3a9TfhdC')

interface SerumGovStore extends State {
  isLoading: boolean

  programId: PublicKey
  gsrmMint?: MintAccount
  gsrmBalance?: anchor.web3.TokenAmount
  userAccount?: UserAccountType
  claimTickets: ClaimTicketType[]
  redeemTickets: RedeemTicketType[]

  set: (x: any) => void
  actions: any
}

const useSerumGovStore = create<SerumGovStore>((set, get) => ({
  isLoading: false,

  programId: new PublicKey('6titGTyVcdPo8GfHhJi3fhgLGkSHuhaEPiDpiUqK45v4'),
  gsrmMint: undefined,
  gsrmBalance: undefined,
  userAccount: undefined,
  claimTickets: [],
  redeemTickets: [],

  set: (fn) => set(produce(fn)),
  actions: {
    async load(connection: Connection) {
      const actions = get().actions
      const set = get().set

      set((s) => {
        s.isLoading = true
      })
      await actions.getGsrmMint(connection)
      set((s) => {
        s.isLoading = false
      })
    },

    async getGsrmMint(connection: Connection) {
      const set = get().set
      try {
        const mint = await tryGetMint(connection, GSRM_MINT)
        console.log(mint)
        set((s) => {
          s.gsrmMint = mint?.account
        })
      } catch (e) {
        console.error(e)
      }
    },

    async getClaimTickets(
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ) {
      if (owner) {
        const program = new anchor.Program(
          IDL as anchor.Idl,
          get().programId,
          provider
        )
        const tickets = await program.account.claimTicket.all([
          {
            memcmp: {
              offset: 8,
              bytes: owner.toBase58(),
            },
          },
        ])
        set((s) => {
          s.claimTickets = tickets.map((t) => ({
            owner: (t.account as any).owner,
            gsrmAmount: (t.account as any).gsrmAmount,
            claimDelay: (t.account as any).claimDelay.toNumber(),
            createdAt: (t.account as any).createdAt.toNumber(),
          }))
        })
      } else {
        set((s) => {
          s.claimTickets = []
        })
      }
    },

    async getGsrmBalance(connection: Connection, owner?: PublicKey | null) {
      if (owner) {
        const ata = await getAssociatedTokenAddress(GSRM_MINT, owner)
        try {
          const tokenBalance = await connection.getTokenAccountBalance(
            ata,
            'confirmed'
          )
          set((s) => {
            s.gsrmBalance = tokenBalance.value
          })
        } catch (e) {
          set((s) => {
            s.gsrmBalance = undefined
          })
        }
      } else {
        set((s) => {
          s.gsrmBalance = undefined
        })
      }
    },
  },
}))

export default useSerumGovStore
