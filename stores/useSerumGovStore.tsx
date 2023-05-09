import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import * as anchor from '@coral-xyz/anchor'
import { findProgramAddressSync } from '@coral-xyz/anchor/dist/cjs/utils/pubkey'
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
import produce from 'immer'
import create, { State } from 'zustand'
import IDL from '../idls/serum_gov.json'

export type ConfigAccountType = {
  configAuthority: PublicKey
  claimDelay: anchor.BN
  redeemDelay: anchor.BN
  cliffPeriod: anchor.BN
  linearVestingPeriod: anchor.BN
}

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

export const DEV_PROGRAM_ID = new PublicKey(
  'EDV6BNBY6pLb4aCJCc5LnELdA9xTywnDZ2m3cWfCbpwZ'
)
export const MAIN_PROGRAM_ID = new PublicKey(
  'FBcTbv5rLy7MQkkAU2uDzAEjjZDeu2BVLVRJGxyz6hnV'
)

export const DEV_SRM_MINT = new PublicKey(
  '2xKASju8WCUK6zC54TP4h6WhHdqdcWMNoFpqAdvXvHV6'
)
export const DEV_MSRM_MINT = new PublicKey(
  'BoFBTKtdMXC4YALXtNV5tmw1xNWtjxTrR17PvZGmKhmP'
)

export const MAIN_SRM_MINT = new PublicKey(
  'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'
)
export const MAIN_MSRM_MINT = new PublicKey(
  'MSRMcoVyrFxnSgo5uXwone5SKcGhT1KEJMFEkMEWf9L'
)
export const [DEV_GSRM_MINT] = findProgramAddressSync(
  [Buffer.from('gSRM')],
  DEV_PROGRAM_ID
)

export const SRM_DECIMALS = 6
export const MSRM_DECIMALS = 0
export const MSRM_MULTIPLIER = 1_000_000_000_000

interface SerumGovStore extends State {
  programId: PublicKey
  gsrmMint: PublicKey
  authority: PublicKey
  config: PublicKey
  srmMint: PublicKey
  msrmMint: PublicKey

  set: (x: any) => void
  actions: {
    updateSerumGovAccounts: (cluster?: string) => void
    getGsrmBalance: (
      connection: Connection,
      owner?: PublicKey | null
    ) => Promise<TokenAmount | null>
    getConfigAccount: (
      provider: anchor.AnchorProvider
    ) => Promise<ConfigAccountType | null>
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
    getUpdateConfigParamInstruction: (
      provider: anchor.AnchorProvider,
      configAuthority: PublicKey,
      claimDelay: anchor.BN,
      redeemDelay: anchor.BN,
      cliffPeriod: anchor.BN,
      linearVestingPeriod: anchor.BN
    ) => Promise<TransactionInstruction>
    getUpdateConfigAuthorityInstruction: (
      provider: anchor.AnchorProvider,
      configAuthority: PublicKey,
      newAuthority: PublicKey
    ) => Promise<TransactionInstruction>
  }
}

