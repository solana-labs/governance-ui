import { AnchorProvider, BorshInstructionCoder } from '@coral-xyz/anchor'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { AccountMetaData, getRealm } from '@solana/spl-governance'
import { Connection, Keypair } from '@solana/web3.js'
import { fmtTokenAmount } from '@utils/formatting'
import { tryGetMint } from '@utils/tokens'
import { DEFAULT_NFT_VOTER_PLUGIN } from '@tools/constants'
import EmptyWallet from '@utils/Mango/listingTools'

export const NFT_VOTER_INSTRUCTIONS = {
  [DEFAULT_NFT_VOTER_PLUGIN]: {
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
          const options = AnchorProvider.defaultOptions()
          const provider = new AnchorProvider(
            connection,
            new EmptyWallet(Keypair.generate()),
            options
          )
          const nftClient = await NftVoterClient.connect(provider)
          const decodedInstructionData = new BorshInstructionCoder(
            nftClient.program.idl
          ).decode(Buffer.from(data))?.data as any
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
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        try {
          const options = AnchorProvider.defaultOptions()
          const provider = new AnchorProvider(
            connection,
            new EmptyWallet(Keypair.generate()),
            options
          )
          const realm = await getRealm(connection, accounts[1].pubkey)
          const mint = await tryGetMint(connection, realm.account.communityMint)
          const nftClient = await NftVoterClient.connect(provider)
          const decodedInstructionData = new BorshInstructionCoder(
            nftClient.program.idl
          ).decode(Buffer.from(data))?.data as any
          const weight = fmtTokenAmount(
            decodedInstructionData.weight,
            mint?.account.decimals
          )
          return (
            <div className="space-y-3">
              <div>Size: {decodedInstructionData.size}</div>
              <div>
                Weight: {weight} ({decodedInstructionData.weight.toNumber()})
              </div>
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
