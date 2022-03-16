import { Connection } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
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

function displayOptionalDecimalArgument(decodedArgs, argName, decimals = 6) {
  return decodedArgs[argName + 'Option'] ? (
    <p key={argName}>
      {argName}: {decodedArgs[argName].toNumber() / Math.pow(10, decimals)}
    </p>
  ) : (
    <></>
  )
}

function displayDecimalArgument(decodedArgs, argName, decimals = 6) {
  return decodedArgs[argName] ? (
    <p key={argName}>
      {argName}: {decodedArgs[argName].toNumber() / Math.pow(10, decimals)}
    </p>
  ) : (
    <></>
  )
}

export const MANGO_INSTRUCTIONS = {
  mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68: {
    2: {
      name: 'Mango v3: Deposit',
      accounts: [
        { name: 'Mango Group' },
        { name: 'Mango account' },
        { name: 'Owner' },
        { name: 'Mango cache' },
        { name: 'Root bank' },
        { name: 'Node bank' },
        { name: 'Token account' },
        { name: '' },
        { name: 'Token account owner' },
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0).Deposit
        return <>{displayAllArgs(args)}</>
      },
    },
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
            {displayOptionalDecimalArgument(args, 'mngoPerPeriod')}
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
            {displayOptionalDecimalArgument(args, 'mngoPerPeriod')}
          </>
        )
      },
    },
    55: {
      name: 'Mango v3: Create Mango Account',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Mango Account' },
        2: { name: 'Owner' },
        4: { name: 'Payer' },
      },
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .CreateMangoAccount
        return <>{displayAllArgs(args)}</>
      },
    },
    58: {
      name: 'Mango v3: Set Delegate to Mango Account',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Mango Account' },
        2: { name: 'Owner' },
        4: { name: 'Delegate' },
      },
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .SetDelegate
        return <>{displayAllArgs(args)}</>
      },
    },
    61: {
      name: 'Mango v3: Change Referral Fee Params',
      accounts: {
        0: { name: 'Mango Group' },
      },
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .ChangeReferralFeeParams
        return <>{displayAllArgs(args)}</>
      },
    },
  },
}

// also allow decoding of instructions for devnet versions of mango
MANGO_INSTRUCTIONS['4skJ85cdxQAFVKbcGgfun8iZPL7BadVYXG3kGEGkufqA'] =
  MANGO_INSTRUCTIONS['mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68']
