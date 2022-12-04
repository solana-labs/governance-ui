import { Connection, PublicKey } from '@solana/web3.js'
import { getAccountsForGovernances } from './governanceAccounts'
import { ConnectionContext } from '@utils/connection'
import {
  getGovernanceAccounts,
  getRealm,
  Governance,
  pubkeyFilter,
} from '@solana/spl-governance'

const { RPC_URL, REALM_ID } = process.env

const conn = new Connection(RPC_URL || '')
const connectionContext: ConnectionContext = {
  cluster: 'mainnet',
  endpoint: conn.rpcEndpoint,
  current: conn,
}

const realm = new PublicKey(REALM_ID || '')

export async function main() {
  const realmAcc = await getRealm(conn, realm)
  const governances = await getGovernanceAccounts(
    conn,
    realmAcc.owner,
    Governance,
    [pubkeyFilter(1, realmAcc.pubkey)!]
  )
  const accounts = await getAccountsForGovernances(
    connectionContext,
    realmAcc,
    governances
  )
  //tokenownerrecords
  console.log({
    governances: governances,
    assetAccounts: accounts,
  })
}

main()
