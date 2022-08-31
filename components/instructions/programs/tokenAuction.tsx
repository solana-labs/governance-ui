import { Connection } from '@solana/web3.js'

const common_instructions = () => ({
  230: {
    name: 'Token Auction: Create Init Open Orders',
    accounts: [
      { name: 'Authority' },
      { name: 'Auction' },
      { name: 'Open orders' },
      { name: 'Order History' },
      { name: 'Quote Fee' },
      { name: 'Base Fee' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      try {
        return <div className="space-y-3"></div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  153: {
    name: 'Token Auction: Create New Order',
    accounts: [
      { name: 'Authority' },
      { name: 'Auction' },
      { name: 'Open orders' },
      { name: 'Event Queue' },
      { name: 'Bids' },
      { name: 'Asks' },
      { name: 'Quote Mint' },
      { name: 'Base Mint' },
      { name: 'Authority Quote' },
      { name: 'Authority Base' },
      { name: 'Quote Vault' },
      { name: 'Base Vault' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      try {
        return <div className="space-y-3"></div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
})

export const TOKEN_AUCTION_INSTRUCTIONS = {
  AReGQtE8e1WC1ztXXq5edtBBPngicGLfLnWeMP7E5WXq: common_instructions(),
}
