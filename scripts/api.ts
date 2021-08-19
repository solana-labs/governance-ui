import { PublicKey } from '@solana/web3.js'
import * as bs58 from 'bs58'
import {
  Realm,
  GovernanceAccountType,
  GovernanceAccount,
  GovernanceAccountClass,
} from '../models/accounts'
import { RpcContext } from '../models/api'
import { ParsedAccount, GOVERNANCE_SCHEMA } from '../models/serialisation'
import { deserializeBorsh } from '../utils/borsh'

const fetch = require('node-fetch')

export interface IWallet {
  publicKey: PublicKey
}

export class MemcmpFilter {
  offset: number
  bytes: Buffer

  constructor(offset: number, bytes: Buffer) {
    this.offset = offset
    this.bytes = bytes
  }

  isMatch(buffer: Buffer) {
    if (this.offset + this.bytes.length > buffer.length) {
      return false
    }

    for (let i = 0; i < this.bytes.length; i++) {
      if (this.bytes[i] !== buffer[this.offset + i]) return false
    }

    return true
  }
}

export const pubkeyFilter = (
  offset: number,
  pubkey: PublicKey | undefined | null
) => (!pubkey ? undefined : new MemcmpFilter(offset, pubkey.toBuffer()))

export async function getRealms(rpcContext: RpcContext) {
  return getGovernanceAccountsImpl<Realm>(
    rpcContext.programId,
    rpcContext.endpoint,
    Realm,
    GovernanceAccountType.Realm
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

  const all = await Promise.all(
    accountTypes.map((at) =>
      getGovernanceAccountsImpl<TAccount>(
        programId,
        endpoint,
        accountClass,
        at,
        filters
      )
    )
  )

  return all.reduce((res, r) => ({ ...res, ...r }), {}) as Record<
    string,
    ParsedAccount<TAccount>
  >
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
  const rawAccounts = (await getProgramAccounts.json())['result']
  const accounts: Record<string, ParsedAccount<TAccount>> = {}

  for (const rawAccount of rawAccounts) {
    try {
      const account = {
        pubkey: new PublicKey(rawAccount.pubkey),
        account: {
          ...rawAccount.account,
          data: [], // There is no need to keep the raw data around once we deserialize it into TAccount
        },
        info: deserializeBorsh(
          GOVERNANCE_SCHEMA,
          accountClass,
          Buffer.from(rawAccount.account.data[0], 'base64')
        ),
      }

      accounts[account.pubkey.toBase58()] = account
    } catch (ex) {
      console.error(`Can't deserialize ${accountClass}`, ex)
    }
  }

  return accounts
}
