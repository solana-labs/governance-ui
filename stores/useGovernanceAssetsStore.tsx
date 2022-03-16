import create, { State } from 'zustand'
import {
  getNativeTreasuryAddress,
  Governance,
  GovernanceAccountType,
  Realm,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  DEFAULT_NATIVE_SOL_MINT,
  DEFAULT_NFT_TREASURY_MINT,
  HIDDEN_GOVERNANCES,
} from '@components/instructions/tools'
import {
  AccountInfoGen,
  getMultipleAccountInfoChunked,
  GovernedTokenAccount,
  parseMintAccountData,
  parseTokenAccountData,
  TokenProgramAccount,
  tryGetMint,
} from '@utils/tokens'
import { Connection, ParsedAccountData, PublicKey } from '@solana/web3.js'
import { AccountInfo, MintInfo, u64 } from '@solana/spl-token'
import { AccountInfo as AccountInfoGeneric } from '@solana/web3.js'
import { BN, TokenAccountLayout } from '@blockworks-foundation/mango-client'
import tokenService from '@utils/services/token'
const tokenAccountOwnerOffset = 32
interface TokenAccountExtension {
  mint?: TokenProgramAccount<MintInfo> | undefined
  transferAddress?: PublicKey
  amount?: u64
  solAccount?: AccountInfoGen<Buffer | ParsedAccountData>
  token?: TokenProgramAccount<AccountInfo>
}

export interface Account {
  pubkey: PublicKey
  type: AccountType
  extensions: TokenAccountExtension
}
interface GovernedAccount extends ProgramAccount<Governance> {
  accounts: Account[]
}

export enum AccountType {
  TOKEN,
  SOL,
  MINT,
  PROGRAM,
  NFT,
}
interface GovernanceAssetsStore extends State {
  governancesArray: ProgramAccount<Governance>[]
  governedTokenAccounts: GovernedTokenAccount[]
  governedAccounts: GovernedAccount[]
  loadGovernedAccounts: boolean
  setGovernancesArray: (governances: {
    [governance: string]: ProgramAccount<Governance>
  }) => void
  setGovernedTokenAccounts: (items: GovernedTokenAccount[]) => void
  setGovernedAccounts: (
    connection: Connection,
    realm: ProgramAccount<Realm>
  ) => void
}

const defaultState = {
  governancesArray: [],
  governedAccounts: [],
  governedTokenAccounts: [],
  loadGovernedAccounts: true,
}

const useGovernanceAssetsStore = create<GovernanceAssetsStore>((set, _get) => ({
  ...defaultState,
  setGovernancesArray: (governances) => {
    const array = Object.keys(governances)
      .filter((gpk) => !HIDDEN_GOVERNANCES.has(gpk))
      .map((key) => governances[key])
    set((s) => {
      s.governancesArray = array
    })
  },
  setGovernedAccounts: async (connection, realm) => {
    const mintAddresses: string[] = []
    const governancesArray = _get().governancesArray
    const governedAccounts: GovernedAccount[] = governancesArray.map((x) => {
      return {
        ...x,
        accounts: [],
      }
    })
    const mintGovernances = getGovernancesByAccountTypes(governancesArray, [
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ])
    const programGovernances = getGovernancesByAccountTypes(governancesArray, [
      GovernanceAccountType.ProgramGovernanceV1,
      GovernanceAccountType.ProgramGovernanceV2,
    ])
    const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
      connection,
      mintGovernances.map((x) => x.account.governedAccount)
    )
    withMintAccounts(governedAccounts, mintGovernances, mintGovernancesMintInfo)
    withProgramAccounts(programGovernances, governedAccounts)
    const tokenAccounts = (
      await Promise.all(
        governancesArray.map((x) =>
          getAccountsByOwner(
            connection,
            TOKEN_PROGRAM_ID,
            x.pubkey,
            TokenAccountLayout.span,
            tokenAccountOwnerOffset
          )
        )
      )
    )
      .flatMap((x) => x)
      .map((x) => {
        const publicKey = x.pubkey
        const data = Buffer.from(x.account.data)
        const account = parseTokenAccountData(publicKey, data)
        return { publicKey, account }
      })
    await withTokenAccounts(tokenAccounts, governedAccounts, realm, connection)
    await tokenService.fetchTokenPrices(mintAddresses)
    set((s) => {
      s.governedAccounts = governedAccounts
      s.loadGovernedAccounts = false
    })
  },
  setGovernedTokenAccounts: (items) => {
    set((s) => {
      s.governedTokenAccounts = items
    })
  },
  //TODO refresh governance, refresh account methods
}))
export default useGovernanceAssetsStore

const getAccountsByOwner = (
  connection: Connection,
  programId: PublicKey,
  owner: PublicKey,
  dataSize: number,
  offset: number
) => {
  return connection.getProgramAccounts(
    programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      filters: [
        {
          dataSize: dataSize, // number of bytes
        },
        {
          memcmp: {
            offset: offset, // number of bytes
            bytes: owner.toBase58(), // base58 encoded string
          },
        },
      ],
    }
  )
}

const getTokenAccountsObj = async (
  realm: ProgramAccount<Realm>,
  governance: GovernedAccount,
  tokenAccount: TokenProgramAccount<AccountInfo>,
  connection: Connection
) => {
  const isSol = tokenAccount.account.mint.toBase58() === DEFAULT_NATIVE_SOL_MINT
  const isNft =
    tokenAccount.account.mint.toBase58() === DEFAULT_NFT_TREASURY_MINT
  const mint = await tryGetMint(connection, tokenAccount.account.mint)
  if (
    (mint?.account.supply && mint?.account.supply.cmp(new BN(1)) === 1) ||
    isNft ||
    isSol
  ) {
    if (isSol) {
      return await getSolAccount(
        realm,
        governance,
        connection,
        tokenAccount,
        mint!
      )
    }
  }
  if (isNft) {
    return new AccountTypeNFT(tokenAccount, mint!)
  }
  return new AccountTypeToken(tokenAccount, mint!)
}

