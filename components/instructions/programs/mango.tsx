import { Connection } from '@solana/web3.js'
import { AccountMetaData } from '../../../models/accounts'
import { MangoInstructionLayout } from '@blockworks-foundation/mango-client'

function displayInstructionArgument(decodedArgs, argName) {
  return (
    <p key={argName}>
      {argName}: {decodedArgs[argName].toString()}
    </p>
  )
}

function displayOptionalInstructionArgument(decodedArgs, argName) {
  return decodedArgs[argName + 'Option'] ? (
    displayInstructionArgument(decodedArgs, argName)
  ) : (
    <></>
  )
}

function displayAllArgs(decodedArgs, exceptions: any[] = []) {
  const optionalArgs = Object.keys(decodedArgs)
    .filter((k) => k.endsWith('Option'))
    .map((k) => k.replace('Option', ''))
    .filter((k) => !exceptions.includes(k))

  const otherArgs = Object.keys(decodedArgs).filter(
    (k) =>
      !k.endsWith('Option') &&
      !optionalArgs.includes(k) &&
      !exceptions.includes(k)
  )

  return (
    <>
      {otherArgs.map((a) => displayInstructionArgument(decodedArgs, a))}
      {optionalArgs.map((a) =>
        displayOptionalInstructionArgument(decodedArgs, a)
      )}
    </>
  )
}

function displayDecimalArgument(decodedArgs, argName, decimals = 6) {
  return (
    <p key={argName}>
      {argName}: {decodedArgs[argName].toNumber() / Math.pow(10, decimals)}
    </p>
  )
}

export const MANGO_INSTRUCTIONS = {
  mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68: {
    4: {
      name: 'Mango v3: Add Spot Market',
      accounts: [
        { name: 'Mango Group' },
        { name: 'Oracle' },
        { name: 'Spot Market' },
        { name: 'Dex Program' },
        { name: 'Quote Mint' },
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .AddSpotMarket
        return <>{displayAllArgs(args)}</>
      },
    },
    10: {
      name: 'Mango v3: Add Oracle',
      accounts: [{ name: 'Mango Group' }, { name: 'Oracle' }],
    },
    11: {
      name: 'Mango v3: Add Perp Market',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Oracle' },
        6: { name: 'Incentive Vault' },
      },
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .AddPerpMarket
        return (
          <>
            {displayAllArgs(args, ['mngoPerPeriod'])}
            {displayDecimalArgument(args, 'mngoPerPeriod')}
          </>
        )
      },
    },
    37: {
      name: 'Mango v3: Change Perp Market',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Perp Market' },
      },
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .ChangePerpMarketParams
        return (
          <>
            {displayAllArgs(args, ['mngoPerPeriod'])}
            {displayDecimalArgument(args, 'mngoPerPeriod')}
          </>
        )
      },
    },
    46: {
      name: 'Mango v3: Create Perp Market',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Oracle' },
        3: { name: 'Event Queue Acct' },
        4: { name: 'Bids Acct' },
        5: { name: 'Asks Acct' },
        7: { name: 'MNGO Vault' },
      },
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .CreatePerpMarket
        return (
          <>
            {displayAllArgs(args, ['mngoPerPeriod'])}
            {displayDecimalArgument(args, 'mngoPerPeriod')}
          </>
        )
      },
    },
    47: {
      name: 'Mango v3: Change Perp Market',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Perp Market' },
      },
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .ChangePerpMarketParams2
        return (
          <>
            {displayAllArgs(args, ['mngoPerPeriod'])}
            {displayDecimalArgument(args, 'mngoPerPeriod')}
          </>
        )
      },
    },
  },
}
