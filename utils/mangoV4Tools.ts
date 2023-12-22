import { MANGO_V4_ID, MangoClient } from '@blockworks-foundation/mango-v4'
import { AnchorProvider } from '@coral-xyz/anchor'
import queryClient from '@hooks/queries/queryClient'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import EmptyWallet from './Mango/listingTools'

export function getChangedValues<T extends Record<keyof T, any>>(
  originalValues: T,
  newValues: T,
  ignoredFields?: string[]
) {
  const values: any = {}
  for (const key of Object.keys(originalValues)) {
    const typeOfValue = typeof originalValues[key]
    if (
      (typeOfValue !== 'object' && originalValues[key] !== newValues[key]) ||
      (typeOfValue === 'object' &&
        JSON.stringify(originalValues[key]) !== JSON.stringify(newValues[key]))
    ) {
      values[key] = newValues[key]
    } else {
      values[key] = null
    }
    if (ignoredFields?.length && ignoredFields.find((x) => x === key)) {
      values[key] = newValues[key]
    }
  }
  return values as Partial<T>
}

export function getNullOrTransform<T>(
  val: any,
  classTransformer: (new (val: any) => T) | null,
  functionTransformer?: (val) => T
): T | null {
  if (val === null) {
    return null
  }
  if (typeof functionTransformer !== 'undefined') {
    return functionTransformer(val)
  }
  if (classTransformer !== null) {
    return new classTransformer(val)
  }
  return null
}

export const getClient = async (connection: Connection) => {
  const client = await queryClient.fetchQuery({
    queryKey: ['mangoClient', connection.rpcEndpoint],
    queryFn: async () => {
      const options = AnchorProvider.defaultOptions()
      const adminProvider = new AnchorProvider(
        connection,
        new EmptyWallet(Keypair.generate()),
        options
      )
      const client = MangoClient.connect(
        adminProvider,
        'mainnet-beta',
        MANGO_V4_ID['mainnet-beta']
      )

      return client
    },
  })
  return client
}
export const getGroupForClient = async (
  client: MangoClient,
  groupPk: PublicKey
) => {
  const group = await queryClient.fetchQuery({
    queryKey: ['mangoGroup', groupPk.toBase58(), client.connection.rpcEndpoint],
    queryFn: async () => {
      const response = await client.getGroup(groupPk)
      return response
    },
  })
  return group
}
