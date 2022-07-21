import { BN } from '@project-serum/anchor'
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
}

export interface AssetAccount {
  governance: ProgramAccount<Governance>
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
  AuxiliaryToken,
}

export class AccountTypeToken implements AssetAccount {
  governance: ProgramAccount<Governance>
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  isToken: boolean
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>,
    governance: ProgramAccount<Governance>
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
  governance: ProgramAccount<Governance>
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>
  ) {
    this.governance = {} as any
    this.pubkey = tokenAccount.publicKey
    this.type = AccountType.AuxiliaryToken
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: tokenAccount!.publicKey!,
      amount: tokenAccount!.account.amount,
    }
  }
}

export class AccountTypeProgram implements AssetAccount {
  governance: ProgramAccount<Governance>
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  constructor(governance: ProgramAccount<Governance>) {
    this.governance = governance
    this.pubkey = governance.account.governedAccount
    this.type = AccountType.PROGRAM
    this.extensions = {}
  }
}

export class AccountTypeMint implements AssetAccount {
  governance: ProgramAccount<Governance>
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  constructor(governance: ProgramAccount<Governance>, account: MintInfo) {
    this.governance = governance
    this.pubkey = governance.account.governedAccount
    this.type = AccountType.MINT
    this.extensions = {
      mint: {
        publicKey: governance.account.governedAccount,
        account: account,
      },
    }
  }
}

export class AccountTypeNFT implements AssetAccount {
  governance: ProgramAccount<Governance>
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  isNft: boolean
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>,
    governance: ProgramAccount<Governance>
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
  governance: ProgramAccount<Governance>
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  isSol: boolean
  constructor(
    mint: TokenProgramAccount<MintInfo>,
    solAddress: PublicKey,
    solAccount: AccountInfoGen<Buffer | ParsedAccountData>,
    governance: ProgramAccount<Governance>
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
  governance: ProgramAccount<Governance>
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  constructor(governance: ProgramAccount<Governance>) {
    this.governance = governance
    this.pubkey = governance.account.governedAccount
    this.type = AccountType.GENERIC
    this.extensions = {}
  }
}
