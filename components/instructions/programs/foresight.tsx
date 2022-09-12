import { Connection, PublicKey } from '@solana/web3.js'
import { utils } from '@project-serum/anchor'
import {
  consts,
  generatedTypes,
  generatedAccounts,
} from '@foresight-tmp/foresight-sdk'
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

function numArrayToString(data: number[]): string {
  return Buffer.from(data).toString()
}

function parseMetadata(
  metadata: generatedAccounts.MarketMetadata,
  includeImage = true
): string {
  const base = {
    title: numArrayToString(metadata.title),
    description: numArrayToString(metadata.description),
    rules: numArrayToString(metadata.rules),
  }
  const maybeImageObj = includeImage
    ? { image: numArrayToString(metadata.image) }
    : {}
  return JSON.stringify({ ...base, ...maybeImageObj }, null, 2)
}

function toDecodable(data: Uint8Array): Buffer {
  return Buffer.from(data.slice(8))
}

function decodeIxData(data: Uint8Array, layout: any): any {
  return layout.decode(toDecodable(data))
}

function findAccounts(ixName: string): { name: string }[] {
  return IDL.instructions
    .find((ix) => ix.name === ixName)!
    .accounts.map((acc) => {
      return { name: acc.name }
    })
}

async function fetchId(
  connection: Connection,
  pubkey: PublicKey,
  accountType:
    | typeof generatedAccounts.Category
    | typeof generatedAccounts.MarketList
): Promise<string> {
  const account = await accountType.fetch(connection, pubkey)
  return account === null ? 'Error: not found' : numArrayToString(account.id)
}

async function fetchCategoryId(
  connection: Connection,
  pubkey: PublicKey
): Promise<string> {
  return await fetchId(connection, pubkey, generatedAccounts.Category)
}

async function fetchMarketListId(
  connection: Connection,
  pubkey: PublicKey
): Promise<string> {
  return await fetchId(connection, pubkey, generatedAccounts.MarketList)
}

export const FORESIGHT_INSTRUCTIONS = {
  [consts.PROGRAM_ID]: {
    65: {
      name: 'Foresight: Init Category',
      accounts: findAccounts('initCategory'),
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = decodeIxData(data, initCategoryLayout)
        return (
          <>
            {displayParsedArg('categoryId', numArrayToString(args.categoryId))}
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
        const args = decodeIxData(data, initMarketListLayout)
        return (
          <>
            {displayParsedArg(
              'marketListId',
              numArrayToString(args.marketListId)
            )}
          </>
        )
      },
    },
    33: {
      name: 'Foresight: Init Market',
      accounts: findAccounts('initMarket'),
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const args = decodeIxData(data, initMarketLayout)
        const marketListId = await fetchMarketListId(
          connection,
          accounts[1].pubkey
        )
        return (
          <>
            {displayParsedArg('marketId', args.marketId[0].toString())}
            {displayParsedArg('marketListId', marketListId)}
          </>
        )
      },
    },
    218: {
      name: 'Foresight: Add Market List to Category',
      accounts: findAccounts('addMarketListToCategory'),
      getDataUI: async (
        connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const categoryId = await fetchCategoryId(connection, accounts[1].pubkey)
        const marketListId = await fetchMarketListId(
          connection,
          accounts[2].pubkey
        )
        return (
          <>
            {' '}
            {displayParsedArg('categoryId', categoryId)}
            {displayParsedArg('marketListId', marketListId)}
          </>
        )
      },
    },
    90: {
      name: 'Foresight: Set Market Metadata',
      accounts: findAccounts('writeToFieldMarketMetadata'),
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const args = decodeIxData(data, writeToFieldMarketMetadataLayout)
        const field = generatedTypes.MarketMetadataFields.fromDecoded(
          args.field
        ).kind
        const metadataAccount = await generatedAccounts.MarketMetadata.fetch(
          connection,
          accounts[1].pubkey
        )
        const currentMetadata =
          metadataAccount === null
            ? 'Error: not found.'
            : parseMetadata(metadataAccount)
        return (
          <>
            {displayParsedArg('field', field)}
            {displayParsedArg('content', numArrayToString(args.string))}
            <h4>Note: this is the current metadata:</h4>
            <p>{currentMetadata}</p>
          </>
        )
      },
    },
    155: {
      name: 'Foresight: Resolve Market',
      accounts: findAccounts('resolveMarket'),
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const args = decodeIxData(data, resolveMarketLayout)
        const winner = args.winningBracket === 0 ? 'YES' : 'NO'
        const marketPubkey = accounts[2].pubkey
        const marketAccount = await generatedAccounts.Market.fetch(
          connection,
          marketPubkey
        )
        const notFoundMsg = 'Error: not found.'
        let currentMetadata: string
        if (marketAccount === null) {
          currentMetadata = notFoundMsg
        } else {
          const marketId = Buffer.from(marketAccount.id)
          const marketListId = Buffer.from(marketAccount.marketListId)
          const [metadataPubkey] = utils.publicKey.findProgramAddressSync(
            [Buffer.from('market_metadata'), marketId, marketListId],
            consts.PROGRAM_ID_PUBKEY
          )
          const metadataAccount = await generatedAccounts.MarketMetadata.fetch(
            connection,
            metadataPubkey
          )
          currentMetadata =
            metadataAccount === null
              ? 'Error: not found.'
              : parseMetadata(metadataAccount, false)
        }
        return (
          <>
            {displayParsedArg('Winner', winner)}
            <h4>Note: here is the relevant market metadata:</h4>
            <p>{currentMetadata}</p>
          </>
        )
      },
    },
  },
}
