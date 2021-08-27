import { Connection, PublicKey } from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import {
  GovernanceAccount,
  GovernanceAccountClass,
  GovernanceAccountType,
  Realm,
} from './accounts'

import { ParsedAccount } from './core/accounts'
import { getBorshProgramAccounts, MemcmpFilter, RpcContext } from './core/api'
import { BorshAccountParser } from './core/serialisation'

export async function getRealms(rpcContext: RpcContext) {
  return getBorshProgramAccounts<Realm>(
    rpcContext.programId,
    GOVERNANCE_SCHEMA,
    rpcContext.endpoint,
    Realm
  )
}

export async function getGovernanceAccounts<TAccount extends GovernanceAccount>(
  programId: PublicKey,
  endpoint: string,
  accountClass: GovernanceAccountClass,
  accountTypes: GovernanceAccountType[],
  filters: MemcmpFilter[] = []
) {
  if (accountTypes.length === 1) {
    return getBorshProgramAccounts<TAccount>(
      programId,
      GOVERNANCE_SCHEMA,
      endpoint,
      accountClass as any,
      filters,
      accountTypes[0]
    )
  }

  const all = await Promise.all(
    accountTypes.map((at) =>
      getBorshProgramAccounts<TAccount>(
        programId,
        GOVERNANCE_SCHEMA,
        endpoint,
        accountClass as any,
        filters,
        at
      )
    )
  )

  return all.reduce((res, r) => ({ ...res, ...r }), {}) as Record<
    string,
    ParsedAccount<TAccount>
  >
}

export async function getGovernanceAccount<TAccount extends GovernanceAccount>(
  connection: Connection,
  accountPubKey: PublicKey,
  accountClass: GovernanceAccountClass
) {
  const accountInfo = await connection.getAccountInfo(accountPubKey)
  const account = BorshAccountParser(accountClass, GOVERNANCE_SCHEMA)(
    accountPubKey,
    accountInfo
  )

  return account as ParsedAccount<TAccount>
}
