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
  TokenAmount,
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
  address: PublicKey
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

const PROGRAM_ID = new PublicKey('aw9bPsXoK7QoBNk6UVnxo7YukdaLsBXoKFapAJ95ETy')

export const SRM_MINT = new PublicKey(
  '5vUXA8U4PpSHcwXKyH4BhwesrZegDF8xJZfcDEK2qiUX'
)
export const MSRM_MINT = new PublicKey(
  '7n7AWyynyqRj2webKCt2nidZYFsGbqedXgMQ8SZWoU1W'
)
export const [GSRM_MINT] = findProgramAddressSync(
  [Buffer.from('gSRM')],
  PROGRAM_ID
)

export const SRM_DECIMALS = 6
export const MSRM_DECIMALS = 0
export const MSRM_MULTIPLIER = 1_000_000_000_000

const DEFAULT_GSRM_MINT_INFO = {
  mintAuthority: PublicKey.default,
  supply: 0,
  decimals: SRM_DECIMALS,
  isInitialized: true,
  freezeAuthority: undefined,
}

interface SerumGovStore extends State {
  programId: PublicKey
  gsrmMint?: MintAccount
  authority: PublicKey

  set: (x: any) => void
  actions: {
    loadGsrmMint: (connection: Connection) => Promise<void>
    getGsrmBalance: (
      connection: Connection,
      owner?: PublicKey | null
    ) => Promise<TokenAmount | null>
    getUserAccount: (
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ) => Promise<UserAccountType | null>
    getClaimTickets: (
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ) => Promise<ClaimTicketType[]>
    getRedeemTickets: (
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ) => Promise<RedeemTicketType[]>
    getLockedAccounts: (
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ) => Promise<LockedAccountType[]>
    getVestAccounts: (
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ) => Promise<VestAccountType[]>
    claim: (
      connection: Connection,
      provider: anchor.AnchorProvider,
      claimTicket: ClaimTicketType,
      owner?: WalletSigner | null
    ) => Promise<void>
    redeem: (
      connection: Connection,
      provider: anchor.AnchorProvider,
      redeemTicket: RedeemTicketType,
      owner?: WalletSigner | null
    ) => Promise<void>
    getClaimInstruction: (
      provider: anchor.AnchorProvider,
      claimTicket: ClaimTicketType,
      owner: PublicKey
    ) => Promise<TransactionInstruction>
    getRedeemInstruction: (
      provider: anchor.AnchorProvider,
      redeemTicket: RedeemTicketType,
      owner: PublicKey
    ) => Promise<TransactionInstruction>
    burnLockedGsrm: (
      connection: Connection,
      provider: anchor.AnchorProvider,
      lockedAccount: LockedAccountType,
      amount: anchor.BN,
      owner?: WalletSigner | null
    ) => Promise<void>
    getBurnLockedGsrmInstruction: (
      provider: anchor.AnchorProvider,
      lockedAccount: LockedAccountType,
      amount: anchor.BN,
      owner: PublicKey
    ) => Promise<TransactionInstruction>
    burnVestGsrm: (
      connection: Connection,
      provider: anchor.AnchorProvider,
      vestAccount: VestAccountType,
      amount: anchor.BN,
      owner?: WalletSigner | null
    ) => Promise<void>
    getBurnVestGsrmInstruction: (
      provider: anchor.AnchorProvider,
      vestAccount: VestAccountType,
      amount: anchor.BN,
      owner: PublicKey
    ) => Promise<TransactionInstruction>
    getInitUserInstruction: (
      owner: PublicKey,
      payer: PublicKey,
      provider: anchor.AnchorProvider
    ) => Promise<TransactionInstruction>
    getGrantLockedInstruction: (
      owner: PublicKey,
      payer: PublicKey,
      payerTokenAccount: PublicKey,
      provider: anchor.AnchorProvider,
      amount: anchor.BN,
      isMsrm: boolean
    ) => Promise<TransactionInstruction>
    getGrantVestInstruction: (
      owner: PublicKey,
      payer: PublicKey,
      payerTokenAccount: PublicKey,
      provider: anchor.AnchorProvider,
      amount: anchor.BN,
      isMsrm: boolean
    ) => Promise<TransactionInstruction>
  }
}

