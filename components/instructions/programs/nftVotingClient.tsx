import { Wallet } from '@marinade.finance/marinade-ts-sdk'
import { Provider } from '@project-serum/anchor'
import { NftVoterClient } from '@solana/governance-program-library'
import { Connection, Keypair } from '@solana/web3.js'

export const NFT_VOTER_INSTRUCTIONS = {
  GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw: {
    132: {
      name: 'Create registrar',
      accounts: [
        { name: 'Registrar' },
        { name: 'Governance program id' },
        { name: 'Realm' },
        { name: 'Realm governing token mint' },
        { name: 'Realm authority' },
        { name: 'Payer' },
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {
        try {
          const options = Provider.defaultOptions()
          const provider = new Provider(
            connection,
            new Wallet(Keypair.generate()),
            options
          )
          const nftClient = await NftVoterClient.connect(provider)
          const decodedInstructionData = nftClient.program.coder.instruction.decode(
            Buffer.from(data)
          )?.data as any
          return (
            <div className="space-y-3">
              <div>
                Max collections: {decodedInstructionData.maxCollections}
              </div>
            </div>
          )
        } catch (e) {
          console.log(e)
          return <div>{JSON.stringify(data)}</div>
        }
      },
    },
    71: {
      name: 'Configure collection',
      accounts: [
        { name: 'Registrar' },
        { name: 'Realm' },
        { name: 'Realm authority' },
        { name: 'Collection' },
        { name: 'Max voter weight record' },
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {
        try {
          const options = Provider.defaultOptions()
          const provider = new Provider(
            connection,
            new Wallet(Keypair.generate()),
            options
          )
          const nftClient = await NftVoterClient.connect(provider)
          const decodedInstructionData = nftClient.program.coder.instruction.decode(
            Buffer.from(data)
          )?.data as any
          return (
            <div className="space-y-3">
              <div>Size: {decodedInstructionData.size}</div>
              <div>Weight: {decodedInstructionData.weight.toNumber()}</div>
            </div>
          )
        } catch (e) {
          console.log(e)
          return <div>{JSON.stringify(data)}</div>
        }
      },
    },
    182: {
      name: 'Create max voter weight record',
      accounts: [
        { name: 'Max voter weight record' },
        { name: 'Governance program id' },
        { name: 'Realm' },
        { name: 'Realm governing token mint' },
        { name: 'payer' },
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {
        try {
          return <div className="space-y-3"></div>
        } catch (e) {
          console.log(e)
          return <div>{JSON.stringify(data)}</div>
        }
      },
    },
  },
}
