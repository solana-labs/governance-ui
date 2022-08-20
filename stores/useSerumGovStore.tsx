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
  TransactionInstruction,
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

export type VestAccountType = {
  address: PublicKey
  owner: PublicKey
  isMsrm: PublicKey
  vestIndex: number
  createdAt: number
  cliffPeriod: number
  linearVestingPeriod: number
  totalGsrmAmount: anchor.BN
  gsrmBurned: anchor.BN
}

const PROGRAM_ID = new PublicKey('GaokYbJFjAVJ23wodF5ttRLudaJMudHSv7esDt1d4J1k')

export const SRM_MINT = new PublicKey(
  'GcC7Duycsid99yEZBvPM8A67bGR9PSLQaNK9rqDqVcR3'
)
export const MSRM_MINT = new PublicKey(
  'FdyZJPngPQm5ZDwgTCiNLXCmuSmrYrR2EyhgVpoK35gE'
)
const [GSRM_MINT] = findProgramAddressSync([Buffer.from('gSRM')], PROGRAM_ID)

export const SRM_DECIMALS = 6
export const MSRM_DECIMALS = 0
export const MSRM_MULTIPLIER = 1_000_000_000_000

interface SerumGovStore extends State {
  isLoading: boolean

  programId: PublicKey
  gsrmMint?: MintAccount
  gsrmBalance?: anchor.web3.TokenAmount
  userAccount?: UserAccountType
  claimTickets: ClaimTicketType[]
  redeemTickets: RedeemTicketType[]
  lockedAccounts: LockedAccountType[]
  vestAccounts: VestAccountType[]
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
  vestAccounts: [],
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

    async getUserAccount(provider: anchor.AnchorProvider, owner: PublicKey) {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )
      const [account] = findProgramAddressSync(
        [Buffer.from('user'), owner.toBuffer()],
        get().programId
      )
      const userAccount = await program.account.user.fetch(account)
      return {
        address: account,
        lockIndex: (userAccount.lockIndex as anchor.BN).toNumber(),
        vestIndex: (userAccount.vestIndex as anchor.BN).toNumber(),
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
            const [srmVault] = findProgramAddressSync(
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
            const [msrmVault] = findProgramAddressSync(
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

    async getVestAccounts(
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

        const accounts = await program.account.vestAccount.all([
          {
            memcmp: {
              offset: 8,
              bytes: owner.toBase58(),
            },
          },
        ])
        accounts.forEach((a) => {
          console.log(a.publicKey.toBase58())
          console.log((a.account.totalGsrmAmount as any).toNumber())
        })
        set((s) => {
          s.vestAccounts = accounts.map((a) => ({
            address: a.publicKey,
            owner: (a.account as any).owner,
            isMsrm: (a.account as any).isMsrm,
            vestIndex: (a.account as any).vestIndex.toNumber(),
            cliffPeriod: (a.account as any).cliffPeriod.toNumber(),
            linearVestingPeriod: (a.account as any).linearVestingPeriod.toNumber(),
            createdAt: (a.account as any).createdAt.toNumber(),
            totalGsrmAmount: (a.account as any).totalGsrmAmount,
            gsrmBurned: (a.account as any).gsrmBurned,
          }))
        })
      } else {
        set((s) => {
          s.vestAccounts = []
        })
      }
    },

    async burnVestGsrm(
      connection: Connection,
      provider: anchor.AnchorProvider,
      vestAccount: VestAccountType,
      amount: anchor.BN,
      owner?: WalletSigner | null
    ) {
      if (owner && owner.publicKey) {
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
          .burnVestGsrm(new anchor.BN(vestAccount.vestIndex), amount)
          .accounts({
            owner: owner.publicKey,
            authority: get().authority,
            gsrmMint: GSRM_MINT,
            ownerGsrmAccount,
            vestAccount: vestAccount.address,
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
        await get().actions.getVestAccounts(provider, owner.publicKey)
        await get().actions.getRedeemTickets(provider, owner.publicKey)
      } else {
        notify({ type: 'error', message: 'Please connect wallet to claim.' })
      }
    },

    async getInitUserInstruction(
      owner: PublicKey,
      payer: PublicKey,
      provider: anchor.AnchorProvider
    ) {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )

      const [ownerUserAccount] = findProgramAddressSync(
        [Buffer.from('user'), owner.toBuffer()],
        program.programId
      )

      const ix = await program.methods
        .initUser(owner)
        .accounts({
          payer,
          userAccount: ownerUserAccount,
          systemProgram: SystemProgram.programId,
        })
        .instruction()

      return ix
    },

    async getGrantLockedInstruction(
      owner: PublicKey,
      payer: PublicKey,
      payerTokenAccount: PublicKey,
      provider: anchor.AnchorProvider,
      amount: anchor.BN,
      isMsrm: boolean
    ) {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )

      const userAccount = await get().actions.getUserAccount(provider, owner)

      const claimTicket = Keypair.generate()

      const [lockedAccount] = findProgramAddressSync(
        [
          Buffer.from('locked_account'),
          owner.toBuffer(),
          new anchor.BN(userAccount.lockIndex).toArrayLike(Buffer, 'le', 8),
        ],
        program.programId
      )

      let ix: TransactionInstruction
      if (!isMsrm) {
        const [srmVault] = findProgramAddressSync(
          [Buffer.from('vault'), SRM_MINT.toBuffer()],
          program.programId
        )
        ix = await program.methods
          .depositLockedSrm(amount)
          .accounts({
            payer,
            owner,
            userAccount: userAccount.address,
            srmMint: SRM_MINT,
            payerSrmAccount: payerTokenAccount,
            authority: get().authority,
            srmVault,
            lockedAccount,
            claimTicket: claimTicket.publicKey,
            clock: SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      } else {
        const [msrmVault] = findProgramAddressSync(
          [Buffer.from('vault'), MSRM_MINT.toBuffer()],
          program.programId
        )
        ix = await program.methods
          .depositLockedMsrm(amount)
          .accounts({
            payer,
            owner,
            userAccount: userAccount.address,
            msrmMint: MSRM_MINT,
            payerMsrmAccount: payerTokenAccount,
            authority: get().authority,
            msrmVault,
            lockedAccount,
            claimTicket: claimTicket.publicKey,
            clock: SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      }

      return ix
    },
  },
}))

export default useSerumGovStore
