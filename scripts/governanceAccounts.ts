import { BN, TokenAccountLayout } from '@blockworks-foundation/mango-client'
import {
  Realm,
  Governance,
  GovernanceAccountType,
  getNativeTreasuryAddress,
  TOKEN_PROGRAM_ID,
  ProgramAccount,
} from 'spl-governanceV2'
import {
  AccountInfo,
  AccountLayout,
  MintInfo,
  MintLayout,
  u64,
} from '@solana/spl-token'
import {
  PublicKey,
  ParsedAccountData,
  AccountInfo as AccountInfoGeneric,
  Connection,
  Commitment,
} from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import axios from 'axios'
import group from '@utils/group'
import { chunks } from '@utils/helpers'

type TokenProgramAccount<T> = {
  publicKey: PublicKey
  account: T
}

function parseTokenAccountData(account: PublicKey, data: Buffer): TokenAccount {
  const accountInfo = AccountLayout.decode(data)
  accountInfo.address = account
  accountInfo.mint = new PublicKey(accountInfo.mint)
  accountInfo.owner = new PublicKey(accountInfo.owner)
  accountInfo.amount = u64.fromBuffer(accountInfo.amount)

  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null
    accountInfo.delegatedAmount = new u64(0)
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate)
    accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount)
  }

  accountInfo.isInitialized = accountInfo.state !== 0
  accountInfo.isFrozen = accountInfo.state === 2

  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative)
    accountInfo.isNative = true
  } else {
    accountInfo.rentExemptReserve = null
    accountInfo.isNative = false
  }

  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority)
  }

  return accountInfo
}

function parseMintAccountData(data: Buffer): MintAccount {
  const mintInfo = MintLayout.decode(data)
  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority)
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply)
  mintInfo.isInitialized = mintInfo.isInitialized != 0

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority)
  }
  return mintInfo
}

type TokenAccount = AccountInfo
type MintAccount = MintInfo

type AccountInfoGen<T> = {
  executable: boolean
  owner: PublicKey
  lamports: number
  data: T
  rentEpoch?: number
}
async function getMultipleAccountInfoChunked(
  connection: Connection,
  keys: PublicKey[],
  commitment: Commitment | undefined = 'recent'
) {
  return (
    await Promise.all(
      chunks(keys, 99).map((chunk) =>
        connection.getMultipleAccountsInfo(chunk, commitment)
      )
    )
  ).flat()
}

const DEFAULT_NATIVE_SOL_MINT = 'GSoLvSToqaUmMyqP12GffzcirPAickrpZmVUFtek6x5u'

const DEFAULT_NFT_TREASURY_MINT = 'GNFTm5rz1Kzvq94G7DJkcrEUnCypeQYf7Ya8arPoHWvw'

const MNGO_AUXILIARY_TOKEN_ACCOUNTS = [
  {
    owner: '9BVcYqEQxyccuwznvxXqDkSJFavvTyheiTYk231T1A8S',
    accounts: ['59BEyxwrFpt3x4sZ7TcXC3bHx3seGfqGkATcDx6siLWy'],
  },
  {
    owner: 'GHsErpcUbwiw1eci65HCDQzySKwQCxYRi5MrGeGpq5dn',
    accounts: ['8tKwcKM4obpoPmTZNZKDt5cCkAatrwHBNteXNrZRvjWj'],
  },
]

const AUXILIARY_TOKEN_ACCOUNTS = {
  Mango: MNGO_AUXILIARY_TOKEN_ACCOUNTS,
}

const WSOL_MINT = 'So11111111111111111111111111111111111111112'

const tokenAccountOwnerOffset = 32

interface SolAccInfo {
  governancePk: PublicKey
  acc: any
  nativeSolAddress: PublicKey
}

export const getAccountsForGovernances = async (
  connection: ConnectionContext,
  realm: ProgramAccount<Realm>,
  governancesArray: ProgramAccount<Governance>[]
): Promise<
  (AccountTypeMint | AccountTypeProgram | AssetAccount | AccountTypeGeneric)[]
