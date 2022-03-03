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
import { AccountInfo, MintInfo } from '@solana/spl-token'
import { BN, TokenAccountLayout } from '@blockworks-foundation/mango-client'
import tokenService from '@utils/services/token'
const tokenAccountOwnerOffset = 32
interface TokenAccountExtension {
  mint?: TokenProgramAccount<MintInfo> | undefined
  transferAddress?: PublicKey
  amount?: BN
  solAccount?: AccountInfoGen<Buffer | ParsedAccountData>
  token?: AccountInfo
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
}
interface GovernanceAssetsStore extends State {
  governancesArray: ProgramAccount<Governance>[]
  governedTokenAccounts: GovernedTokenAccount[]
  governedAccounts: GovernedAccount[]
  setGovernancesArray: (
    connection: Connection,
    governances: {
      [governance: string]: ProgramAccount<Governance>
    },
    realm: ProgramAccount<Realm>
  ) => void
  setGovernedTokenAccounts: (items: GovernedTokenAccount[]) => void
  setGovernedAccounts: (
    connection: Connection,
    items: ProgramAccount<Governance>[],
    realm: ProgramAccount<Realm>
  ) => void
}

const defaultState = {
  governancesArray: [],
  governedAccounts: [],
  governedTokenAccounts: [],
}

const useGovernanceAssetsStore = create<GovernanceAssetsStore>((set, _get) => ({
  ...defaultState,
  setGovernancesArray: (connection, governances, realm) => {
    const array = Object.keys(governances)
      .filter((gpk) => !HIDDEN_GOVERNANCES.has(gpk))
      .map((key) => governances[key])
    set((s) => {
      s.governancesArray = array
    })
    _get().setGovernedAccounts(connection, array, realm)
  },
  setGovernedAccounts: async (connection, governancesArray, realm) => {
    const mintAddresses: string[] = []

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
      governance?.accounts.push({
        type: AccountType.MINT,
        pubkey: governance.account.governedAccount,
        extensions: {
          mint: {
            publicKey: governance.account.governedAccount,
            account: parsedMintInfo,
          },
        },
      })
    })
    programGovernances.forEach((programGov) => {
      const governance = governedAccounts.find(
        (x) => x.pubkey.toBase58() === programGov.pubkey.toBase58()
      )
      governance?.accounts.push({
        type: AccountType.PROGRAM,
        pubkey: governance.account.governedAccount,
        extensions: {},
      })
    })
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

    for (const tokenAccount of tokenAccounts) {
      const governance = governedAccounts.find(
        (x) => x.pubkey.toBase58() === tokenAccount.account.owner.toBase58()
      )
      const account = await getTokenAccountsObj(
        realm,
        governance,
        tokenAccount,
        connection
      )
      governance?.accounts.push(account)
    }
    await tokenService.fetchTokenPrices(mintAddresses)
    set((s) => {
      s.governedAccounts = governedAccounts
    })
  },
  setGovernedTokenAccounts: (items) => {
    set((s) => {
      s.governedTokenAccounts = items
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
  realm,
  governance,
  tokenAccount,
  connection
) => {
  const isSol = tokenAccount.account.mint.toBase58() === DEFAULT_NATIVE_SOL_MINT
  const mint = await tryGetMint(connection, tokenAccount.account.mint)
  if (isSol) {
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
        governance?.accounts.push(account)
      }
      const mintRentAmount = await connection.getMinimumBalanceForRentExemption(
        0
      )
      const solAccount = resp.value as AccountInfoGen<
        Buffer | ParsedAccountData
      >
      solAccount.lamports =
        solAccount.lamports !== 0
          ? solAccount.lamports - mintRentAmount
          : solAccount.lamports

      return {
        type: AccountType.SOL,
        pubkey: tokenAccount.publicKey,
        extensions: {
          token: tokenAccount,
          mint: mint,
          transferAddress: solAddress,
          amount: tokenAccount.account.amount,
          solAccount: solAccount,
        },
      }
    }
  } else {
    return {
      ...tokenAccount,
      type: AccountType.TOKEN,
      pubkey: tokenAccount.publicKey,
      extensions: {
        token: tokenAccount,
        mint: mint,
        transferAddress: tokenAccount.publicKey,
        amount: tokenAccount.account.amount,
      },
    }
  }
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
