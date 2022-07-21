import {
  getGovernanceAccounts,
  GovernanceAccount,
  GovernanceAccountClass,
  ProgramAccount,
  MemcmpFilter,
} from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import { pipe } from 'fp-ts/function'
import { tryCatch, map, match } from 'fp-ts/TaskEither'
import { some, none } from 'fp-ts/Option'

interface Args {
  accountClass: GovernanceAccountClass
  connection: Connection
  filters: MemcmpFilter[]
  programId: PublicKey
}

export function getAccountsByFilters<AccountType extends GovernanceAccount>({
  accountClass,
  connection,
  filters,
  programId,
}: Args) {
  return pipe(
    tryCatch(
      () =>
        getGovernanceAccounts(
          connection,
          programId,
          (accountClass as unknown) as new (args: any) => AccountType,
          filters
        ),
      (error) =>
        error instanceof Error ? error : new Error('Could not fetch accounts')
    ),
    map((accounts) =>
      accounts.reduce((acc, account) => {
        acc[account.pubkey.toBase58()] = account
        return acc
      }, {} as { [address: string]: ProgramAccount<AccountType> })
    ),
    match((error) => {
      console.error(error)
      return none
    }, some)
  )()
}