> => {
  // 1 - Sort different types of governances
  const mintGovernances = getGovernancesByAccountTypes(governancesArray, [
    GovernanceAccountType.MintGovernanceV1,
    GovernanceAccountType.MintGovernanceV2,
  ])

  const programGovernances = getGovernancesByAccountTypes(governancesArray, [
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ])

  // 2 - Load accounts related to mint governances
  const mintAccounts = await loadMintGovernanceAccounts(
    connection,
    mintGovernances
  )

  // 3 - Load accounts related to program governances
  const programAccounts = getProgramAssetAccounts(programGovernances)

  // 4 - Load token accounts behind any type of governance
  const governedTokenAccounts = await loadGovernedTokenAccounts(
    connection,
    realm,
    governancesArray
  )

  const accounts = [
    ...mintAccounts,
    ...programAccounts,
    ...governedTokenAccounts,
  ]

  // 6 - Create generic asset accounts for governance's governedAccounts that have not been handled yet
  // We do this so theses accounts may be selected
  const genericGovernances = getGenericAssetAccounts(
    governancesArray.filter(
      (governance) =>
        !accounts.some((account) =>
          account.pubkey.equals(governance.account.governedAccount)
        )
    )
  )

  return [...accounts, ...genericGovernances]
}

const getTokenAccountObj = async (
  governance: ProgramAccount<Governance>,
  tokenAccount: TokenProgramAccount<AccountInfo>,
  mintAccounts: TokenProgramAccount<MintInfo>[]
): Promise<AccountTypeNFT | AccountTypeToken | null> => {
  const isNftAccount =
    tokenAccount.account.mint.toBase58() === DEFAULT_NFT_TREASURY_MINT

  const mint = mintAccounts.find((x) =>
    x.publicKey.equals(tokenAccount.account.mint)
  )!

  if (isNftAccount) {
    return new AccountTypeNFT(tokenAccount, mint, governance)
  }

  if (
    mint.account.supply &&
    mint.account.supply.cmpn(1) !== 0 &&
    mint.publicKey.toBase58() !== DEFAULT_NATIVE_SOL_MINT
  ) {
    return new AccountTypeToken(tokenAccount, mint!, governance)
  }

  return null
}

const getSolAccountsObj = async (
  connection: ConnectionContext,
  accounts: AssetAccount[],
  solAccountsInfo: SolAccInfo[],
  mintAccounts: TokenProgramAccount<MintAccount>[],
  governances: ProgramAccount<Governance>[]
): Promise<AssetAccount[]> => {
  const solAccounts: AccountTypeSol[] = []

  const wsolMintAccount = mintAccounts.find(
    (x) => x.publicKey.toBase58() === WSOL_MINT
  )! // WSOL should be here

  for (const solAccountInfo of solAccountsInfo) {
    const governance = governances.find((x) =>
      x.pubkey.equals(solAccountInfo.governancePk)
    )! // Governance should be here

    const account = await getSolAccountObj(
      governance,
      connection,
      wsolMintAccount,
      accounts,
      solAccountInfo
    )

    if (account) {
      solAccounts.push(account)
    }
  }

  return solAccounts
}

// Return array without duplicates
const uniquePublicKey = (array: PublicKey[]): PublicKey[] => {
  return Array.from(
    array.reduce((mintsPks, publicKey) => {
      // Transform to string for Set to be able to identify duplicates
      mintsPks.add(publicKey.toBase58())

      return mintsPks
    }, new Set<string>())
  ).map((address) => new PublicKey(address))
}

