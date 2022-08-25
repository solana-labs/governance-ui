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
  parseMintAccountData,
  parseTokenAccountData,
  TokenProgramAccount,
} from '@utils/tokens'
import { ParsedAccountData, PublicKey } from '@solana/web3.js'
import { AccountInfo, MintInfo } from '@solana/spl-token'
import { AccountInfo as AccountInfoGeneric } from '@solana/web3.js'
import { TokenAccountLayout } from '@blockworks-foundation/mango-client'
import tokenService from '@utils/services/token'
import { ConnectionContext } from '@utils/connection'
import axios from 'axios'
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
import group from '@utils/group'

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
  setGovernancesArray: (connection, realm, governances) => {
    const array = Object.keys(governances)
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
        .filter(filterOutHiddenAccs)
      s.assetAccounts = accounts.filter(filterOutHiddenAccs)
    })
  },
  refetchGovernanceAccounts: async (connection, realm, governancePk) => {
    set((s) => {
      s.loadGovernedAccounts = false
    })

    const governancesArray = _get().governancesArray.filter(
      (x) => x.pubkey?.toBase58() === governancePk.toBase58()
    )

    const previousAccounts = _get().assetAccounts.filter(
      (x) => x.governance?.pubkey?.toBase58() !== governancePk.toBase58()
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
        .filter(filterOutHiddenAccs)
      s.assetAccounts = [...previousAccounts, ...accounts].filter(
        filterOutHiddenAccs
      )
    })
  },
}))
export default useGovernanceAssetsStore

const getTokenAccountObj = async (
  governance: ProgramAccount<Governance>,
  tokenAccount: TokenProgramAccount<AccountInfo>,
  mintAccounts: TokenProgramAccount<MintInfo>[]
) => {
  const isNftAccount =
    tokenAccount.account.mint.toBase58() === DEFAULT_NFT_TREASURY_MINT
  const mint = mintAccounts.find(
    (x) => x.publicKey.toBase58() === tokenAccount.account.mint.toBase58()
  )
  if (isNftAccount) {
    return new AccountTypeNFT(tokenAccount, mint!, governance)
  }

  if (
    mint?.account.supply &&
    mint?.account.supply.cmpn(1) !== 0 &&
    mint.publicKey.toBase58() !== DEFAULT_NATIVE_SOL_MINT
  ) {
    return new AccountTypeToken(tokenAccount, mint!, governance)
  }
}

