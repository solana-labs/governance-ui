import { Connection } from '@solana/web3.js'
import { consts, generatedTypes } from '@foresight-tmp/foresight-sdk'
import { AccountMetaData } from '@solana/spl-governance'
import { IDL } from '@foresight-tmp/foresight-sdk/'
import { layout as initCategoryLayout } from '@foresight-tmp/foresight-sdk/dist/generated/instructions/initCategory'
import { layout as initMarketListLayout } from '@foresight-tmp/foresight-sdk/dist/generated/instructions/initMarketList'
import { layout as initMarketLayout } from '@foresight-tmp/foresight-sdk/dist/generated/instructions/initMarket'
import { layout as writeToFieldMarketMetadataLayout } from '@foresight-tmp/foresight-sdk/dist/generated/instructions/writeToFieldMarketMetadata'
import { layout as resolveMarketLayout } from '@foresight-tmp/foresight-sdk/dist/generated/instructions/resolveMarket'

function displayParsedArg(argName: string, parsed: string): JSX.Element {
  return (
    <p key={argName}>
      {argName}: {parsed}
    </p>
  )
}

function findAccounts(ixName: string): { name: string }[] {
  return IDL.instructions
    .find((ix) => ix.name === ixName)!
    .accounts.map((acc) => {
      return { name: acc.name }
    })
}

export const FORESIGHT_INSTRUCTIONS = {
  [consts.DEVNET_PID]: {
    65: {
      name: 'Foresight: Init Category',
      accounts: findAccounts('initCategory'),
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = initCategoryLayout.decode(Buffer.from(data.slice(8)))
        return (
          <>
            {displayParsedArg(
              'categoryId',
              Buffer.from(args.categoryId).toString()
            )}
          </>
        )
      },
    },
    192: {
      name: 'Foresight: Init Market List',
      accounts: findAccounts('initMarketList'),
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = initMarketListLayout.decode(Buffer.from(data.slice(8)))
        return (
          <>
            {displayParsedArg(
              'marketListId',
              Buffer.from(args.marketListId).toString()
            )}
          </>
        )
      },
    },
    33: {
      name: 'Foresight: Init Market',
      accounts: findAccounts('initMarket'),
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = initMarketLayout.decode(Buffer.from(data.slice(8)))
        return <>{displayParsedArg('marketId', args.marketId[0].toString())}</>
      },
    },
    218: {
      name: 'Foresight: Add Market List to Category',
      accounts: findAccounts('addMarketListToCategory'),
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        return <></>
      },
    },
    90: {
      name: 'Foresight: Set Market Metadata',
      accounts: findAccounts('writeToFieldMarketMetadata'),
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = writeToFieldMarketMetadataLayout.decode(
          Buffer.from(data.slice(8))
        )
        const field = generatedTypes.MarketMetadataFields.fromDecoded(
          args.field
        ).kind
        return (
          <>
            {displayParsedArg('field', field)}
            {displayParsedArg('content', Buffer.from(args.string).toString())}
          </>
        )
      },
    },
    155: {
      name: 'Foresight: Resolve Market',
      accounts: findAccounts('resolveMarket'),
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = resolveMarketLayout.decode(Buffer.from(data.slice(8)))
        const winner = args.winningBracket === 0 ? 'YES' : 'NO'
        return <>{displayParsedArg('Winner', winner)}</>
      },
    },
  },
}
