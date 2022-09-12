import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import * as anchor from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TokenAmount,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { createAssociatedTokenAccount } from '@utils/associated'
import { notify } from '@utils/notifications'
import { sendTransaction } from '@utils/send'
import { WalletSigner } from '@utils/sendTransactions'
import { MintAccount, tryGetMint } from '@utils/tokens'
import produce from 'immer'
import create, { State } from 'zustand'
import IDL from '../idls/serum_gov.json'
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey'

export type ClaimTicketType = {
  address: PublicKey
  owner: PublicKey
  depositAccount: PublicKey
  gsrmAmount: anchor.BN
  claimDelay: number
  createdAt: number
}

export type RedeemTicketType = {
  address: PublicKey
  owner: PublicKey
  depositAccount: PublicKey
  redeemIndex: number
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
  redeemIndex: number
  createdAt: number
  isMsrm: boolean
  totalGsrmAmount: anchor.BN
  gsrmBurned: anchor.BN
}

export type VestAccountType = {
  address: PublicKey
  owner: PublicKey
  isMsrm: PublicKey
  vestIndex: number
  redeemIndex: number
  createdAt: number
  cliffPeriod: number
  linearVestingPeriod: number
  totalGsrmAmount: anchor.BN
  gsrmBurned: anchor.BN
}

const PROGRAM_ID = new PublicKey('G1aFYDgwp7zYcP9SyYskTP4d2C5WqKdweT3ajusiuUjJ')

export const SRM_MINT = new PublicKey(
  '6LDZM4GLSC6rA4hbt6XZVqfY9KQGWXfrSjsYyoDTFm8B'
)
export const MSRM_MINT = new PublicKey(
  '9Ag8AMqnjgc5qjTFiwafEpkZVRjRhqdGhHev4y1Dn2aS'
)
export const [GSRM_MINT] = findProgramAddressSync(
  [Buffer.from('gSRM')],
  PROGRAM_ID
)

export const SRM_DECIMALS = 6
export const MSRM_DECIMALS = 0
export const MSRM_MULTIPLIER = 1_000_000_000_000

const DEFAULT_GSRM_MINT_INFO = {
  mintAuthority: null,
  supply: new anchor.BN(0),
  decimals: SRM_DECIMALS,
  isInitialized: true,
  freezeAuthority: null,
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
    depositLocked: (
      connection: Connection,
      provider: anchor.AnchorProvider,
      amount: anchor.BN,
      isMsrm: boolean,
      owner?: WalletSigner | null
    ) => Promise<void>
  }
}

