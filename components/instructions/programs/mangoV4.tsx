import { MangoClient } from '@blockworks-foundation/mango-v4'
import { AnchorProvider, BorshInstructionCoder } from '@coral-xyz/anchor'
import { Wallet } from '@marinade.finance/marinade-ts-sdk'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'

const instructions = () => ({
  8: {
    name: 'Edit Group',
    accounts: [{ name: 'Group' }, { name: 'Admin' }],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
})

export const MANGO_V4_INSTRUCTIONS = {
  '4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg': instructions(),
}

const getClient = async (connection: Connection) => {
  const options = AnchorProvider.defaultOptions()
  const adminProvider = new AnchorProvider(
    connection,
    new Wallet(Keypair.generate()),
    options
  )
  const client = await MangoClient.connect(
    adminProvider,
    'mainnet-beta',
    new PublicKey('78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX')
  )

  return client
}

const getArgs = async (connection: Connection, data: Uint8Array) => {
  const client = await getClient(connection)
  const decodedInstructionData = new BorshInstructionCoder(
    client.program.idl
  ).decode(Buffer.from(data))?.data as any

  const args = {}
  for (const key of Object.keys(decodedInstructionData)) {
    const val = decodedInstructionData[key]
    if (val !== null) {
      args[key] = val
    }
  }
  return args
}

const displayArgs = async (connection: Connection, data: Uint8Array) => {
  const args = await getArgs(connection, data)
  return (
    <div className="space-y-3">
      {Object.keys(args).map((key) => (
        <div key={key} className="flex">
          <div className="mr-3">{key}:</div>
          <div>{`${args[key]}`}</div>
        </div>
      ))}
    </div>
  )
}
