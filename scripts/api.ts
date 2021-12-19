import { PublicKey } from '@solana/web3.js'
import * as bs58 from 'bs58'
import {
  GovernanceAccount,
  GovernanceAccountClass,
  GovernanceAccountType,
  Realm,
} from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { MemcmpFilter, RpcContext } from 'models/core/api'
import { GOVERNANCE_SCHEMA } from 'models/serialisation'
import { deserializeBorsh } from 'utils/borsh'
import { SanitizedObject } from 'utils/helpers'

const fetch = require('node-fetch')

export async function getRealms(rpcContext: RpcContext) {
  return getGovernanceAccounts<Realm>(
    rpcContext.programId,
    rpcContext.endpoint,
    Realm,
    [GovernanceAccountType.Realm]
  )
}

export async function getGovernanceAccounts<TAccount extends GovernanceAccount>(
  programId: PublicKey,
  endpoint: string,
  accountClass: GovernanceAccountClass,
  accountTypes: GovernanceAccountType[],
  filters: MemcmpFilter[] = []
) {
  const getProgramAccounts = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      // send multiple requests in a single batched RPC request
      accountTypes.map((accountType, i) => ({
        jsonrpc: '2.0',
        id: i + 1,
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
              ...filters.map(({ offset, bytes }) => ({
                memcmp: { offset, bytes: bs58.encode(bytes) },
              })),
            ],
          },
        ],
      }))
    ),
  })

  const accounts = new SanitizedObject({}) as Record<
    string,
    ParsedAccount<TAccount>
  >

  try {
    const responses = await getProgramAccounts.json()
    responses.forEach(({ result }) => {
      result.forEach((rawAccount) => {
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
          }) as ParsedAccount<TAccount>

          accounts[account.pubkey.toBase58()] = account
        } catch (err) {
          console.error(`Can't deserialize ${accountClass}`, err)
        }
      })
    })
  } catch (err) {
    console.error('Unexpected response', err)
  }

  return accounts
}