const getSolAccountsObj = async (
  connection: ConnectionContext,
  accounts: AssetAccount[],
  solAccountsInfo: SolAccInfo[],
  mintAccounts: TokenProgramAccount<MintInfo>[],
  governances: ProgramAccount<Governance>[]
) => {
  const solAccs: AccountTypeSol[] = []
  for (const i of solAccountsInfo) {
    const mint = mintAccounts.find((x) => x.publicKey.toBase58() === WSOL_MINT)
    const governance = governances.find(
      (x) => x.pubkey.toBase58() === i.governancePk.toBase58()
    )
    const account = await getSolAccountObj(
      governance!,
      connection,
      mint!,
      accounts,
      i
    )
    if (account) {
      solAccs.push(account)
    }
  }
  return solAccs as AssetAccount[]
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
  const mintsPks = [...tokenAccounts.map((x) => x.account.mint)]
  //WSOL is used as mint for sol accounts to calculate amounts
  if (!mintsPks.find((x) => x.toBase58() === WSOL_MINT)) {
    mintsPks.push(new PublicKey(WSOL_MINT))
  }
  const mintAccounts = mintsPks.length
    ? await getMintAccountsInfo(connection, [...mintsPks])
    : []
  const nativeSolAddresses = await Promise.all(
    governances.map((x) => getNativeTreasuryAddress(realm.owner, x!.pubkey))
  )
  const govNativeSolAddress = nativeSolAddresses.map((x, index) => {
    return {
      governanceAcc: governances[index],
      governancePk: governances[index].pubkey,
      nativeSolAddress: x,
    }
  })
  const solAccs = await getSolAccountsInfo(connection, govNativeSolAddress)

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
      const account = new AccountTypeAuxiliaryToken(tokenAccount, mint)
      if (account) {
        accounts.push(account)
      }
    }
  }
  const solAccounts = await getSolAccountsObj(
    connection,
    accounts,
    solAccs,
    mintAccounts,
    governances
  )
  if (solAccounts.length) {
    accounts.push(...solAccounts)
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

const getGenericAssetAccounts = (
  genericGovernances: ProgramAccount<Governance>[]
) => {
  const accounts: AccountTypeGeneric[] = []
  genericGovernances.forEach((programGov) => {
    const account = new AccountTypeGeneric(programGov)
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

const getSolAccountObj = async (
  governance: ProgramAccount<Governance>,
  connection: ConnectionContext,
  mint: TokenProgramAccount<MintInfo>,
  accounts: AssetAccount[],
  solAcc: SolAccInfo
) => {
  if (solAcc.acc) {
    const tokenAccountsOwnedBySolAccountInfo = await connection.current.getTokenAccountsByOwner(
      solAcc.nativeSolAddress,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    )
    const tokenAccountsOwnedBySolAccounts = tokenAccountsOwnedBySolAccountInfo.value.map(
      (x) => {
        const publicKey = x.pubkey
        const data = Buffer.from(x.account.data)
        const account = parseTokenAccountData(publicKey, data)
        return { publicKey, account }
      }
    )
    const groups = group(tokenAccountsOwnedBySolAccounts)
    const results = await Promise.all(
      groups.map((group) => {
        if (group.length) {
          return getMintAccountsInfo(
            connection,
            group.map((x) => x.account.mint)
          )
        } else {
          return []
        }
      })
    )

    const mintAccounts = results.flat()

    for (const acc of tokenAccountsOwnedBySolAccounts) {
      const account = await getTokenAccountObj(governance, acc, mintAccounts)
      if (account) {
        accounts.push(account)
      }
    }
    const minRentAmount = await connection.current.getMinimumBalanceForRentExemption(
      0
    )
    const solAccount = solAcc.acc as AccountInfoGen<Buffer | ParsedAccountData>
    solAccount.lamports =
      solAccount.lamports !== 0
        ? solAccount.lamports - minRentAmount
        : solAccount.lamports

    return new AccountTypeSol(
      mint!,
      solAcc.nativeSolAddress,
      solAccount,
      governance
    )
  }
}

const getAccountsForGovernances = async (
  connection: ConnectionContext,
  realm: ProgramAccount<Realm>,
  governancesArray: ProgramAccount<Governance>[]
) => {
  const mintGovernances = getGovernancesByAccountTypes(governancesArray, [
    GovernanceAccountType.MintGovernanceV1,
    GovernanceAccountType.MintGovernanceV2,
  ])
  const programGovernances = getGovernancesByAccountTypes(governancesArray, [
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ])

  const genericGovernances = getGenericAssetAccounts(governancesArray)

  const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
    connection.current,
    mintGovernances.map((x) => x.account.governedAccount)
  )
  const mintAccounts = getMintAccounts(mintGovernances, mintGovernancesMintInfo)
  const programAccounts = getProgramAssetAccounts(programGovernances)
  const auxiliaryTokenAccounts = AUXILIARY_TOKEN_ACCOUNTS[realm.account.name]
    ?.length
    ? AUXILIARY_TOKEN_ACCOUNTS[realm.account.name]
    : []

  const nativeAccountAddresses = await Promise.all(
    governancesArray.map((governance) =>
      getNativeTreasuryAddress(governance.owner, governance.pubkey)
    )
  )

  const fetchTokenAccounts = (addresses: string[]) =>
    axios.request({
      url: connection.endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(
        addresses.map((address) => ({
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
                    bytes: address, // base58 encoded string
                  },
                },
              ],
            },
          ],
        }))
      ),
    })

  const ownedByGovernancesTokenAccounts = await Promise.all([
    fetchTokenAccounts(nativeAccountAddresses.map((a) => a.toBase58())),
    fetchTokenAccounts(governancesArray.map((g) => g.pubkey.toBase58())),
    auxiliaryTokenAccounts?.length
      ? fetchTokenAccounts(auxiliaryTokenAccounts.map((x) => x.owner))
      : Promise.resolve({ data: [] }),
  ]).then(([x, y, z]) => x.data.concat(y.data).concat(z.data))

  const tokenAccountsJson = ownedByGovernancesTokenAccounts.map((x) => {
    const auxiliaryMatch = auxiliaryTokenAccounts.find(
      (auxAcc) => auxAcc.owner === x.id
    )
    if (auxiliaryMatch) {
      x.result = x.result?.filter((x) =>
        auxiliaryMatch.accounts.includes(x.pubkey)
      )
    }
    return x
  })
  const tokenAccountsParsed = tokenAccountsJson.length
    ? [...tokenAccountsJson.flatMap((x) => x.result)].map((x) => {
        const publicKey = new PublicKey(x.pubkey)
        const data = Buffer.from(x.account.data[0], 'base64')
        const account = parseTokenAccountData(publicKey, data)
        return { publicKey, account }
      })
    : []

  const groups = group(tokenAccountsParsed)
  const results = await Promise.all(
    groups.map((group) => {
      if (group.length) {
        return getTokenAssetAccounts(group, governancesArray, realm, connection)
      } else {
        return []
      }
    })
  )
  const allResults = results.flat()

  // remove potential duplicates
  const existing = new Set<string>()
  const deduped: AssetAccount[] = []

  for (const account of allResults) {
    if (!existing.has(account.pubkey.toBase58())) {
      existing.add(account.pubkey.toBase58())
      deduped.push(account)
    }
  }

  const tokenAssetAccounts = deduped

  const governedTokenAccounts = tokenAssetAccounts
  await tokenService.fetchTokenPrices(
    governedTokenAccounts
      .filter((x) => x.extensions.mint?.publicKey)
      .map((x) => x.extensions.mint!.publicKey.toBase58())
  )
  return [
    ...mintAccounts,
    ...programAccounts,
    ...governedTokenAccounts,
    ...genericGovernances,
  ]
}

