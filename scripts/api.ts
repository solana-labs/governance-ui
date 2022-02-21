import { PublicKey } from '@solana/web3.js'
import { SanitizedObject } from 'utils/helpers'
import * as bs58 from 'bs58'
import {
  GovernanceAccount,
  GovernanceAccountClass,
  GovernanceAccountType,
  Realm,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { MemcmpFilter, RpcContext } from '@solana/spl-governance'
import { GOVERNANCE_SCHEMA } from '@solana/spl-governance'
import { deserializeBorsh } from 'utils/borsh'
import { sleep } from '@project-serum/common'

const fetch = require('node-fetch')

export async function getRealms(rpcContext: RpcContext) {
  return getGovernanceAccounts<Realm>(
    rpcContext.programId,
    rpcContext.endpoint,
    Realm,
    [GovernanceAccountType.RealmV1, GovernanceAccountType.RealmV2]
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
    return getGovernanceAccountsImpl<TAccount>(
      programId,
      endpoint,
      accountClass,
      accountTypes[0],
      filters
    )
  }

  let accounts: Record<string, ProgramAccount<TAccount>> = {}

  for (const at of accountTypes) {
    accounts = {
      ...accounts,
      ...(await getGovernanceAccountsImpl(
        programId,
        endpoint,
        accountClass,
        at,
        filters
      )),
    }

    // note: if we are not using a specific RPC, then most probably we are using a public RPC
    // sleep to prevent public RPC rate limits
    if (!process.env.CLUSTER_URL) {
      await sleep(3_000)
    }
  }

  return accounts
}

async function getGovernanceAccountsImpl<TAccount extends GovernanceAccount>(
  programId: PublicKey,
  endpoint: string,
  accountClass: GovernanceAccountClass,
  accountType: GovernanceAccountType,
  filters: MemcmpFilter[] = []
) {
  const getProgramAccounts = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getProgramAccounts',
      params: [
        programId.toBase58(),
        {
          commitment: 'single',
          encoding: 'base64',
          filters: [
            {
              memcmp: {
                offset: 0,
                bytes: bs58.encode([accountType]),
              },
            },
            ...filters.map((f) => ({
              memcmp: { offset: f.offset, bytes: bs58.encode(f.bytes) },
            })),
          ],
        },
      ],
    }),
  })

  const accounts: Record<
    string,
    ProgramAccount<TAccount>
  > = new SanitizedObject({}) as Record<string, ProgramAccount<TAccount>>
  try {
    const response = await getProgramAccounts.json()
    if ('result' in response) {
      const rawAccounts = response['result']
      for (const rawAccount of rawAccounts) {
        try {
          const account = new SanitizedObject({
            pubkey: new PublicKey(rawAccount.pubkey),
            account: new SanitizedObject({
              ...rawAccount.account,
              data: [], // There is no need to keep the raw data around once we deserialize it into TAccount
            }),
            info: deserializeBorsh(
              GOVERNANCE_SCHEMA,
              accountClass,
              Buffer.from(rawAccount.account.data[0], 'base64')
            ),
          }) as ProgramAccount<TAccount>

          accounts[account.pubkey.toBase58()] = account
        } catch (ex) {
          console.error(`Can't deserialize ${accountClass}`, ex)
        }
      }
    } else {
      console.error(`Unexpected response ${JSON.stringify(response)}`)
    }
  } catch (e) {
    console.error(e)
  }
  return accounts
}