const useSerumGovStore = create<SerumGovStore>((set, get) => ({
  programId: PROGRAM_ID,
  gsrmMint: DEFAULT_GSRM_MINT_INFO,
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
          depositAccount: (t.account as any).depositAccount,
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
        depositAccount: (t.account as any).depositAccount,
        redeemIndex: (t.account as any).redeemIndex.toNumber(),
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
        redeemIndex: (a.account as any).redeemIndex.toNumber(),
        createdAt: (a.account as any).createdAt.toNumber(),
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
        redeemIndex: (a.account as any).redeemIndex.toNumber(),
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
          const instructions: TransactionInstruction[] = []
          try {
            await connection.getTokenAccountBalance(
              ownerGsrmAccount,
              'confirmed'
            )
          } catch (e) {
            const [ix] = await createAssociatedTokenAccount(
              owner.publicKey,
              owner.publicKey,
              GSRM_MINT
            )
            instructions.push(ix)
          }
          const ix = await program.methods
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
            .instruction()
          instructions.push(ix)

          const tx = new Transaction().add(...instructions.map((i) => i))

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
            const instructions: TransactionInstruction[] = []
            try {
              await connection.getTokenAccountBalance(
                ownerSrmAccount,
                'confirmed'
              )
            } catch (e) {
              const [ix] = await createAssociatedTokenAccount(
                owner.publicKey,
                owner.publicKey,
                SRM_MINT
              )
              instructions.push(ix)
            }
            const [srmVault] = findProgramAddressSync(
              [Buffer.from('vault'), SRM_MINT.toBuffer()],
              program.programId
            )
            const ix = await program.methods
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
              .instruction()

            instructions.push(ix)

            const tx = new Transaction().add(...instructions.map((i) => i))
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
            const instructions: TransactionInstruction[] = []
            try {
              await connection.getTokenAccountBalance(
                ownerMsrmAccount,
                'confirmed'
              )
            } catch (e) {
              const [ix] = await createAssociatedTokenAccount(
                owner.publicKey,
                owner.publicKey,
                SRM_MINT
              )
              instructions.push(ix)
            }
            const [msrmVault] = findProgramAddressSync(
              [Buffer.from('vault'), MSRM_MINT.toBuffer()],
              program.programId
            )
            const ix = await program.methods
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
              .instruction()

            instructions.push(ix)

            const tx = new Transaction().add(...instructions.map((i) => i))
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
          const [redeemTicket] = findProgramAddressSync(
            [
              Buffer.from('redeem_ticket'),
              lockedAccount.address.toBuffer(),
              new anchor.BN(lockedAccount.redeemIndex).toArrayLike(
                Buffer,
                'le',
                8
              ),
            ],
            program.programId
          )
          const tx = await program.methods
            .burnLockedGsrm(amount)
            .accounts({
              owner: owner.publicKey,
              authority: get().authority,
              gsrmMint: GSRM_MINT,
              ownerGsrmAccount: ownerGsrmAccount,
              lockedAccount: lockedAccount.address,
              redeemTicket: redeemTicket,
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
      const [redeemTicket] = findProgramAddressSync(
        [
          Buffer.from('redeem_ticket'),
          lockedAccount.address.toBuffer(),
          new anchor.BN(lockedAccount.redeemIndex).toArrayLike(Buffer, 'le', 8),
        ],
        program.programId
      )
      const ix = await program.methods
        .burnLockedGsrm(amount)
        .accounts({
          owner: owner,
          authority: get().authority,
          gsrmMint: GSRM_MINT,
          ownerGsrmAccount: ownerGsrmAccount,
          lockedAccount: lockedAccount.address,
          redeemTicket: redeemTicket,
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
        const [redeemTicket] = findProgramAddressSync(
          [
            Buffer.from('redeem_ticket'),
            vestAccount.address.toBuffer(),
            new anchor.BN(vestAccount.redeemIndex).toArrayLike(Buffer, 'le', 8),
          ],
          program.programId
        )
        const tx = await program.methods
          .burnVestGsrm(amount)
          .accounts({
            owner: owner.publicKey,
            authority: get().authority,
            gsrmMint: GSRM_MINT,
            ownerGsrmAccount,
            vestAccount: vestAccount.address,
            redeemTicket: redeemTicket,
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

      const [redeemTicket] = findProgramAddressSync(
        [
          Buffer.from('redeem_ticket'),
          vestAccount.address.toBuffer(),
          new anchor.BN(vestAccount.redeemIndex).toArrayLike(Buffer, 'le', 8),
        ],
        program.programId
      )

      const ix = await program.methods
        .burnVestGsrm(amount)
        .accounts({
          owner: owner,
          authority: get().authority,
          gsrmMint: GSRM_MINT,
          ownerGsrmAccount,
          vestAccount: vestAccount.address,
          redeemTicket: redeemTicket,
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
      // if (!userAccount) throw new Error('User account not found.')

      const [userAccountAddress] = findProgramAddressSync(
        [Buffer.from('user'), owner.toBuffer()],
        get().programId
      )

      const [lockedAccount] = findProgramAddressSync(
        [
          Buffer.from('locked_account'),
          owner.toBuffer(),
          new anchor.BN(userAccount ? userAccount.lockIndex : 0).toArrayLike(
            Buffer,
            'le',
            8
          ),
        ],
        program.programId
      )

      const [claimTicket] = findProgramAddressSync(
        [Buffer.from('claim_ticket'), lockedAccount.toBuffer()],
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
            ownerUserAccount: userAccount
              ? userAccount.address
              : userAccountAddress,
            srmMint: SRM_MINT,
            payerSrmAccount: payerTokenAccount,
            authority: get().authority,
            srmVault,
            lockedAccount,
            claimTicket: claimTicket,
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
            ownerUserAccount: userAccount
              ? userAccount.address
              : userAccountAddress,
            msrmMint: MSRM_MINT,
            payerMsrmAccount: payerTokenAccount,
            authority: get().authority,
            msrmVault,
            lockedAccount,
            claimTicket: claimTicket,
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

      const [userAccountAddress] = findProgramAddressSync(
        [Buffer.from('user'), owner.toBuffer()],
        get().programId
      )

      const [vestAccount] = findProgramAddressSync(
        [
          Buffer.from('vest_account'),
          owner.toBuffer(),
          new anchor.BN(userAccount ? userAccount.vestIndex : 0).toArrayLike(
            Buffer,
            'le',
            8
          ),
        ],
        program.programId
      )

      const [claimTicket] = findProgramAddressSync(
        [Buffer.from('claim_ticket'), vestAccount.toBuffer()],
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
            ownerUserAccount: userAccount
              ? userAccount.address
              : userAccountAddress,
            vestAccount,
            claimTicket: claimTicket,
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
            ownerUserAccount: userAccount
              ? userAccount.address
              : userAccountAddress,
            msrmMint: MSRM_MINT,
            payerMsrmAccount: payerTokenAccount,
            authority: get().authority,
            msrmVault,
            vestAccount,
            claimTicket: claimTicket,
            clock: SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      }

      return ix
    },

    async depositLocked(
      connection,
      provider,
      amount,
      isMsrm,
      owner?
    ): Promise<void> {
      if (!owner || !owner.publicKey) {
        notify({ type: 'error', message: 'Please connect your wallet.' })
        return
      }
      try {
        const program = new anchor.Program(
          IDL as anchor.Idl,
          get().programId,
          provider
        )

        const instructions: TransactionInstruction[] = []

        const ownerAta = await getAssociatedTokenAddress(
          !isMsrm ? SRM_MINT : MSRM_MINT,
          owner.publicKey
        )

        const [vault] = findProgramAddressSync(
          [
            Buffer.from('vault'),
            !isMsrm ? SRM_MINT.toBuffer() : MSRM_MINT.toBuffer(),
          ],
          program.programId
        )

        const [userAccountAddress] = findProgramAddressSync(
          [Buffer.from('user'), owner.publicKey.toBuffer()],
          program.programId
        )
        const userAccount = await get().actions.getUserAccount(
          provider,
          owner?.publicKey
        )

        if (!userAccount) {
          const ix = await program.methods
            .initUser(owner.publicKey)
            .accounts({
              payer: owner.publicKey,
              userAccount: userAccountAddress,
              systemProgram: SystemProgram.programId,
            })
            .instruction()
          instructions.push(ix)
        }

        const lockIndexBuffer = userAccount
          ? new anchor.BN(userAccount.lockIndex).toArrayLike(Buffer, 'le', 8)
          : new anchor.BN('0').toArrayLike(Buffer, 'le', 8)

        const [lockedAccount] = findProgramAddressSync(
          [
            Buffer.from('locked_account'),
            owner.publicKey.toBuffer(),
            lockIndexBuffer,
          ],
          program.programId
        )

        const [claimTicket] = findProgramAddressSync(
          [Buffer.from('claim_ticket'), lockedAccount.toBuffer()],
          program.programId
        )

        if (!isMsrm) {
          const ix = await program.methods
            .depositLockedSrm(amount)
            .accounts({
              payer: owner.publicKey,
              owner: owner.publicKey,
              ownerUserAccount: userAccount
                ? userAccount.address
                : userAccountAddress,
              srmMint: SRM_MINT,
              payerSrmAccount: ownerAta,
              authority: get().authority,
              srmVault: vault,
              lockedAccount,
              claimTicket,
              clock: SYSVAR_CLOCK_PUBKEY,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            })
            .instruction()
          instructions.push(ix)
        } else {
          const ix = await program.methods
            .depositLockedMsrm(amount)
            .accounts({
              payer: owner.publicKey,
              owner: owner.publicKey,
              ownerUserAccount: userAccount
                ? userAccount.address
                : userAccountAddress,
              msrmMint: MSRM_MINT,
              payerMsrmAccount: ownerAta,
              authority: get().authority,
              msrmVault: vault,
              lockedAccount,
              claimTicket,
              clock: SYSVAR_CLOCK_PUBKEY,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            })
            .instruction()
          instructions.push(ix)
        }

        const tx = new Transaction().add(...instructions)

        await sendTransaction({
          transaction: tx,
          wallet: owner,
          connection,
        })
      } catch (e) {
        console.error(e)
        notify({ type: 'error', message: 'Failed to lock tokens' })
      }
    },
  },
}))

export default useSerumGovStore
