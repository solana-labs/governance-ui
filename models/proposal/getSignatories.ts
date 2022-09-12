import { Connection, PublicKey } from '@solana/web3.js'
import { pubkeyFilter, SignatoryRecord } from '@solana/spl-governance'
import { none, map } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import { getAccountsByFilters } from '@models/accounts'

interface Args {
  connection: Connection
  proposalPk: PublicKey
  programId: PublicKey
}

export async function getSignatories({
  connection,
  programId,
  proposalPk,
}: Args) {
  const filter = pubkeyFilter(1, proposalPk)

  if (!filter) {
    return none
  }

  const accounts = await getAccountsByFilters<SignatoryRecord>({
    connection,
    programId,
    accountClass: SignatoryRecord,
    filters: [filter],
  })

  return pipe(
    accounts,
    map((accounts) => Object.values(accounts))
  )
}
