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
import { ConnectionContext } from '@utils/connection'
import axios from 'axios'
const tokenAccountOwnerOffset = 32
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
}
interface GovernanceAssetsStore extends State {
  governancesArray: ProgramAccount<Governance>[]
  governedTokenAccounts: AssetAccount[]
  assetAccounts: AssetAccount[]
  loadGovernedAccounts: boolean
  setGovernancesArray: (governances: {
    [governance: string]: ProgramAccount<Governance>
  }) => void
  setGovernedAccounts: (
    connection: ConnectionContext,
    realm: ProgramAccount<Realm>
  ) => void
}

const defaultState = {
  governancesArray: [],
  assetAccounts: [],
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
    const governancesArray = _get().governancesArray
    const mintGovernances = getGovernancesByAccountTypes(governancesArray, [
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ])
    const programGovernances = getGovernancesByAccountTypes(governancesArray, [
      GovernanceAccountType.ProgramGovernanceV1,
      GovernanceAccountType.ProgramGovernanceV2,
    ])
    const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
      connection.current,
      mintGovernances.map((x) => x.account.governedAccount)
    )
    const mintAccounts = getMintAccounts(
      mintGovernances,
      mintGovernancesMintInfo
    )
    const programAccounts = getProgramAssetAccounts(programGovernances)
    const getOwnedTokenAccounts = await axios.request({
      url: connection.endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify([
        ...governancesArray.map((x) => {
          return {
            jsonrpc: '2.0',
            id: 1,
            method: 'getProgramAccounts',
            params: [
              TOKEN_PROGRAM_ID.toBase58(),
              {
                commitment: connection.current.commitment,
                encoding: 'base64',
                filters: [
                  {
                    dataSize: TokenAccountLayout.span, // number of bytes
                  },
                  {
                    memcmp: {
                      offset: tokenAccountOwnerOffset, // number of bytes
                      bytes: x.pubkey.toBase58(), // base58 encoded string
                    },
                  },
                ],
              },
            ],
          }
        }),
      ]),
    })
    const tokenAccountsJson = getOwnedTokenAccounts.data
    const tokenAccounts = tokenAccountsJson
      .flatMap((x) => x.result)
      .map((x) => {
        const publicKey = new PublicKey(x.pubkey)
        const data = Buffer.from(x.account.data[0], 'base64')
        const account = parseTokenAccountData(publicKey, data)
        return { publicKey, account }
      })
    const tokenAssetAccounts = await getTokenAssetAccounts(
      tokenAccounts,
      governancesArray,
      realm,
      connection.current
    )
    const governedTokenAccounts = tokenAssetAccounts
    await tokenService.fetchTokenPrices(
      governedTokenAccounts
        .filter((x) => x.extensions.mint?.publicKey)
        .map((x) => x.extensions.mint!.publicKey.toBase58())
    )
    set((s) => {
      s.governancesArray = governancesArray
      s.loadGovernedAccounts = false
      s.governedTokenAccounts = governedTokenAccounts
      s.assetAccounts = [
        ...mintAccounts,
        ...programAccounts,
        ...governedTokenAccounts,
      ]
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
  governance: ProgramAccount<Governance>,
  tokenAccount: TokenProgramAccount<AccountInfo>,
  connection: Connection,
  accounts: AssetAccount[]
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
        mint!,
        accounts
      )
    }
  }
  if (isNft) {
    return new AccountTypeNFT(tokenAccount, mint!, governance)
  }
  return new AccountTypeToken(tokenAccount, mint!, governance)
}

const getTokenAssetAccounts = async (
  tokenAccounts: {
    publicKey: PublicKey
    account: AccountInfo
  }[],
  governances: ProgramAccount<Governance>[],
  realm: ProgramAccount<Realm>,
  connection: Connection
) => {
  const accounts: AssetAccount[] = []
  for (const tokenAccount of tokenAccounts) {
    const governance = governances.find(
      (x) => x.pubkey.toBase58() === tokenAccount.account.owner.toBase58()
    )
    const account = await getTokenAccountsObj(
      realm,
      governance!,
      tokenAccount,
      connection,
      accounts
    )
    if (account) {
      accounts.push(account)
    }
  }
  return accounts
}

const getMintAccounts = (
  mintGovernances: ProgramAccount<Governance>[],
  mintGovernancesMintInfo: (AccountInfoGeneric<Buffer> | null)[]
) => {
  const accounts: AccountTypeMint[] = []
  mintGovernancesMintInfo.forEach((mintAccountInfo, index) => {
    const mintGovernnace = mintGovernances[index]
    if (!mintAccountInfo) {
      throw new Error(
        `Missing mintAccountInfo for: ${mintGovernnace?.pubkey.toBase58()}`
      )
    }
    const data = Buffer.from(mintAccountInfo.data)
    const parsedMintInfo = parseMintAccountData(data) as MintInfo
    const account = new AccountTypeMint(mintGovernnace!, parsedMintInfo)
    if (account) {
      accounts.push(account)
    }
  })
  return accounts
}

const getProgramAssetAccounts = (
  programGovernances: ProgramAccount<Governance>[]
) => {
  const accounts: AccountTypeProgram[] = []
  programGovernances.forEach((programGov) => {
    const account = new AccountTypeProgram(programGov!)
    if (account) {
      accounts.push(account)
    }
  })
  return accounts
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
  governance: ProgramAccount<Governance>,
  connection: Connection,
  tokenAccount: TokenProgramAccount<AccountInfo>,
  mint: TokenProgramAccount<MintInfo>,
  accounts: AssetAccount[]
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
        connection,
        accounts
      )
      if (account) {
        accounts.push(account)
      }
    }
    const mintRentAmount = await connection.getMinimumBalanceForRentExemption(0)
    const solAccount = resp.value as AccountInfoGen<Buffer | ParsedAccountData>
    solAccount.lamports =
      solAccount.lamports !== 0
        ? solAccount.lamports - mintRentAmount
        : solAccount.lamports

    return new AccountTypeSol(
      tokenAccount,
      mint!,
      solAddress,
      solAccount,
      governance
    )
  }
}

class AccountTypeToken implements AssetAccount {
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

class AccountTypeProgram implements AssetAccount {
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

class AccountTypeMint implements AssetAccount {
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

class AccountTypeNFT implements AssetAccount {
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

class AccountTypeSol implements AssetAccount {
  governance: ProgramAccount<Governance>
  type: AccountType
  extensions: AccountExtension
  pubkey: PublicKey
  isSol: boolean
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>,
    solAddress: PublicKey,
    solAccount: AccountInfoGen<Buffer | ParsedAccountData>,
    governance: ProgramAccount<Governance>
  ) {
    this.governance = governance
    this.type = AccountType.SOL
    this.pubkey = tokenAccount.publicKey
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: solAddress,
      amount: tokenAccount.account.amount,
      solAccount: solAccount,
    }
    this.isSol = true
  }
}
