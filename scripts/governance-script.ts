import fs from 'fs'
import { BinaryWriter, serialize } from 'borsh'

import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'

import {
  getGovernanceAccounts,
  getGovernanceSchemaForAccount,
  getRealm,
  Governance,
  pubkeyFilter,
  VoteThreshold,
  VoteThresholdType,
} from '@solana/spl-governance'
import * as anchor from '@project-serum/anchor'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getAccountsForGovernances } from './governanceAccounts'
import { ConnectionContext } from '@utils/connection'

const {
  RPC_URL,
  GOV_PROGRAM_ID,
  VSR_PROGRAM_ID,
  GMA_LIMIT,
  REALM_ID,
  OUT,
} = process.env

const conn = new Connection(RPC_URL || 'https://api.mainnet-beta.solana.com/')

const connectionContext: ConnectionContext = {
  cluster: 'mainnet',
  endpoint: conn.rpcEndpoint,
  current: conn,
}

const gov = new PublicKey(
  GOV_PROGRAM_ID || 'GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J'
)
const vsr = new PublicKey(
  VSR_PROGRAM_ID || '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo'
)
const realm = new PublicKey(
  REALM_ID || 'DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE'
)

const gmaLimit = Number(GMA_LIMIT || 100)

const outDir = OUT || 'out'

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const chunkItems = <T>(items: T[], length: number) =>
  items.reduce((chunks: T[][], item: T, index) => {
    const chunk = Math.floor(index / length)
    chunks[chunk] = ([] as T[]).concat(chunks[chunk] || [], item)
    return chunks
  }, [])

function zip<S1, S2>(
  firstCollection: Array<S1>,
  lastCollection: Array<S2>
): Array<[S1, S2]> {
  const length = Math.min(firstCollection.length, lastCollection.length)
  const zipped: Array<[S1, S2]> = []

  for (let index = 0; index < length; index++) {
    zipped.push([firstCollection[index], lastCollection[index]])
  }

  return zipped
}

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
)

async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
  )[0]
}

function serializeAccount(pubkey: PublicKey, ai: AccountInfo<Buffer>): string {
  ai.rentEpoch ||= 0
  return JSON.stringify(
    {
      pubkey: pubkey.toString(),
      account: {
        ...ai,
        data: [ai.data.toString('base64'), 'base64'],
        owner: ai.owner.toString(),
        space: ai.data.length,
      },
    },
    undefined,
    0
  )
}

;(BinaryWriter.prototype as any).writePubkey = function (value: PublicKey) {
  const writer = (this as unknown) as BinaryWriter
  writer.writeFixedArray(value.toBuffer())
}
;(BinaryWriter.prototype as any).writeVoteThreshold = function (
  value: VoteThreshold
) {
  const writer = (this as unknown) as BinaryWriter
  writer.maybeResize()
  writer.buf.writeUInt8(value.type, writer.length)
  writer.length += 1

  // Write value for VoteThresholds with u8 value
  if (
    value.type === VoteThresholdType.YesVotePercentage ||
    value.type === VoteThresholdType.QuorumPercentage
  ) {
    writer.buf.writeUInt8(value.value!, writer.length)
    writer.length += 1
  }
}

async function main() {
  const client = await VsrClient.connect(
    anchor.AnchorProvider.local(RPC_URL!),
    vsr
  )
  const registrars = await client.program.account.registrar.all()
  const voters = await client.program.account.voter.all()

  console.log(
    'VSR registrars',
    registrars.length,
    'voters',
    voters.length,
    'realms',
    registrars.map((r) => r.account.realm.toString())
  )

  const voterAssociatedAccounts: PublicKey[] = []
  for (const voter of voters) {
    const registrar = registrars.find((r) =>
      r.publicKey.equals(voter.account.registrar)
    )
    const votingMints = (registrar!.account.votingMints as {
      mint: PublicKey
    }[])
      .map((vm) => vm.mint)
      .filter((m) => !PublicKey.default.equals(m))

    for (const mint of votingMints) {
      const voterAta = await findAssociatedTokenAddress(voter.publicKey, mint)
      const walletAta = await findAssociatedTokenAddress(
        voter.account.voterAuthority,
        mint
      )
      voterAssociatedAccounts.push(
        voter.account.voterAuthority,
        voterAta,
        walletAta
      )
    }
  }

  console.log(
    'voter associated accounts',
    voterAssociatedAccounts.length,
    'unique',
    Array.from(new Set(voterAssociatedAccounts)).length
  )

  ensureDir(`${outDir}/${vsr.toString()}/accounts`)
  for (const chunk of chunkItems(
    Array.from(new Set(voterAssociatedAccounts)),
    gmaLimit
  )) {
    const ais = await conn.getMultipleAccountsInfo(chunk)
    for (const [pk, ai] of zip(chunk, ais)) {
      if (ai) {
        const path = `${outDir}/${vsr.toString()}/accounts/${pk.toString()}.json`
        fs.writeFileSync(path, serializeAccount(pk, ai))
      }
    }
  }

  const realmAcc = await getRealm(conn, realm)
  const governances = await getGovernanceAccounts(
    conn,
    realmAcc.owner,
    Governance,
    [pubkeyFilter(1, realmAcc.pubkey)!]
  )
  const governancePKs = governances.map((g) => g.pubkey)

  console.log(
    'governances',
    governances.length,
    governancePKs.map((g) => g.toString())
  )

  const governanceAIs = await conn.getMultipleAccountsInfo(governancePKs)
  ensureDir(`${outDir}/${gov.toString()}/accounts`)
  for (const [{ account, pubkey }, ai] of zip(governances, governanceAIs)) {
    const path = `${outDir}/${gov.toString()}/accounts/${pubkey.toString()}.json`
    const schema = getGovernanceSchemaForAccount(account.accountType)
    account.config.maxVotingTime = 333
    ai!.data = Buffer.from(serialize(schema, account))
    fs.writeFileSync(path, serializeAccount(pubkey, ai!))
  }
  const assetAccounts = await getAccountsForGovernances(
    connectionContext,
    realmAcc,
    governances
  )

  console.log('assetAccounts', assetAccounts.length)

  const assetAccountsPKs = assetAccounts.map((a) => a.pubkey)
  const assetAccountsAIs = await conn.getMultipleAccountsInfo(assetAccountsPKs)

  for (const [pk, ai] of zip(assetAccountsPKs, assetAccountsAIs)) {
    if (ai) {
      const path = `${outDir}/${gov.toString()}/accounts/${pk.toString()}.json`
      fs.writeFileSync(path, serializeAccount(pk, ai))
    }
  }
}

main()