const getMintAccountsInfo = async (
  connection: ConnectionContext,
  pubkeys: PublicKey[]
) => {
  const mintAccountsInfo = await axios.request({
    url: connection.endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify([
      ...pubkeys.map((x) => {
        return {
          jsonrpc: '2.0',
          id: x.toBase58(),
          method: 'getAccountInfo',
          params: [
            x.toBase58(),
            {
              commitment: connection.current.commitment,
              encoding: 'base64',
            },
          ],
        }
      }),
    ]),
  })
  const mintAccountsJson = mintAccountsInfo.data
  const mintAccountsParsed = mintAccountsJson?.map((x) => {
    const result = x.result
    const publicKey = new PublicKey(x.id)
    const data = Buffer.from(result.value.data[0], 'base64')
    const account = parseMintAccountData(data)
    return { publicKey, account }
  })
  return mintAccountsParsed
}

const getSolAccountsInfo = async (
  connection: ConnectionContext,
  pubkeys: { governancePk: PublicKey; nativeSolAddress: PublicKey }[]
) => {
  const solAccountsInfo = await axios.request({
    url: connection.endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify([
      ...pubkeys.map((x) => {
        return {
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
        }
      }),
    ]),
  })
  const solAccountsJson = solAccountsInfo.data
  const solAccountsParsed = solAccountsJson?.length
    ? solAccountsJson
        .flatMap((x, index) => {
          return {
            acc: x.result.value,
            ...pubkeys[index],
          }
        })
        .filter((x) => x.acc)
    : []
  return solAccountsParsed as SolAccInfo[]
}

const filterOutHiddenAccs = (x: AssetAccount) => {
  const pubkey = typeof x.pubkey === 'string' ? x.pubkey : x.pubkey.toBase58()
  return (
    HIDDEN_TREASURES.findIndex((x) => x === pubkey) === -1 &&
    (!x.extensions.token ||
      !x.extensions.token?.account.isFrozen ||
      x.type !== AccountType.GENERIC)
  )
}
