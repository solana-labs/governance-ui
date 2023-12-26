import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'
import { gistApi } from './github'
import { arweaveDescriptionApi } from './arweave'

export function capitalize(str?: string) {
  return str ? str?.charAt(0).toUpperCase() + str?.slice(1) : str
}

export function chunks<T>(array: T[], size: number): T[][] {
  const result: Array<T[]> = []
  let i, j
  for (i = 0, j = array.length; i < j; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

//SanitizedObject class helps prevent prototype pollution with creating obj without prototype
export class SanitizedObject {
  constructor(obj) {
    return Object.assign(Object.create(null), obj)
  }
}

export async function resolveProposalDescription(descriptionLink: string) {
  try {
    gistApi.cancel()
    arweaveDescriptionApi.cancel()
    let desc = ''
    const url = new URL(descriptionLink)

    if (url.toString().includes('gist')) {
      desc = await gistApi.fetchGistFile(url.toString())
    }

    if (url.toString().includes('arweave')) {
      desc = await arweaveDescriptionApi.fetchArweaveFile(url.toString())
    }

    return desc ? desc : descriptionLink
  } catch {
    return descriptionLink
  }
}

export function preventNegativeNumberInput(ev) {
  const value = ev.target.value
  if (!isNaN(value) && value < 0) {
    ev.target.value = 0
  } else if (isNaN(value)) {
    ev.target.value = value.slice(0, value.length - 1)
  }
}

export const firstOrNull = <T>(
  arr: ReadonlyArray<T> | null | undefined
): T | null => {
  if (arr !== null && arr !== undefined) {
    return arr[0] ?? null
  }
  return null
}

export async function getFilteredProgramAccounts(
  connection: Connection,
  programId: PublicKey,
  filters
): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
  // @ts-ignore
  const resp = await connection._rpcRequest('getProgramAccounts', [
    programId.toBase58(),
    {
      commitment: connection.commitment,
      filters,
      encoding: 'base64',
    },
  ])
  if (resp.error) {
    throw new Error(resp.error.message)
  }
  return resp.result.map(
    ({ pubkey, account: { data, executable, owner, lamports } }) => ({
      publicKey: new PublicKey(pubkey),
      accountInfo: {
        data: Buffer.from(data[0], 'base64'),
        executable,
        owner: new PublicKey(owner),
        lamports,
      },
    })
  )
}

export const getProposalDepositPk = (
  proposal: PublicKey,
  proposalOwnerWallet: PublicKey,
  programId: PublicKey
) => {
  const [proposalDeposit] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('proposal-deposit'),
      proposal.toBuffer(),
      proposalOwnerWallet.toBuffer(),
    ],
    programId
  )
  return proposalDeposit
}
