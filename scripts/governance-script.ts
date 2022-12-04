import fs from 'fs'
import { BinaryWriter, serialize, Schema, BorshError } from 'borsh'

import { Account, AccountInfo, Connection, PublicKey } from '@solana/web3.js'

import {
  deserializeBorsh,
  getGovernanceAccount,
  getGovernanceAccounts,
  getGovernanceSchemaForAccount,
  getRealm,
  Governance,
  GovernanceAccountClass,
  GovernanceAccountParser,
  GovernanceAccountType,
  ProgramMetadata,
  Proposal,
  ProposalTransaction,
  pubkeyFilter,
  Realm,
  RealmConfigAccount,
  SignatoryRecord,
  TokenOwnerRecord,
  VoteRecord,
  VoteThreshold,
  VoteThresholdType,
} from '@solana/spl-governance'
import * as anchor from '@project-serum/anchor'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'

import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getAccountsForGovernances } from './governanceAccounts'
import { ConnectionContext } from '@utils/connection'

const { RPC_URL, GOV_PROGRAM_ID, VSR_PROGRAM_ID, REALM_ID, OUT } = process.env

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

const outDir = OUT || 'out'

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
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

function serializeAccount(acc: {
  pubkey: PublicKey
  account: AccountInfo<Buffer>
}): string {
  acc.account.rentEpoch ||= 0
  return JSON.stringify(
    {
      pubkey: acc.pubkey.toString(),
      account: {
        ...acc.account,
        data: [acc.account.data.toString('base64'), 'base64'],
        owner: acc.account.owner.toString(),
        space: acc.account.data.length,
      },
    },
    undefined,
    0
  )
}

