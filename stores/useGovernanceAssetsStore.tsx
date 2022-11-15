import create, { State } from 'zustand'
import axios from 'axios'
import {
  getNativeTreasuryAddress,
  Governance,
  GovernanceAccountType,
  Realm,
  TOKEN_PROGRAM_ID,
  ProgramAccount,
} from '@solana/spl-governance'
import {
  ParsedAccountData,
  PublicKey,
  AccountInfo as AccountInfoGeneric,
} from '@solana/web3.js'
import { AccountInfo, MintInfo } from '@solana/spl-token'
import { TokenAccountLayout } from '@blockworks-foundation/mango-client'
import {
  AUXILIARY_TOKEN_ACCOUNTS,
  DEFAULT_NATIVE_SOL_MINT,
  DEFAULT_NFT_TREASURY_MINT,
  HIDDEN_GOVERNANCES,
  HIDDEN_TREASURES,
  WSOL_MINT,
} from '@components/instructions/tools'
import {
  AccountInfoGen,
  getMultipleAccountInfoChunked,
  MintAccount,
  parseMintAccountData,
  parseTokenAccountData,
  TokenAccount,
  TokenProgramAccount,
} from '@utils/tokens'
import tokenService from '@utils/services/token'
import { ConnectionContext } from '@utils/connection'
import {
  AccountType,
  AccountTypeGeneric,
  AccountTypeAuxiliaryToken,
  AccountTypeMint,
  AccountTypeNFT,
  AccountTypeProgram,
  AccountTypeSol,
  AccountTypeToken,
  AssetAccount,
} from '@utils/uiTypes/assets'
import { chunks } from '@utils/helpers'

const tokenAccountOwnerOffset = 32

interface SolAccInfo {
  governancePk: PublicKey
  acc: any
  nativeSolAddress: PublicKey
}

interface GovernanceAssetsStore extends State {
  governancesArray: ProgramAccount<Governance>[]
  governedTokenAccounts: AssetAccount[]
  assetAccounts: AssetAccount[]
  loadGovernedAccounts: boolean

  setGovernancesArray: (
    connection: ConnectionContext,
    realm: ProgramAccount<Realm>,
    governances: {
      [governance: string]: ProgramAccount<Governance>
    }
  ) => void
  getGovernedAccounts: (
    connection: ConnectionContext,
    realm: ProgramAccount<Realm>
  ) => void
  refetchGovernanceAccounts: (
    connection: ConnectionContext,
    realm: ProgramAccount<Realm>,
    governancePk: PublicKey
  ) => void
}

const defaultState = {
  governancesArray: [],
  assetAccounts: [],
  governedTokenAccounts: [],
  loadGovernedAccounts: false,
}

const useGovernanceAssetsStore = create<GovernanceAssetsStore>((set, _get) => ({
  ...defaultState,

  setGovernancesArray: (
    connection: ConnectionContext,
    realm: ProgramAccount<Realm>,
    governances: {
      [governance: string]: ProgramAccount<Governance>
    }
  ) => {
    const array: ProgramAccount<Governance>[] = Object.keys(governances)
      .filter((gpk) => !HIDDEN_GOVERNANCES.has(gpk))
      .map((key) => governances[key])

    set((s) => {
      s.governancesArray = array
    })

    _get().getGovernedAccounts(connection, realm)
  },

  getGovernedAccounts: async (connection, realm) => {
    set((s) => {
      s.loadGovernedAccounts = true
      s.governedTokenAccounts = []
      s.assetAccounts = []
    })

    const governancesArray = _get().governancesArray
    const accounts = governancesArray.length
      ? await getAccountsForGovernances(connection, realm, governancesArray)
      : []

    set((s) => {
      s.governancesArray = governancesArray
      s.loadGovernedAccounts = false
      s.governedTokenAccounts = accounts
        .filter(
          (x) =>
            x.type === AccountType.TOKEN ||
            x.type === AccountType.NFT ||
            x.type === AccountType.SOL
        )
        .filter(filterOutHiddenAccounts)
      s.assetAccounts = accounts.filter(filterOutHiddenAccounts)
    })
  },
  refetchGovernanceAccounts: async (
    connection: ConnectionContext,
    realm: ProgramAccount<Realm>,
    governancePk: PublicKey
  ) => {
    set((s) => {
      s.loadGovernedAccounts = false
    })

    const governancesArray = _get().governancesArray.filter((x) =>
      x.pubkey.equals(governancePk)
    )

    const previousAccounts = _get().assetAccounts.filter(
      (x) => !x.governance.pubkey.equals(governancePk)
    )

    const accounts = await getAccountsForGovernances(
      connection,
      realm,
      governancesArray
    )

    set((s) => {
      s.loadGovernedAccounts = false
      s.governedTokenAccounts = [...previousAccounts, ...accounts]
        .filter(
          (x) =>
            x.type === AccountType.TOKEN ||
            x.type === AccountType.NFT ||
            x.type === AccountType.SOL
        )
        .filter(filterOutHiddenAccounts)
      s.assetAccounts = [...previousAccounts, ...accounts].filter(
        filterOutHiddenAccounts
      )
    })
  },
}))
export default useGovernanceAssetsStore

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

  const groups = chunks(tokenAccountsOwnedBySolAccounts, 100)

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

const filterOutHiddenAccounts = (x: AssetAccount) => {
  const pubkey = typeof x.pubkey === 'string' ? x.pubkey : x.pubkey.toBase58()
  return (
    HIDDEN_TREASURES.findIndex((x) => x === pubkey) === -1 &&
    (!x.extensions.token ||
      !x.extensions.token?.account.isFrozen ||
      x.type !== AccountType.GENERIC)
  )
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
      chunks(tokenAccountsOwnedByGovernances, 100).map((group) =>
        getTokenAccountsInfo(connection, group)
      )
    )
  ).flat()

  const governedTokenAccounts = (
    await Promise.all(
      // Load infos in batch, cannot load 9999 accounts within one request
      chunks(tokenAccountsInfo, 100).map((group) =>
        getTokenAssetAccounts(group, governancesArray, realm, connection)
      )
    )
  ).flat()

  // Remove potential accounts duplicate
  return uniqueGovernedTokenAccounts(governedTokenAccounts)
}

const getAccountsForGovernances = async (
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

  // 5 - Call to fetch token prices for every token account's mints
  await tokenService.fetchTokenPrices(
    governedTokenAccounts.reduce((mints, governedTokenAccount) => {
      if (!governedTokenAccount.extensions.mint?.publicKey) {
        return mints
      }

      return [
        ...mints,
        governedTokenAccount.extensions.mint.publicKey.toBase58(),
      ]
    }, [] as string[])
  )

  const accounts = [
    ...mintAccounts,
    ...programAccounts,
    ...governedTokenAccounts,
  ]

  // 6 - Create generic asset accounts for governances governedAccounts that have not been handled yet
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
