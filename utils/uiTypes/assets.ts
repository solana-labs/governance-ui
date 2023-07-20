import { BN } from '@coral-xyz/anchor'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import { AccountInfo, MintInfo, u64 } from '@solana/spl-token'
import { ParsedAccountData, PublicKey } from '@solana/web3.js'
import { TokenProgramAccount, AccountInfoGen } from '@utils/tokens'

interface AccountExtension {
  mint?: TokenProgramAccount<MintInfo> | undefined
  transferAddress?: PublicKey
  amount?: u64
  solAccount?: AccountInfoGen<Buffer | ParsedAccountData>
  token?: TokenProgramAccount<AccountInfo>
  program?: {
    authority: PublicKey
  }
  stake?: StakeAccount
}

export type GovernanceProgramAccountWithNativeTreasuryAddress = ProgramAccount<Governance> & {
  nativeTreasuryAddress: PublicKey
}
export interface AssetAccount {
  governance: GovernanceProgramAccountWithNativeTreasuryAddress
  pubkey: PublicKey
  type: AccountType
  extensions: AccountExtension
  isSol?: boolean
  isNft?: boolean
  isToken?: boolean
}

export enum AccountType {
  TOKEN,
  SOL,
  MINT,
  PROGRAM,
  NFT,
  GENERIC,
  AUXILIARY_TOKEN,
  STAKE,
}

export class AccountTypeToken implements AssetAccount {
  governance: GovernanceProgramAccountWithNativeTreasuryAddress
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  isToken: boolean
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>,
    governance: GovernanceProgramAccountWithNativeTreasuryAddress
  ) {
    this.governance = governance
    this.pubkey = tokenAccount.publicKey
    this.type = AccountType.TOKEN
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: tokenAccount!.publicKey!,
      amount: tokenAccount!.account.amount,
    }
    this.isToken = true
  }
}

export class AccountTypeAuxiliaryToken implements AssetAccount {
  governance: GovernanceProgramAccountWithNativeTreasuryAddress
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>
  ) {
    this.governance = {} as any
    this.pubkey = tokenAccount.publicKey
    this.type = AccountType.AUXILIARY_TOKEN
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: tokenAccount!.publicKey!,
      amount: tokenAccount!.account.amount,
    }
  }
}

export class AccountTypeProgram implements AssetAccount {
  governance: GovernanceProgramAccountWithNativeTreasuryAddress
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  constructor(
    governance: GovernanceProgramAccountWithNativeTreasuryAddress,
    programId: PublicKey,
    owner: PublicKey
  ) {
    this.governance = governance
    this.pubkey = programId
    this.type = AccountType.PROGRAM
    this.extensions = {
      program: {
        authority: owner,
      },
    }
  }
}

export class AccountTypeStake implements AssetAccount {
  governance: GovernanceProgramAccountWithNativeTreasuryAddress
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  constructor(
    governance: GovernanceProgramAccountWithNativeTreasuryAddress,
    stakePk: PublicKey,
    state: StakeState,
    delegatedValidator: PublicKey | null,
    amount: number
  ) {
    this.governance = governance
    this.pubkey = stakePk
    this.type = AccountType.STAKE
    this.extensions = {
      stake: {
        stakeAccount: stakePk,
        state: state,
        delegatedValidator: delegatedValidator,
        amount: amount,
      },
    }
  }
}

export class AccountTypeMint implements AssetAccount {
  governance: GovernanceProgramAccountWithNativeTreasuryAddress
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  constructor(
    governance: GovernanceProgramAccountWithNativeTreasuryAddress,
    account: MintInfo & { publicKey: PublicKey }
  ) {
    this.governance = governance
    this.pubkey = account.publicKey
    this.type = AccountType.MINT
    this.extensions = {
      mint: {
        publicKey: account.publicKey,
        account: account,
      },
    }
  }
}

export class AccountTypeNFT implements AssetAccount {
  governance: GovernanceProgramAccountWithNativeTreasuryAddress
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  isNft: boolean
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>,
    governance: GovernanceProgramAccountWithNativeTreasuryAddress
  ) {
    this.governance = governance
    this.pubkey = tokenAccount.publicKey
    this.type = AccountType.NFT
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: tokenAccount.account.owner,
      amount: tokenAccount.account.amount,
    }
    this.isNft = true
  }
}

export class AccountTypeSol implements AssetAccount {
  governance: GovernanceProgramAccountWithNativeTreasuryAddress
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  isSol: boolean
  constructor(
    mint: TokenProgramAccount<MintInfo>,
    solAddress: PublicKey,
    solAccount: AccountInfoGen<Buffer | ParsedAccountData>,
    governance: GovernanceProgramAccountWithNativeTreasuryAddress
  ) {
    this.governance = governance
    this.type = AccountType.SOL
    this.pubkey = solAddress
    this.extensions = {
      token: undefined,
      mint: mint,
      transferAddress: solAddress,
      amount: new BN(solAccount.lamports),
      solAccount: solAccount,
    }
    this.isSol = true
  }
}

export class AccountTypeGeneric implements AssetAccount {
  governance: GovernanceProgramAccountWithNativeTreasuryAddress
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  constructor(governance: GovernanceProgramAccountWithNativeTreasuryAddress) {
    this.governance = governance
    this.pubkey = governance.account.governedAccount
    this.type = AccountType.GENERIC
    this.extensions = {}
  }
}

export enum StakeState {
  Active,
  Inactive,
}

export interface StakeAccount {
  stakeAccount: PublicKey
  state: StakeState
  delegatedValidator: PublicKey | null
  amount: number
}