function getGovernanceAccountClass(
  type: GovernanceAccountType
): GovernanceAccountClass | undefined {
  switch (type) {
    case GovernanceAccountType.RealmV1:
    case GovernanceAccountType.RealmV2:
      return Realm
    case GovernanceAccountType.TokenOwnerRecordV1:
    case GovernanceAccountType.TokenOwnerRecordV2:
      return TokenOwnerRecord
    case GovernanceAccountType.GovernanceV1:
    case GovernanceAccountType.GovernanceV2:
    case GovernanceAccountType.MintGovernanceV1:
    case GovernanceAccountType.MintGovernanceV2:
    case GovernanceAccountType.ProgramGovernanceV1:
    case GovernanceAccountType.ProgramGovernanceV2:
    case GovernanceAccountType.TokenGovernanceV1:
    case GovernanceAccountType.TokenGovernanceV2:
      return Governance
    case GovernanceAccountType.ProposalV1:
    case GovernanceAccountType.ProposalV2:
      return Proposal
    case GovernanceAccountType.SignatoryRecordV1:
    case GovernanceAccountType.SignatoryRecordV2:
      return SignatoryRecord
    case GovernanceAccountType.VoteRecordV1:
    case GovernanceAccountType.VoteRecordV2:
      return VoteRecord
    case GovernanceAccountType.ProposalInstructionV1:
    case GovernanceAccountType.ProposalTransactionV2:
      return ProposalTransaction
    case GovernanceAccountType.RealmConfig:
      return RealmConfigAccount
    case GovernanceAccountType.ProgramMetadata:
      return ProgramMetadata
  }
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

function capitalizeFirstLetter(string: String): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function serializeField(
  schema: Schema,
  fieldName: any,
  value: any,
  fieldType: any,
  writer: any
) {
  try {
    // TODO: Handle missing values properly (make sure they never result in just skipped write)
    if (typeof fieldType === 'string') {
      writer[`write${capitalizeFirstLetter(fieldType)}`](value)
    } else if (fieldType instanceof Array) {
      if (typeof fieldType[0] === 'number') {
        if (value.length !== fieldType[0]) {
          throw new BorshError(
            `Expecting byte array of length ${fieldType[0]}, but got ${value.length} bytes`
          )
        }
        writer.writeFixedArray(value)
      } else if (fieldType.length === 2 && typeof fieldType[1] === 'number') {
        if (value.length !== fieldType[1]) {
          throw new BorshError(
            `Expecting byte array of length ${fieldType[1]}, but got ${value.length} bytes`
          )
        }
        for (let i = 0; i < fieldType[1]; i++) {
          serializeField(schema, null, value[i], fieldType[0], writer)
        }
      } else {
        writer.writeArray(value, (item: any) => {
          serializeField(schema, fieldName, item, fieldType[0], writer)
        })
      }
    } else if (fieldType.kind !== undefined) {
      switch (fieldType.kind) {
        case 'option': {
          if (value === null || value === undefined) {
            writer.writeU8(0)
          } else {
            writer.writeU8(1)
            serializeField(schema, fieldName, value, fieldType.type, writer)
          }
          break
        }
        case 'map': {
          writer.writeU32(value.size)
          value.forEach((val: any, key: any) => {
            serializeField(schema, fieldName, key, fieldType.key, writer)
            serializeField(schema, fieldName, val, fieldType.value, writer)
          })
          break
        }
        default:
          throw new BorshError(`FieldType ${fieldType} unrecognized`)
      }
    } else {
      serializeStruct(schema, value, writer)
    }
  } catch (error) {
    if (error instanceof BorshError) {
      error.addToFieldPath(fieldName)
    }
    throw error
  }
}

function serializeStruct(schema: Schema, obj: any, writer: BinaryWriter) {
  if (typeof obj.borshSerialize === 'function') {
    obj.borshSerialize(writer)
    return
  }

  const structSchema = schema.get(obj.constructor)
  if (!structSchema) {
    throw new BorshError(`Class ${obj.constructor.name} is missing in schema`)
  }
  if (structSchema.kind === 'struct') {
    structSchema.fields.map(([fieldName, fieldType]: [string, any]) => {
      serializeField(schema, fieldName, obj[fieldName], fieldType, writer)
    })
  } else if (structSchema.kind === 'enum') {
    const name = obj[structSchema.field]
    for (let idx = 0; idx < structSchema.values.length; ++idx) {
      const [fieldName, fieldType] = structSchema.values[idx]
      if (fieldName === name) {
        writer.writeU8(idx)
        serializeField(schema, fieldName, obj[fieldName], fieldType, writer)
        break
      }
    }
  } else {
    throw new BorshError(
      `Unexpected schema kind: ${structSchema.kind} for ${obj.constructor.name}`
    )
  }
}

function serializeBorsh(schema: Schema, obj: any): any {
  const writer = new BinaryWriter()
  serializeStruct(schema, obj, writer)
  return writer.toArray()
}

async function main() {
  const govProgramAccounts = await conn.getProgramAccounts(gov)
  const vsrProgramAccounts = await conn.getProgramAccounts(vsr)
  console.log(
    'govProgramAccounts',
    govProgramAccounts.length,
    'vsrProgramAccounts',
    vsrProgramAccounts.length
  )

  ensureDir(`${outDir}/${gov.toString()}/accounts`)
  for (let acc of govProgramAccounts) {
    let path = `${outDir}/${gov.toString()}/accounts/${acc.pubkey.toString()}.json`
    let accountType = acc.account.data[0]
    let schema = getGovernanceSchemaForAccount(accountType)
    let accountClass = getGovernanceAccountClass(accountType)
    if (accountClass) {
      const buffer = Buffer.from(acc.account.data)
      const data = deserializeBorsh(schema, accountClass, buffer)
      switch (accountClass) {
        case Governance:
          let governance = data as Governance
          governance.config.maxVotingTime = 333
          acc.account.data = Buffer.from(serializeBorsh(schema, governance))
          // overwrite governance accounts with lower voting time
          fs.writeFileSync(path, serializeAccount(acc))
      }
    } else {
      console.error('could not deduce class for', path, acc.account.data[0])
    }
  }

  let client = await VsrClient.connect(anchor.AnchorProvider.local(RPC_URL!))

  let registrars = await client.program.account.registrar.all()
  let voters = await client.program.account.voter.all()

  let tokenAccounts: PublicKey[] = []
  for (let voter of voters) {
    let path = `${outDir}/${vsr.toString()}/accounts/${voter.publicKey.toString()}.json`
    let registrar = registrars.find((r) =>
      r.publicKey.equals(voter.account.registrar)
    )
    let votingMints = (registrar!.account.votingMints as { mint: PublicKey }[])
      .map((vm) => vm.mint)
      .filter((m) => !PublicKey.default.equals(m))

    for (let mint of votingMints) {
      let voterAta = await findAssociatedTokenAddress(voter.publicKey, mint)
      let walletAta = await findAssociatedTokenAddress(
        voter.account.voterAuthority,
        mint
      )
      tokenAccounts.push(voterAta, walletAta)
    }
  }

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

  console.log({
    governances: governances,
    assetAccounts: accounts,
  })

  console.log(
    'associated token accounts',
    tokenAccounts.length,
    'unique',
    Array.from(new Set(tokenAccounts)).length
  )
}

main()
