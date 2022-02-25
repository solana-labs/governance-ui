import create, { State } from 'zustand'
import { Governance, TOKEN_PROGRAM_ID } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { HIDDEN_GOVERNANCES } from '@components/instructions/tools'
import { GovernedTokenAccount, parseTokenAccountData } from '@utils/tokens'
import { Connection, PublicKey } from '@solana/web3.js'
import { AccountInfo } from '@solana/spl-token'

interface GovernedAccount extends ProgramAccount<Governance> {
  accounts: {
    pubkey: PublicKey
    account: AccountInfo
    type: AccountType
  }[]
}

enum AccountType {
  TOKEN,
}
interface GovernanceAssetsStore extends State {
  governancesArray: ProgramAccount<Governance>[]
  governedTokenAccounts: GovernedTokenAccount[]
  governedAccounts: GovernedAccount[]
  setGovernancesArray: (
    connection: Connection,
    governances: {
      [governance: string]: ProgramAccount<Governance>
    }
  ) => void
  setGovernedTokenAccounts: (items: GovernedTokenAccount[]) => void
  setGovernedAccounts: (
    connection: Connection,
    items: ProgramAccount<Governance>[]
  ) => void
}

const defaultState = {
  governancesArray: [],
  governedAccounts: [],
  governedTokenAccounts: [],
}

const useGovernanceAssetsStore = create<GovernanceAssetsStore>((set, _get) => ({
  ...defaultState,
  setGovernancesArray: (connection, governances) => {
    const array = Object.keys(governances)
      .filter((gpk) => !HIDDEN_GOVERNANCES.has(gpk))
      .map((key) => governances[key])
    set((s) => {
      s.governancesArray = array
    })
    _get().setGovernedAccounts(connection, array)
  },
  setGovernedAccounts: async (connection, governancesArray) => {
    const governedAccounts: GovernedAccount[] = governancesArray.map((x) => {
      return {
        ...x,
        accounts: [],
      }
    })
    const tokenAccounts = (
      await Promise.all(
        governancesArray.map((x) =>
          getParsedAccountsByOwner(connection, TOKEN_PROGRAM_ID, x.pubkey)
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
      governance?.accounts.push({
        ...tokenAccount,
        type: AccountType.TOKEN,
        pubkey: tokenAccount.publicKey,
      })
    }
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

const getParsedAccountsByOwner = (
  connection: Connection,
  programId: PublicKey,
  owner: PublicKey
) => {
  return connection.getProgramAccounts(
    programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      filters: [
        {
          dataSize: 165, // number of bytes
        },
        {
          memcmp: {
            offset: 32, // number of bytes
            bytes: owner.toBase58(), // base58 encoded string
          },
        },
      ],
    }
  )
}