const withTokenAccounts = async (
  tokenAccounts: {
    publicKey: PublicKey
    account: AccountInfo
  }[],
  governedAccounts: GovernedAccount[],
  realm: ProgramAccount<Realm>,
  connection: Connection
) => {
  for (const tokenAccount of tokenAccounts) {
    const governance = governedAccounts.find(
      (x) => x.pubkey.toBase58() === tokenAccount.account.owner.toBase58()
    )
    const account = await getTokenAccountsObj(
      realm,
      governance!,
      tokenAccount,
      connection
    )
    if (account) {
      governance?.accounts.push(account)
    }
  }
}

const withMintAccounts = (
  governedAccounts: GovernedAccount[],
  mintGovernances: ProgramAccount<Governance>[],
  mintGovernancesMintInfo: (AccountInfoGeneric<Buffer> | null)[]
) => {
  mintGovernancesMintInfo.forEach((mintAccountInfo, index) => {
    const mintGovernnace = mintGovernances[index]
    const governance = governedAccounts.find(
      (x) => x.pubkey.toBase58() === mintGovernnace.pubkey.toBase58()
    )
    if (!mintAccountInfo) {
      throw new Error(
        `Missing mintAccountInfo for: ${governance?.pubkey.toBase58()}`
      )
    }
    const data = Buffer.from(mintAccountInfo.data)
    const parsedMintInfo = parseMintAccountData(data) as MintInfo
    const account = new AccountTypeMint(governance!, parsedMintInfo)
    if (account) {
      governance?.accounts.push(account)
    }
  })
}

const withProgramAccounts = (
  programGovernances: ProgramAccount<Governance>[],
  governedAccounts: GovernedAccount[]
) => {
  programGovernances.forEach((programGov) => {
    const governance = governedAccounts.find(
      (x) => x.pubkey.toBase58() === programGov.pubkey.toBase58()
    )
    const account = new AccountTypeProgram(governance!)
    if (account) {
      governance?.accounts.push(account)
    }
  })
}

const getGovernancesByAccountTypes = (
  governancesArray: ProgramAccount<Governance>[],
  types: GovernanceAccountType[]
) => {
  const governancesFiltered = governancesArray.filter((gov) =>
    types.some((t) => gov.account?.accountType === t)
  )
  return governancesFiltered
}

const getSolAccount = async (
  realm: ProgramAccount<Realm>,
  governance: GovernedAccount,
  connection: Connection,
  tokenAccount: TokenProgramAccount<AccountInfo>,
  mint: TokenProgramAccount<MintInfo>
) => {
  const solAddress = await getNativeTreasuryAddress(
    realm.owner,
    governance!.pubkey
  )
  const resp = await connection.getParsedAccountInfo(solAddress)
  if (resp.value) {
    const accountsOwnedBySolAccount = (
      await getAccountsByOwner(
        connection,
        TOKEN_PROGRAM_ID,
        solAddress,
        TokenAccountLayout.span,
        tokenAccountOwnerOffset
      )
    ).map((x) => {
      const publicKey = x.pubkey
      const data = Buffer.from(x.account.data)
      const account = parseTokenAccountData(publicKey, data)
      return { publicKey, account }
    })
    for (const acc of accountsOwnedBySolAccount) {
      const account = await getTokenAccountsObj(
        realm,
        governance,
        acc,
        connection
      )
      if (account) {
        governance.accounts.push(account)
      }
    }
    const mintRentAmount = await connection.getMinimumBalanceForRentExemption(0)
    const solAccount = resp.value as AccountInfoGen<Buffer | ParsedAccountData>
    solAccount.lamports =
      solAccount.lamports !== 0
        ? solAccount.lamports - mintRentAmount
        : solAccount.lamports

    return new AccountTypeSol(tokenAccount, mint!, solAddress, solAccount)
  }
}

class AccountTypeToken implements Account {
  type: AccountType
  extensions: TokenAccountExtension
  pubkey: PublicKey
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>
  ) {
    this.pubkey = tokenAccount.publicKey
    this.type = AccountType.TOKEN
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: tokenAccount!.publicKey!,
      amount: tokenAccount!.account.amount,
    }
  }
}

class AccountTypeProgram implements Account {
  type: AccountType
  extensions: TokenAccountExtension
  pubkey: PublicKey
  constructor(governance: GovernedAccount) {
    this.pubkey = governance.account.governedAccount
    this.type = AccountType.PROGRAM
    this.extensions = {}
  }
}

class AccountTypeMint implements Account {
  type: AccountType
  extensions: TokenAccountExtension
  pubkey: PublicKey
  constructor(governance: GovernedAccount, account: MintInfo) {
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

class AccountTypeNFT implements Account {
  type: AccountType
  extensions: TokenAccountExtension
  pubkey: PublicKey
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>
  ) {
    this.pubkey = tokenAccount.publicKey
    this.type = AccountType.NFT
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: tokenAccount.account.owner,
      amount: tokenAccount.account.amount,
    }
  }
}

class AccountTypeSol implements Account {
  type: AccountType
  extensions: TokenAccountExtension
  pubkey: PublicKey
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>,
    solAddress: PublicKey,
    solAccount: AccountInfoGen<Buffer | ParsedAccountData>
  ) {
    this.type = AccountType.SOL
    this.pubkey = tokenAccount.publicKey
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: solAddress,
      amount: tokenAccount.account.amount,
      solAccount: solAccount,
    }
  }
}
