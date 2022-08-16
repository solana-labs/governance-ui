import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import * as anchor from '@project-serum/anchor'
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { sendTransaction } from '@utils/send'
import { WalletSigner } from '@utils/sendTransactions'
import { MintAccount, tryGetMint } from '@utils/tokens'
import produce from 'immer'
import create, { State } from 'zustand'
import IDL from '../idls/serum_gov.json'

export type ClaimTicketType = {
  address: PublicKey
  owner: PublicKey
  gsrmAmount: anchor.BN
  claimDelay: number
  createdAt: number
}

export type RedeemTicketType = {
  address: PublicKey
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

export type LockedAccountType = {
  address: PublicKey
  owner: PublicKey
  lockIndex: number
  isMsrm: boolean
  totalGsrmAmount: anchor.BN
  gsrmBurned: anchor.BN
}

const PROGRAM_ID = new PublicKey('6titGTyVcdPo8GfHhJi3fhgLGkSHuhaEPiDpiUqK45v4')

const SRM_MINT = new PublicKey('6pJxsghghEcgpwmukyhtaFEjibAPdQyXQQb69Jn7CdST')
const MSRM_MINT = new PublicKey('5Y51LyyackBZPvzLWwjB9mTpGP5Y8Tz9EXdr6w2k4SgZ')
const GSRM_MINT = new PublicKey('AjLzmnzpfBQUwX3rE9kjrVAxmL1xM2Q5xZFX3a9TfhdC')

interface SerumGovStore extends State {
  isLoading: boolean

  programId: PublicKey
  gsrmMint?: MintAccount
  gsrmBalance?: anchor.web3.TokenAmount
  userAccount?: UserAccountType
  claimTickets: ClaimTicketType[]
  redeemTickets: RedeemTicketType[]
  lockedAccounts: LockedAccountType[]
  authority: PublicKey

  set: (x: any) => void
  actions: any
}

const useSerumGovStore = create<SerumGovStore>((set, get) => ({
  isLoading: false,

  programId: PROGRAM_ID,
  gsrmMint: undefined,
  gsrmBalance: undefined,
  userAccount: undefined,
  claimTickets: [],
  redeemTickets: [],
  lockedAccounts: [],
  authority: findProgramAddressSync([Buffer.from('authority')], PROGRAM_ID)[0],

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

    async getClaimTickets(
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ) {
      const set = get().set
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
            address: t.publicKey,
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

    async getRedeemTickets(
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ) {
      const set = get().set
      if (owner) {
        const program = new anchor.Program(
          IDL as anchor.Idl,
          get().programId,
          provider
        )
        const tickets = await program.account.redeemTicket.all([
          {
            memcmp: {
              offset: 8,
              bytes: owner.toBase58(),
            },
          },
        ])
        set((s) => {
          s.redeemTickets = tickets.map((t) => ({
            address: t.publicKey,
            owner: (t.account as any).owner,
            isMsrm: (t.account as any).isMsrm,
            amount: (t.account as any).amount,
            redeemDelay: (t.account as any).redeemDelay.toNumber(),
            createdAt: (t.account as any).createdAt.toNumber(),
          }))
        })
      } else {
        set((s) => {
          s.redeemTickets = []
        })
      }
    },

    async getLockedAccounts(
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ) {
      const set = get().set
      if (owner) {
        const program = new anchor.Program(
          IDL as anchor.Idl,
          get().programId,
          provider
        )

        const accounts = await program.account.lockedAccount.all([
          {
            memcmp: {
              offset: 8,
              bytes: owner.toBase58(),
            },
          },
        ])
        set((s) => {
          s.lockedAccounts = accounts.map((a) => ({
            address: a.publicKey,
            owner: (a.account as any).owner,
            lockIndex: (a.account as any).lockIndex.toNumber(),
            isMsrm: (a.account as any).isMsrm,
            totalGsrmAmount: (a.account as any).totalGsrmAmount,
            gsrmBurned: (a.account as any).gsrmBurned,
          }))
        })
      } else {
        set((s) => {
          s.lockedAccounts = []
        })
      }
    },

    async claim(
      connection: Connection,
      provider: anchor.AnchorProvider,
      claimTicket: ClaimTicketType,
      owner?: WalletSigner | null
    ) {
      if (owner && owner.publicKey) {
        try {
          const program = new anchor.Program(
            IDL as anchor.Idl,
            get().programId,
            provider
          )
          const ownerGsrmAccount = await getAssociatedTokenAddress(
            GSRM_MINT,
            owner.publicKey,
            true
          )
          const tx = await program.methods
            .claim()
            .accounts({
              owner: owner.publicKey,
              claimTicket: claimTicket.address,
              authority: get().authority,
              gsrmMint: GSRM_MINT,
              ownerGsrmAccount: ownerGsrmAccount,
              clock: SYSVAR_CLOCK_PUBKEY,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            })
            .transaction()
          await sendTransaction({
            transaction: tx,
            wallet: owner,
            connection,
          })
          await get().actions.getClaimTickets(provider, owner.publicKey)
        } catch (e) {
          console.error(e)
          notify({ type: 'error', message: 'Failed to claim ticket.' })
        }
      } else {
        notify({ type: 'error', message: 'Please connect wallet to claim.' })
      }
    },

    async burnLockedGsrm(
      connection: Connection,
      provider: anchor.AnchorProvider,
      lockedAccount: LockedAccountType,
      amount: anchor.BN,
      owner?: WalletSigner | null
    ) {
      if (owner && owner.publicKey) {
        try {
          const program = new anchor.Program(
            IDL as anchor.Idl,
            get().programId,
            provider
          )
          const ownerGsrmAccount = await getAssociatedTokenAddress(
            GSRM_MINT,
            owner.publicKey,
            true
          )
          const redeemTicket = Keypair.generate()
          const tx = await program.methods
            .burnLockedGsrm(new anchor.BN(lockedAccount.lockIndex), amount)
            .accounts({
              owner: owner.publicKey,
              authority: get().authority,
              gsrmMint: GSRM_MINT,
              ownerGsrmAccount: ownerGsrmAccount,
              lockedAccount: lockedAccount.address,
              redeemTicket: redeemTicket.publicKey,
              clock: SYSVAR_CLOCK_PUBKEY,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            })
            .transaction()
          await sendTransaction({
            transaction: tx,
            wallet: owner,
            signers: [redeemTicket],
            connection,
          })
          await get().actions.getLockedAccounts(provider, owner.publicKey)
          await get().actions.getRedeemTickets(provider, owner.publicKey)
        } catch (e) {
          console.error(e)
          notify({ type: 'error', message: 'Failed to burn locked gSRM.' })
        }
      } else {
        notify({ type: 'error', message: 'Please connect wallet to claim.' })
      }
    },

    async redeem(
      connection: Connection,
      provider: anchor.AnchorProvider,
      redeemTicket: RedeemTicketType,
      owner?: WalletSigner | null
    ) {
      if (owner && owner.publicKey) {
        const program = new anchor.Program(
          IDL as anchor.Idl,
          get().programId,
          provider
        )
        try {
          if (!redeemTicket.isMsrm) {
            const ownerSrmAccount = await getAssociatedTokenAddress(
              SRM_MINT,
              owner.publicKey,
              true
            )
            const [srmVault] = await findProgramAddressSync(
              [Buffer.from('vault'), SRM_MINT.toBuffer()],
              program.programId
            )
            const tx = await program.methods
              .redeemSrm()
              .accounts({
                owner: owner.publicKey,
                authority: get().authority,
                redeemTicket: redeemTicket.address,
                srmMint: SRM_MINT,
                srmVault,
                ownerSrmAccount,
                clock: SYSVAR_CLOCK_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
              })
              .transaction()
            await sendTransaction({
              transaction: tx,
              wallet: owner,
              connection,
            })
          } else {
            const ownerMsrmAccount = await getAssociatedTokenAddress(
              MSRM_MINT,
              owner.publicKey,
              true
            )
            const [msrmVault] = await findProgramAddressSync(
              [Buffer.from('vault'), MSRM_MINT.toBuffer()],
              program.programId
            )
            const tx = await program.methods
              .redeemMsrm()
              .accounts({
                owner: owner.publicKey,
                authority: get().authority,
                redeemTicket: redeemTicket.address,
                msrmMint: MSRM_MINT,
                msrmVault,
                ownerMsrmAccount,
                clock: SYSVAR_CLOCK_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
              })
              .transaction()
            await sendTransaction({
              transaction: tx,
              wallet: owner,
              connection,
            })
          }
          await get().actions.getRedeemTickets(provider, owner.publicKey)
        } catch (e) {
          console.error(e)
          notify({ type: 'error', message: 'Failed to redeem ticket.' })
        }
      } else {
        notify({ type: 'error', message: 'Please connect wallet to claim.' })
      }
    },
  },
}))

export default useSerumGovStore
