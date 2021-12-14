import { Connection, PublicKey } from '@solana/web3.js'
import { WalletNotConnectedError } from './errors'
import bs58 from 'bs58'

import { ParsedAccount, ProgramAccountWithType } from '../core/accounts'
import { Schema } from 'borsh'
import { deserializeBorsh } from '../../utils/borsh'
import { ProgramVersion } from '@models/registry/api'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'

export const SYSTEM_PROGRAM_ID = new PublicKey(
  '11111111111111111111111111111111'
)

// Context to make RPC calls for given clone programId, current connection, endpoint and wallet
export class RpcContext {
  programId: PublicKey
  programVersion: ProgramVersion
  wallet: SignerWalletAdapter | undefined
  connection: Connection
  endpoint: string

  constructor(
    programId: PublicKey,
    programVersion: number | undefined,
    wallet: SignerWalletAdapter | undefined,
    connection: Connection,
    endpoint: string
  ) {
    this.programId = programId
    this.wallet = wallet
    this.connection = connection
    this.endpoint = endpoint
    this.programVersion = programVersion || ProgramVersion.V1
  }

  get walletPubkey() {
    if (!this.wallet?.publicKey) {
      throw new WalletNotConnectedError()
    }

    return this.wallet.publicKey
  }

  get programIdBase58() {
    return this.programId.toBase58()
  }
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

export const pubkeyFilter = (offset: number, pubkey: PublicKey) =>
  new MemcmpFilter(offset, pubkey.toBuffer())

export const booleanFilter = (offset: number, value: boolean) =>
  new MemcmpFilter(offset, Buffer.from(value ? [1] : [0]))

export async function getBorshProgramAccounts<
  TAccount extends ProgramAccountWithType
>(
  programId: PublicKey,
  borshSchema: Schema,
  endpoint: string,
  accountFactory: new (args: any) => TAccount,
  filters: MemcmpFilter[] = [],
  accountType?: number
) {
  accountType = accountType ?? new accountFactory({}).accountType

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
          commitment: 'recent',
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
  const accounts: { [pubKey: string]: ParsedAccount<TAccount> } = {}

  if (rawAccounts) {
    for (const rawAccount of rawAccounts) {
      try {
        const account = {
          pubkey: new PublicKey(rawAccount.pubkey),
          account: {
            ...rawAccount.account,
            data: [], // There is no need to keep the raw data around once we deserialize it into TAccount
          },
          info: deserializeBorsh(
            borshSchema,
            accountFactory,
            Buffer.from(rawAccount.account.data[0], 'base64')
          ),
        }

        accounts[account.pubkey.toBase58()] = account
      } catch (ex) {
        console.warn(`Can't deserialize ${accountFactory.name}`, ex)
      }
    }
  } else {
    console.error(`Can't fetch ${accountFactory.name} accounts`)
  }

  return accounts
}