const getTokenAssetAccounts = async (
  tokenAccounts: {
    publicKey: PublicKey
    account: AccountInfo
  }[],
  governances: ProgramAccount<Governance>[],
  realm: ProgramAccount<Realm>,
  connection: ConnectionContext
) => {
  const accounts: AssetAccount[] = []

  const mintsPks = uniquePublicKey(
    tokenAccounts.map((tokenAccount) => tokenAccount.account.mint)
  )

  // WSOL must be in the mintsPks array
  // WSOL is used as mint for sol accounts to calculate amounts
  if (!mintsPks.some((x) => x.toBase58() === WSOL_MINT)) {
    mintsPks.push(new PublicKey(WSOL_MINT))
  }

  const [mintAccounts, ...nativeSolAddresses] = await Promise.all([
    getMintAccountsInfo(connection, mintsPks),
    ...governances.map((x) => getNativeTreasuryAddress(realm.owner, x.pubkey)),
  ])

  const govNativeSolAddress = nativeSolAddresses.map((x, index) => ({
    governanceAcc: governances[index],
    governancePk: governances[index].pubkey,
    nativeSolAddress: x,
  }))

  const solAccountsInfo = await getSolAccountsInfo(
    connection,
    govNativeSolAddress
  )

  for (const tokenAccount of tokenAccounts) {
    let governance = governances.find(
      (x) => x.pubkey.toBase58() === tokenAccount.account.owner.toBase58()
    )
    const nativeSolAddress = nativeSolAddresses.find((x) =>
      x.equals(tokenAccount.account.owner)
    )

    if (!governance && nativeSolAddress) {
      governance = govNativeSolAddress.find((x) =>
        x.nativeSolAddress.equals(nativeSolAddress)
      )?.governanceAcc
    }

    if (governance) {
      const account = await getTokenAccountObj(
        governance!,
        tokenAccount,
        mintAccounts
      )
      if (account) {
        accounts.push(account)
      }
    } else if (
      [...Object.values(AUXILIARY_TOKEN_ACCOUNTS).flatMap((x) => x)].find((x) =>
        x.accounts.includes(tokenAccount.publicKey.toBase58())
      )
    ) {
      const mint = mintAccounts.find(
        (x) => x.publicKey.toBase58() === tokenAccount.account.mint.toBase58()
      )

      if (mint) {
        const account = new AccountTypeAuxiliaryToken(tokenAccount, mint)

        if (account) {
          accounts.push(account)
        }
      }
    }
  }

  const solAccounts = await getSolAccountsObj(
    connection,
    accounts,
    solAccountsInfo,
    mintAccounts,
    governances
  )

  return [...accounts, ...solAccounts]
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
): AccountTypeProgram[] => {
  return programGovernances.map(
    (programGov) => new AccountTypeProgram(programGov)
  )
}

const getGenericAssetAccounts = (
  genericGovernances: ProgramAccount<Governance>[]
): AccountTypeGeneric[] => {
  return genericGovernances.map(
    (programGov) => new AccountTypeGeneric(programGov)
  )
}

const getGovernancesByAccountTypes = (
  governancesArray: ProgramAccount<Governance>[],
  types: GovernanceAccountType[]
): ProgramAccount<Governance>[] => {
  return governancesArray.filter((gov) =>
    types.some((t) => gov.account.accountType === t)
  )
}

const getSolAccountObj = async (
  governance: ProgramAccount<Governance>,
  connection: ConnectionContext,
  mint: TokenProgramAccount<MintInfo>,
  accounts: AssetAccount[],
  { acc, nativeSolAddress }: SolAccInfo
): Promise<AccountTypeSol | null> => {
  if (!acc) {
    return null
  }

  const tokenAccountsOwnedBySolAccountInfo = await connection.current.getTokenAccountsByOwner(
    nativeSolAddress,
    {
      programId: TOKEN_PROGRAM_ID,
    }
  )

  const tokenAccountsOwnedBySolAccounts = tokenAccountsOwnedBySolAccountInfo.value.map(
    ({ pubkey: publicKey, account: { data: encodedData } }) => {
      const data = Buffer.from(encodedData)
      const account = parseTokenAccountData(publicKey, data)
      return { publicKey, account }
    }
  )

  const groups = group(tokenAccountsOwnedBySolAccounts)

  const mintAccounts = (
    await Promise.all(
      groups.map((group) => {
        if (!group.length) {
          return []
        }

        return getMintAccountsInfo(
          connection,
          group.map((x) => x.account.mint)
        )
      })
    )
  ).flat()

  for (const acc of tokenAccountsOwnedBySolAccounts) {
    const account = await getTokenAccountObj(governance, acc, mintAccounts)

    if (account) {
      accounts.push(account)
    }
  }

  const minRentAmount = await connection.current.getMinimumBalanceForRentExemption(
    0
  )

  const solAccount = acc as AccountInfoGen<Buffer | ParsedAccountData>

  solAccount.lamports =
    solAccount.lamports !== 0
      ? solAccount.lamports - minRentAmount
      : solAccount.lamports

  return new AccountTypeSol(mint, nativeSolAddress, solAccount, governance)
}

