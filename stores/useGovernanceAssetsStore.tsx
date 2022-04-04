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
} from '@utils/tokens'
import { Connection, ParsedAccountData, PublicKey } from '@solana/web3.js'
import { AccountInfo, MintInfo } from '@solana/spl-token'
import { AccountInfo as AccountInfoGeneric } from '@solana/web3.js'
import { BN, TokenAccountLayout } from '@blockworks-foundation/mango-client'
import tokenService from '@utils/services/token'
import { ConnectionContext } from '@utils/connection'
import axios from 'axios'
import {
  AccountType,
  AccountTypeMint,
  AccountTypeNFT,
  AccountTypeProgram,
  AccountTypeSol,
  AccountTypeToken,
  AssetAccount,
} from '@utils/uiTypes/assets'

const tokenAccountOwnerOffset = 32
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
      s.governedTokenAccounts = accounts.filter(
        (x) =>
          x.type === AccountType.TOKEN ||
          x.type === AccountType.NFT ||
          x.type === AccountType.SOL
      )
      s.assetAccounts = accounts
    })
  },
  refetchGovernanceAccounts: async (connection, realm, governancePk) => {
    set((s) => {
      s.loadGovernedAccounts = false
    })
    const governancesArray = _get().governancesArray.filter(
      (x) => x.pubkey.toBase58() === governancePk.toBase58()
    )
    const previousAccounts = _get().assetAccounts.filter(
      (x) => x.governance.pubkey.toBase58() !== governancePk.toBase58()
    )
    const accounts = await getAccountsForGovernances(
      connection,
      realm,
      governancesArray
    )
    set((s) => {
      s.loadGovernedAccounts = false
      s.governedTokenAccounts = [
        ...previousAccounts,
        ...accounts.filter(
          (x) =>
            x.type === AccountType.TOKEN ||
            x.type === AccountType.NFT ||
            x.type === AccountType.SOL
        ),
      ]
      s.assetAccounts = [...previousAccounts, ...accounts]
    })
  },
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
  connection: ConnectionContext,
  accounts: AssetAccount[],
  mintAccounts: TokenProgramAccount<MintInfo>[]
) => {
  const isSol = tokenAccount.account.mint.toBase58() === DEFAULT_NATIVE_SOL_MINT
  const isNft =
    tokenAccount.account.mint.toBase58() === DEFAULT_NFT_TREASURY_MINT
  const mint = mintAccounts.find(
    (x) => x.publicKey.toBase58() === tokenAccount.account.mint.toBase58()
  )
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
    if (isNft) {
      return new AccountTypeNFT(tokenAccount, mint!, governance)
    }
    return new AccountTypeToken(tokenAccount, mint!, governance)
  }
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
  const mintAccounts = tokenAccounts.length
    ? await getMintAccountsInfo(
        connection,
        tokenAccounts.map((x) => x.account.mint)
      )
    : []
  for (const tokenAccount of tokenAccounts) {
    const governance = governances.find(
      (x) => x.pubkey.toBase58() === tokenAccount.account.owner.toBase58()
    )
    const account = await getTokenAccountsObj(
      realm,
      governance!,
      tokenAccount,
      connection,
      accounts,
      mintAccounts
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
  connection: ConnectionContext,
  tokenAccount: TokenProgramAccount<AccountInfo>,
  mint: TokenProgramAccount<MintInfo>,
  accounts: AssetAccount[]
) => {
  const solAddress = await getNativeTreasuryAddress(
    realm.owner,
    governance!.pubkey
  )
  const resp = await connection.current.getParsedAccountInfo(solAddress)
  if (resp.value) {
    const accountsOwnedBySolAccount = (
      await getAccountsByOwner(
        connection.current,
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

    const mintAccounts = accountsOwnedBySolAccount.length
      ? await getMintAccountsInfo(
          connection,
          accountsOwnedBySolAccount.map((x) => x.account.mint)
        )
      : []
    for (const acc of accountsOwnedBySolAccount) {
      const account = await getTokenAccountsObj(
        realm,
        governance,
        acc,
        connection,
        accounts,
        mintAccounts
      )
      if (account) {
        accounts.push(account)
      }
    }
    const mintRentAmount = await connection.current.getMinimumBalanceForRentExemption(
      0
    )
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
  const tokenGovernanes = getGovernancesByAccountTypes(governancesArray, [
    GovernanceAccountType.TokenGovernanceV1,
    GovernanceAccountType.TokenGovernanceV2,
  ])
  const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
    connection.current,
    mintGovernances.map((x) => x.account.governedAccount)
  )
  const mintAccounts = getMintAccounts(mintGovernances, mintGovernancesMintInfo)
  const programAccounts = getProgramAssetAccounts(programGovernances)
  const getOwnedTokenAccounts = await axios.request({
    url: connection.endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify([
      ...tokenGovernanes.map((x) => {
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
  const tokenAccounts = tokenAccountsJson.lenght
    ? tokenAccountsJson
        .flatMap((x) => x.result)
        .map((x) => {
          const publicKey = new PublicKey(x.pubkey)
          const data = Buffer.from(x.account.data[0], 'base64')
          const account = parseTokenAccountData(publicKey, data)
          return { publicKey, account }
        })
    : []

  const tokenAssetAccounts = await getTokenAssetAccounts(
    tokenAccounts,
    tokenGovernanes,
    realm,
    connection
  )
  const governedTokenAccounts = tokenAssetAccounts
  await tokenService.fetchTokenPrices(
    governedTokenAccounts
      .filter((x) => x.extensions.mint?.publicKey)
      .map((x) => x.extensions.mint!.publicKey.toBase58())
  )
  return [...mintAccounts, ...programAccounts, ...governedTokenAccounts]
}

const getMintAccountsInfo = async (
  connection: ConnectionContext,
  pubkeys: PublicKey[]
) => {
  const getMintsAccounts = await axios.request({
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
  const mintAccountsJson = getMintsAccounts.data
  const mintAccounts = mintAccountsJson?.map((x) => {
    const result = x.result
    const publicKey = new PublicKey(x.id)
    const data = Buffer.from(result.value.data[0], 'base64')
    const account = parseMintAccountData(data)
    return { publicKey, account }
  })
  return mintAccounts
}