const useSerumGovStore = create<SerumGovStore>((set, get) => ({
  programId: DEV_PROGRAM_ID,
  gsrmMint: DEV_GSRM_MINT,
  authority: findProgramAddressSync(
    [Buffer.from('authority')],
    DEV_PROGRAM_ID
  )[0],
  config: findProgramAddressSync([Buffer.from('config')], DEV_PROGRAM_ID)[0],
  srmMint: DEV_SRM_MINT,
  msrmMint: DEV_MSRM_MINT,

  set: (fn) => set(produce(fn)),
  actions: {
    updateSerumGovAccounts: (cluster?: string) => {
      const programId = cluster === 'devnet' ? DEV_PROGRAM_ID : MAIN_PROGRAM_ID

      const [gsrmMint] = PublicKey.findProgramAddressSync(
        [Buffer.from('gSRM')],
        programId
      )
      const [config] = PublicKey.findProgramAddressSync(
        [Buffer.from('config')],
        programId
      )
      const [authority] = PublicKey.findProgramAddressSync(
        [Buffer.from('authority')],
        programId
      )
      const set = get().set
      set((s) => {
        s.programId = programId
        s.gsrmMint = gsrmMint
        s.config = config
        s.authority = authority
        s.srmMint = cluster === 'devnet' ? DEV_SRM_MINT : MAIN_SRM_MINT
        s.msrmMint = cluster === 'devnet' ? DEV_MSRM_MINT : MAIN_MSRM_MINT
      })
    },
    async getGsrmBalance(
      connection: Connection,
      owner?: PublicKey | null
    ): Promise<TokenAmount | null> {
      if (!owner) return null

      const gsrmMint = get().gsrmMint

      const ata = await getAssociatedTokenAddress(gsrmMint, owner, true)
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

    async getConfigAccount(
      provider: anchor.AnchorProvider
    ): Promise<ConfigAccountType | null> {
      const config = get().config
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )
      try {
        const configAccount = await program.account.config.fetch(config)
        return {
          configAuthority: configAccount.configAuthority as PublicKey,
          claimDelay: configAccount.claimDelay as anchor.BN,
          redeemDelay: configAccount.redeemDelay as anchor.BN,
          cliffPeriod: configAccount.cliffPeriod as anchor.BN,
          linearVestingPeriod: configAccount.linearVestingPeriod as anchor.BN,
        }
      } catch (e) {
        console.log('Config account not found')
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
      const gsrmMint = get().gsrmMint

      if (owner && owner.publicKey) {
        try {
          const program = new anchor.Program(
            IDL as anchor.Idl,
            get().programId,
            provider
          )
          const ownerGsrmAccount = await getAssociatedTokenAddress(
            gsrmMint,
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
              gsrmMint
            )
            instructions.push(ix)
          }
          const ix = await program.methods
            .claim()
            .accounts({
              owner: owner.publicKey,
              claimTicket: claimTicket.address,
              authority: get().authority,
              gsrmMint: gsrmMint,
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
              get().srmMint,
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
                get().srmMint
              )
              instructions.push(ix)
            }
            const [srmVault] = findProgramAddressSync(
              [Buffer.from('vault'), get().srmMint.toBuffer()],
              program.programId
            )
            const ix = await program.methods
              .redeemSrm()
              .accounts({
                owner: owner.publicKey,
                authority: get().authority,
                config: get().config,
                redeemTicket: redeemTicket.address,
                srmMint: get().srmMint,
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
              get().msrmMint,
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
                get().msrmMint
              )
              instructions.push(ix)
            }
            const [msrmVault] = findProgramAddressSync(
              [Buffer.from('vault'), get().msrmMint.toBuffer()],
              program.programId
            )
            const ix = await program.methods
              .redeemMsrm()
              .accounts({
                owner: owner.publicKey,
                authority: get().authority,
                config: get().config,
                redeemTicket: redeemTicket.address,
                msrmMint: get().msrmMint,
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

      const gsrmMint = get().gsrmMint

      const ownerGsrmAccount = await getAssociatedTokenAddress(
        gsrmMint,
        owner,
        true
      )
      const ix = await program.methods
        .claim()
        .accounts({
          owner: owner,
          claimTicket: claimTicket.address,
          authority: get().authority,
          gsrmMint: gsrmMint,
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
          get().srmMint,
          owner,
          true
        )
        const [srmVault] = findProgramAddressSync(
          [Buffer.from('vault'), get().srmMint.toBuffer()],
          program.programId
        )
        ix = await program.methods
          .redeemSrm()
          .accounts({
            owner: owner,
            authority: get().authority,
            config: get().config,
            redeemTicket: redeemTicket.address,
            srmMint: get().srmMint,
            srmVault,
            ownerSrmAccount,
            clock: SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      } else {
        const ownerMsrmAccount = await getAssociatedTokenAddress(
          get().msrmMint,
          owner,
          true
        )
        const [msrmVault] = findProgramAddressSync(
          [Buffer.from('vault'), get().msrmMint.toBuffer()],
          program.programId
        )
        ix = await program.methods
          .redeemMsrm()
          .accounts({
            owner: owner,
            authority: get().authority,
            config: get().config,
            redeemTicket: redeemTicket.address,
            msrmMint: get().msrmMint,
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
      const gsrmMint = get().gsrmMint

      if (owner && owner.publicKey) {
        try {
          const program = new anchor.Program(
            IDL as anchor.Idl,
            get().programId,
            provider
          )
          const ownerGsrmAccount = await getAssociatedTokenAddress(
            gsrmMint,
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
              config: get().config,
              gsrmMint: gsrmMint,
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
      const gsrmMint = get().gsrmMint

      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )
      const ownerGsrmAccount = await getAssociatedTokenAddress(
        gsrmMint,
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
          config: get().config,
          gsrmMint: gsrmMint,
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
      const gsrmMint = get().gsrmMint

      if (owner && owner.publicKey) {
        const program = new anchor.Program(
          IDL as anchor.Idl,
          get().programId,
          provider
        )
        const ownerGsrmAccount = await getAssociatedTokenAddress(
          gsrmMint,
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
            config: get().config,
            gsrmMint: gsrmMint,
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
      const gsrmMint = get().gsrmMint

      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )

      const ownerGsrmAccount = await getAssociatedTokenAddress(
        gsrmMint,
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
          config: get().config,
          gsrmMint: gsrmMint,
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
          [Buffer.from('vault'), get().srmMint.toBuffer()],
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
            srmMint: get().srmMint,
            payerSrmAccount: payerTokenAccount,
            authority: get().authority,
            config: get().config,
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
          [Buffer.from('vault'), get().msrmMint.toBuffer()],
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
            msrmMint: get().msrmMint,
            payerMsrmAccount: payerTokenAccount,
            authority: get().authority,
            config: get().config,
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
          [Buffer.from('vault'), get().srmMint.toBuffer()],
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
            srmMint: get().srmMint,
            payerSrmAccount: payerTokenAccount,
            authority: get().authority,
            config: get().config,
            srmVault,
            clock: SYSVAR_CLOCK_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      } else {
        const [msrmVault] = findProgramAddressSync(
          [Buffer.from('vault'), get().srmMint.toBuffer()],
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
            msrmMint: get().srmMint,
            payerMsrmAccount: payerTokenAccount,
            authority: get().authority,
            config: get().config,
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
          !isMsrm ? get().srmMint : get().msrmMint,
          owner.publicKey
        )

        const [vault] = findProgramAddressSync(
          [
            Buffer.from('vault'),
            !isMsrm ? get().srmMint.toBuffer() : get().srmMint.toBuffer(),
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
              srmMint: get().srmMint,
              payerSrmAccount: ownerAta,
              authority: get().authority,
              config: get().config,
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
              msrmMint: get().msrmMint,
              payerMsrmAccount: ownerAta,
              authority: get().authority,
              config: get().config,
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

    async getUpdateConfigParamInstruction(
      provider: anchor.AnchorProvider,
      configAuthority: PublicKey,
      claimDelay: anchor.BN,
      redeemDelay: anchor.BN,
      cliffPeriod: anchor.BN,
      linearVestingPeriod: anchor.BN
    ): Promise<TransactionInstruction> {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )

      const ix = await program.methods
        .updateConfigParams(
          claimDelay,
          redeemDelay,
          cliffPeriod,
          linearVestingPeriod
        )
        .accounts({
          config: get().config,
          configAuthority,
        })
        .instruction()

      return ix
    },

    async getUpdateConfigAuthorityInstruction(
      provider: anchor.AnchorProvider,
      configAuthority: PublicKey,
      newAuthority: PublicKey
    ): Promise<TransactionInstruction> {
      const program = new anchor.Program(
        IDL as anchor.Idl,
        get().programId,
        provider
      )

      const ix = await program.methods
        .updateConfigAuthority(newAuthority)
        .accounts({
          config: get().config,
          configAuthority,
        })
        .instruction()

      return ix
    },
  },
}))

export default useSerumGovStore