// Return array without duplicates
const uniqueGovernedTokenAccounts = (
  assetAccounts: AssetAccount[]
): AssetAccount[] => {
  const existing = new Set<string>()
  const deduped: AssetAccount[] = []

  for (const account of assetAccounts) {
    if (!existing.has(account.pubkey.toBase58())) {
      existing.add(account.pubkey.toBase58())
      deduped.push(account)
    }
  }

  return deduped
}

const getMintAccountsInfo = async (
  { endpoint, current: { commitment } }: ConnectionContext,
  publicKeys: PublicKey[]
): Promise<TokenProgramAccount<MintAccount>[]> => {
  const { data: mintAccountsJson } = await axios.post(
    endpoint,
    publicKeys.map((pubkey) => {
      const id = pubkey.toBase58()

      return {
        jsonrpc: '2.0',
        id,
        method: 'getAccountInfo',
        params: [
          id,
          {
            commitment,
            encoding: 'base64',
          },
        ],
      }
    })
  )

  if (!mintAccountsJson) {
    throw new Error(
      `Cannot load information about mint accounts ${publicKeys.map((x) =>
        x.toBase58()
      )}`
    )
  }

  return mintAccountsJson.map(
    ({
      result: {
        value: {
          data: [encodedData],
        },
      },
      id,
    }) => {
      const publicKey = new PublicKey(id)
      const data = Buffer.from(encodedData, 'base64')
      const account = parseMintAccountData(data)
      return { publicKey, account }
    }
  )
}

const getTokenAccountsInfo = async (
  { endpoint, current: { commitment } }: ConnectionContext,
  publicKeys: PublicKey[]
): Promise<TokenProgramAccount<TokenAccount>[]> => {
  const { data: tokenAccountsInfoJson } = await axios.post<
    unknown,
    {
      data: {
        result: {
          account: {
            data: [string, 'base64']
          }
          pubkey: string
        }[]
      }[]
    }
  >(
    endpoint,
    publicKeys.map((publicKey) => ({
      jsonrpc: '2.0',
      id: 1,
      method: 'getProgramAccounts',
      params: [
        TOKEN_PROGRAM_ID.toBase58(),
        {
          commitment,
          encoding: 'base64',
          filters: [
            {
              // number of bytes
              dataSize: TokenAccountLayout.span,
            },
            {
              memcmp: {
                // number of bytes
                offset: tokenAccountOwnerOffset,
                bytes: publicKey.toBase58(),
              },
            },
          ],
        },
      ],
    }))
  )

  if (!tokenAccountsInfoJson) {
    throw new Error(
      `Cannot load information about token accounts ${publicKeys.map((x) =>
        x.toBase58()
      )}`
    )
  }

  return tokenAccountsInfoJson.reduce((tokenAccountsInfo, { result }) => {
    result.forEach(
      ({
        account: {
          data: [encodedData],
        },
        pubkey,
      }) => {
        const publicKey = new PublicKey(pubkey)
        const data = Buffer.from(encodedData, 'base64')
        const account = parseTokenAccountData(publicKey, data)
        tokenAccountsInfo.push({ publicKey, account })
      }
    )

    return tokenAccountsInfo
  }, [] as TokenProgramAccount<TokenAccount>[])
}

