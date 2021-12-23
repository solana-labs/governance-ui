import {
  getAccountTypes,
  Governance,
  Proposal,
  ProposalState,
} from '@models/accounts'
import { encode } from 'bs58'

const rpc = async (body) => {
  const res = await fetch('https://api.mainnet-beta.solana.com', {
    body: typeof body === 'string' ? body : JSON.stringify(body),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  })

  const json = await res.json()

  return json
}

const getGovernanceAccounts = async (realms) => {
  const body = getAccountTypes(Governance).flatMap((accountType) =>
    realms.map(({ realmId, programId }) => ({
      jsonrpc: '2.0',
      // toString() so that it'll work for both PublicKeys and strings
      id: [realmId.toString(), programId.toString(), accountType].join(':'),
      method: 'getProgramAccounts',
      params: [
        programId.toString(),
        {
          commitment: 'single',
          encoding: 'base64',
          filters: [
            {
              memcmp: {
                offset: 0,
                bytes: encode([accountType]),
              },
            },
            {
              memcmp: {
                offset: 1,
                bytes: realmId.toString(),
              },
            },
          ],
          dataSlice: { offset: 0, length: 0 },
        },
      ],
    }))
  )

  const json = await rpc(body)

  return json
}

const getCounts = async (ids: Record<string, Array<string>>) => {
  const flattened = Object.entries(ids).flatMap(([key, keys]) =>
    keys.map((k) => [key.split(':'), k])
  )

  const body = flattened.map(([[_realmId, programId], accountId], i) => ({
    jsonrpc: '2.0',
    id: i + 1,
    method: 'getProgramAccounts',
    params: [
      programId,
      {
        commitment: 'single',
        encoding: 'base64',
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: encode([getAccountTypes(Proposal)]),
            },
          },
          {
            memcmp: {
              offset: 1,
              bytes: accountId,
            },
          },
          {
            memcmp: {
              offset: 1 + 32 + 32,
              bytes: encode([ProposalState.Voting]),
            },
          },
        ],
        dataSlice: { offset: 0, length: 0 },
      },
    ],
  }))

  const json = await rpc(body)

  const result = flattened.reduce((acc, [[key]], i) => {
    acc[key] ??= 0
    acc[key] += json[i].result.length
    return acc
  }, {})

  return result
}

const getProposalCounts = async (realms) => {
  try {
    const governanceAccounts = await getGovernanceAccounts(realms)

    const ids = governanceAccounts.reduce((acc, { id, result }) => {
      const [realmId, programId] = id.split(':')
      const newId = [realmId, programId].join(':')
      result.forEach(({ pubkey }) => {
        acc[newId] ||= []
        acc[newId].push(pubkey)
      })
      return acc
    }, {})

    const counts = await getCounts(ids)
    return counts
  } catch (err) {
    if (realms.length > 0) console.error(err)
    return {}
  }
}

export default getProposalCounts
