import { Connection, PublicKey } from '@solana/web3.js'
import { pubkeyFilter, TokenOwnerRecord } from '@solana/spl-governance'
import { none, map } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import { getAccountsByFilters } from '@models/accounts'

interface Args {
  connection: Connection
  governingTokenMint?: PublicKey
  programId: PublicKey
  realm: PublicKey
}

export async function getTokenOwnerRecords({
  connection,
  governingTokenMint,
  programId,
  realm,
}: Args) {
  const filter1 = pubkeyFilter(1, realm)
  const filter2 = pubkeyFilter(1 + 32, governingTokenMint)

  if (!(filter1 && filter2)) {
    return none
  }

  const accounts = await getAccountsByFilters<TokenOwnerRecord>({
    connection,
    programId,
    accountClass: TokenOwnerRecord,
    filters: [filter1, filter2],
  })

  return pipe(
    accounts,
    map((accounts) => Object.values(accounts))
  )
}