const getSolAccountsInfo = async (
  connection: ConnectionContext,
  publicKeys: { governancePk: PublicKey; nativeSolAddress: PublicKey }[]
): Promise<SolAccInfo[]> => {
  const { data: solAccountsJson } = await axios.post<
    unknown,
    {
      data: {
        result: {
          value: null | {
            data: [string, 'base64']
          }
        }
      }[]
    }
  >(
    connection.endpoint,
    publicKeys.map((x) => ({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [
        x.nativeSolAddress.toBase58(),
        {
          commitment: connection.current.commitment,
          encoding: 'jsonParsed',
        },
      ],
    }))
  )

  if (!solAccountsJson.length) {
    return []
  }

  return (
    solAccountsJson
      .flatMap(({ result: { value } }, index: number) => {
        return {
          acc: value,
          ...publicKeys[index],
        }
      })
      // Remove null values
      .filter(({ acc }) => acc)
  )
}

const loadMintGovernanceAccounts = async (
  connection: ConnectionContext,
  mintGovernances: ProgramAccount<Governance>[]
) => {
  const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
    connection.current,
    mintGovernances.map((x) => x.account.governedAccount)
  )

  return getMintAccounts(mintGovernances, mintGovernancesMintInfo)
}

const loadGovernedTokenAccounts = async (
  connection: ConnectionContext,
  realm: ProgramAccount<Realm>,
  governancesArray: ProgramAccount<Governance>[]
): Promise<AssetAccount[]> => {
  const auxiliaryTokenAccounts: typeof AUXILIARY_TOKEN_ACCOUNTS[keyof typeof AUXILIARY_TOKEN_ACCOUNTS] = AUXILIARY_TOKEN_ACCOUNTS[
    realm.account.name
  ]?.length
    ? AUXILIARY_TOKEN_ACCOUNTS[realm.account.name]
    : []

  const nativeAccountAddresses = await Promise.all(
    governancesArray.map((governance) =>
      getNativeTreasuryAddress(governance.owner, governance.pubkey)
    )
  )

  const tokenAccountsOwnedByGovernances = uniquePublicKey([
    ...nativeAccountAddresses,
    ...governancesArray.map((g) => g.pubkey),
    ...auxiliaryTokenAccounts.map((x) => new PublicKey(x.owner)),
  ])

  const tokenAccountsInfo = (
    await Promise.all(
      // Load infos in batch, cannot load 9999 accounts within one request
      group(tokenAccountsOwnedByGovernances, 100).map((group) =>
        getTokenAccountsInfo(connection, group)
      )
    )
  ).flat()

  const governedTokenAccounts = (
    await Promise.all(
      // Load infos in batch, cannot load 9999 accounts within one request
      group(tokenAccountsInfo).map((group) =>
        getTokenAssetAccounts(group, governancesArray, realm, connection)
      )
    )
  ).flat()

  // Remove potential accounts duplicate
  return uniqueGovernedTokenAccounts(governedTokenAccounts)
}

interface AccountExtension {
  mint?: TokenProgramAccount<MintInfo> | undefined
  transferAddress?: PublicKey
  amount?: u64
  solAccount?: AccountInfoGen<Buffer | ParsedAccountData>
  token?: TokenProgramAccount<AccountInfo>
}

interface AssetAccount {
  governance: ProgramAccount<Governance>
  pubkey: PublicKey
  type: AccountType
  extensions: AccountExtension
  isSol?: boolean
  isNft?: boolean
  isToken?: boolean
}

enum AccountType {
  TOKEN,
  SOL,
  MINT,
  PROGRAM,
  NFT,
  GENERIC,
  AuxiliaryToken,
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

class AccountTypeAuxiliaryToken implements AssetAccount {
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

class AccountTypeGeneric implements AssetAccount {
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