const useSerumGovStore = create<SerumGovStore>((set, get) => ({
  programId: PROGRAM_ID,
  gsrmMint: undefined,
  authority: findProgramAddressSync([Buffer.from('authority')], PROGRAM_ID)[0],

  set: (fn) => set(produce(fn)),
  actions: {
    async loadGsrmMint(connection: Connection) {
      const set = get().set
      const mint = await tryGetMint(connection, GSRM_MINT)

      // This is done because, for eg, on loading devnet treasury page directly, the mint is fetched from mainnet and not devnet, and thus messes up the decimals.
      set((s) => {
        s.gsrmMint = mint ? mint.account : DEFAULT_GSRM_MINT_INFO
      })
    },

    async getGsrmBalance(
      connection: Connection,
      owner?: PublicKey | null
    ): Promise<TokenAmount | null> {
      if (!owner) return null
      const ata = await getAssociatedTokenAddress(GSRM_MINT, owner, true)
      try {
        const tokenBalance = await connection.getTokenAccountBalance(
          ata,
          'confirmed'
        )
        return tokenBalance.value
      } catch (e) {
        console.error('Failed to get gSRM balance.', e)
        return null
      }
    },

    async getUserAccount(
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ): Promise<UserAccountType | null> {
      if (!owner) return null
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )
      const [account] = findProgramAddressSync(
        [Buffer.from('user'), owner.toBuffer()],
        get().programId
      )
      try {
        const userAccount = await program.account.user.fetch(account)
        return {
          address: account,
          owner: owner,
          lockIndex: (userAccount.lockIndex as anchor.BN).toNumber(),
          vestIndex: (userAccount.vestIndex as anchor.BN).toNumber(),
        }
      } catch (e) {
        console.error('Failed to get user account', e)
        return null
      }
    },

    async getClaimTickets(
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ): Promise<ClaimTicketType[]> {
      if (!owner) return []
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )
      try {
        const tickets = await program.account.claimTicket.all([
          {
            memcmp: {
              offset: 8,
              bytes: owner.toBase58(),
            },
          },
        ])
        return tickets.map((t) => ({
          address: t.publicKey,
          owner: (t.account as any).owner,
          gsrmAmount: (t.account as any).gsrmAmount,
          claimDelay: (t.account as any).claimDelay.toNumber(),
          createdAt: (t.account as any).createdAt.toNumber(),
        }))
      } catch (e) {
        console.error('Failed to get claim tickets', e)
        return []
      }
    },

    async getRedeemTickets(
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ): Promise<RedeemTicketType[]> {
      if (!owner) return []
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
      return tickets.map((t) => ({
        address: t.publicKey,
        owner: (t.account as any).owner,
        isMsrm: (t.account as any).isMsrm,
        amount: (t.account as any).amount,
        redeemDelay: (t.account as any).redeemDelay.toNumber(),
        createdAt: (t.account as any).createdAt.toNumber(),
      }))
    },

    async getLockedAccounts(
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ): Promise<LockedAccountType[]> {
      if (!owner) return []
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
      return accounts.map((a) => ({
        address: a.publicKey,
        owner: (a.account as any).owner,
        lockIndex: (a.account as any).lockIndex.toNumber(),
        isMsrm: (a.account as any).isMsrm,
        totalGsrmAmount: (a.account as any).totalGsrmAmount,
        gsrmBurned: (a.account as any).gsrmBurned,
      }))
    },

    async getVestAccounts(
      provider: anchor.AnchorProvider,
      owner?: PublicKey | null
    ): Promise<VestAccountType[]> {
      if (!owner) return []
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
      return accounts.map((a) => ({
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
    },

    async claim(
      connection: Connection,
      provider: anchor.AnchorProvider,
      claimTicket: ClaimTicketType,
      owner?: WalletSigner | null
    ): Promise<void> {
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
        } catch (e) {
          console.error(e)
          notify({ type: 'error', message: 'Failed to claim ticket.' })
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
    ): Promise<void> {
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
        } catch (e) {
          console.error(e)
          notify({ type: 'error', message: 'Failed to redeem ticket.' })
        }
      } else {
        notify({ type: 'error', message: 'Please connect wallet to claim.' })
      }
    },

    async getClaimInstruction(
      provider: anchor.AnchorProvider,
      claimTicket: ClaimTicketType,
      owner: PublicKey
    ): Promise<TransactionInstruction> {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )
      const ownerGsrmAccount = await getAssociatedTokenAddress(
        GSRM_MINT,
        owner,
        true
      )
      const ix = await program.methods
        .claim()
        .accounts({
          owner: owner,
          claimTicket: claimTicket.address,
          authority: get().authority,
          gsrmMint: GSRM_MINT,
          ownerGsrmAccount: ownerGsrmAccount,
          clock: SYSVAR_CLOCK_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction()
      return ix
    },

    async getRedeemInstruction(
      provider: anchor.AnchorProvider,
      redeemTicket: RedeemTicketType,
      owner: PublicKey
    ): Promise<TransactionInstruction> {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )
      let ix: TransactionInstruction
      if (!redeemTicket.isMsrm) {
        const ownerSrmAccount = await getAssociatedTokenAddress(
          SRM_MINT,
          owner,
          true
        )
        const [srmVault] = findProgramAddressSync(
          [Buffer.from('vault'), SRM_MINT.toBuffer()],
          program.programId
        )
        ix = await program.methods
          .redeemSrm()
          .accounts({
            owner: owner,
            authority: get().authority,
            redeemTicket: redeemTicket.address,
            srmMint: SRM_MINT,
            srmVault,
            ownerSrmAccount,
            clock: SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      } else {
        const ownerMsrmAccount = await getAssociatedTokenAddress(
          MSRM_MINT,
          owner,
          true
        )
        const [msrmVault] = findProgramAddressSync(
          [Buffer.from('vault'), MSRM_MINT.toBuffer()],
          program.programId
        )
        ix = await program.methods
          .redeemMsrm()
          .accounts({
            owner: owner,
            authority: get().authority,
            redeemTicket: redeemTicket.address,
            msrmMint: MSRM_MINT,
            msrmVault,
            ownerMsrmAccount,
            clock: SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      }

      return ix
    },

    async burnLockedGsrm(
      connection: Connection,
      provider: anchor.AnchorProvider,
      lockedAccount: LockedAccountType,
      amount: anchor.BN,
      owner?: WalletSigner | null
    ): Promise<void> {
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
        } catch (e) {
          console.error(e)
          notify({ type: 'error', message: 'Failed to burn locked gSRM.' })
        }
      } else {
        notify({ type: 'error', message: 'Please connect wallet to claim.' })
      }
    },

    async getBurnLockedGsrmInstruction(
      provider: anchor.AnchorProvider,
      lockedAccount: LockedAccountType,
      amount: anchor.BN,
      owner: PublicKey
    ): Promise<TransactionInstruction> {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )
      const ownerGsrmAccount = await getAssociatedTokenAddress(
        GSRM_MINT,
        owner,
        true
      )
      const redeemTicket = Keypair.generate()
      const ix = await program.methods
        .burnLockedGsrm(new anchor.BN(lockedAccount.lockIndex), amount)
        .accounts({
          owner: owner,
          authority: get().authority,
          gsrmMint: GSRM_MINT,
          ownerGsrmAccount: ownerGsrmAccount,
          lockedAccount: lockedAccount.address,
          redeemTicket: redeemTicket.publicKey,
          clock: SYSVAR_CLOCK_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction()

      return ix
    },

    async burnVestGsrm(
      connection: Connection,
      provider: anchor.AnchorProvider,
      vestAccount: VestAccountType,
      amount: anchor.BN,
      owner?: WalletSigner | null
    ): Promise<void> {
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
      } else {
        notify({ type: 'error', message: 'Please connect wallet to claim.' })
      }
    },

    async getBurnVestGsrmInstruction(
      provider: anchor.AnchorProvider,
      vestAccount: VestAccountType,
      amount: anchor.BN,
      owner: PublicKey
    ): Promise<TransactionInstruction> {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )

      const ownerGsrmAccount = await getAssociatedTokenAddress(
        GSRM_MINT,
        owner,
        true
      )

      const redeemTicket = Keypair.generate()
      const ix = await program.methods
        .burnVestGsrm(new anchor.BN(vestAccount.vestIndex), amount)
        .accounts({
          owner: owner,
          authority: get().authority,
          gsrmMint: GSRM_MINT,
          ownerGsrmAccount,
          vestAccount: vestAccount.address,
          redeemTicket: redeemTicket.publicKey,
          clock: SYSVAR_CLOCK_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction()

      return ix
    },

    async getInitUserInstruction(
      owner: PublicKey,
      payer: PublicKey,
      provider: anchor.AnchorProvider
    ): Promise<TransactionInstruction> {
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
    ): Promise<TransactionInstruction> {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )

      const userAccount = await get().actions.getUserAccount(provider, owner)
      if (!userAccount) throw new Error('User account not found.')

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

    async getGrantVestInstruction(
      owner: PublicKey,
      payer: PublicKey,
      payerTokenAccount: PublicKey,
      provider: anchor.AnchorProvider,
      amount: anchor.BN,
      isMsrm: boolean
    ): Promise<TransactionInstruction> {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )

      const userAccount = await get().actions.getUserAccount(provider, owner)
      if (!userAccount) throw new Error('User account not found.')

      const claimTicket = Keypair.generate()

      const [vestAccount] = findProgramAddressSync(
        [
          Buffer.from('vest_account'),
          owner.toBuffer(),
          new anchor.BN(userAccount.vestIndex).toArrayLike(Buffer, 'le', 8),
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
          .depositVestSrm(amount)
          .accounts({
            payer,
            owner,
            ownerUserAccount: userAccount.address,
            vestAccount,
            claimTicket: claimTicket.publicKey,
            srmMint: SRM_MINT,
            payerSrmAccount: payerTokenAccount,
            authority: get().authority,
            srmVault,
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
          .depositVestMsrm(amount)
          .accounts({
            payer,
            owner,
            userAccount: userAccount.address,
            msrmMint: MSRM_MINT,
            payerMsrmAccount: payerTokenAccount,
            authority: get().authority,
            msrmVault,
            vestAccount,
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
