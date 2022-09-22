import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import {
  Config,
  IDS,
  MangoClient,
  MangoInstructionLayout,
} from '@blockworks-foundation/mango-client'
import dayjs from 'dayjs'
import { tryGetTokenMint } from '@utils/tokens'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import { ASSET_TYPE, MARKET_MODE } from 'Strategies/protocols/mango/tools'

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
        const mint = await tryGetTokenMint(_connection, _accounts[6].pubkey)
        if (mint) {
          return (
            <>
              Amount:{' '}
              {getMintDecimalAmountFromNatural(
                mint!.account!,
                args.quantity
              ).toFormat()}{' '}
              ({args.quantity.toNumber()})
            </>
          )
        } else {
          return <>{displayAllArgs(args)}</>
        }
      },
    },
    3: {
      name: 'Mango v3: Withdraw',
      accounts: [
        { name: 'Mango Group' },
        { name: 'Mango account' },
        { name: 'Owner' },
        { name: 'Mango cache' },
        { name: 'Root bank' },
        { name: 'Node bank' },
        { name: 'Token account' },
        { name: 'Receiver Address' },
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .Withdraw
        const mint = await tryGetTokenMint(_connection, _accounts[6].pubkey)
        if (mint) {
          return (
            <>
              Amount:{' '}
              {getMintDecimalAmountFromNatural(
                mint!.account!,
                args.quantity
              ).toFormat()}{' '}
              ({args.quantity.toNumber()})
            </>
          )
        } else {
          return <>{displayAllArgs(args)}</>
        }
      },
    },
    66: {
      name: 'Mango v3: Withdraw',
      accounts: [
        { name: 'Mango Group' },
        { name: 'Mango account' },
        { name: 'Owner' },
        { name: 'Mango cache' },
        { name: 'Root bank' },
        { name: 'Node bank' },
        { name: 'Token account' },
        { name: 'Receiver Address' },
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .Withdraw2
        const mint = await tryGetTokenMint(_connection, _accounts[6].pubkey)
        if (mint) {
          return (
            <>
              Amount:{' '}
              {getMintDecimalAmountFromNatural(
                mint!.account!,
                args.quantity
              ).toFormat()}{' '}
              ({args.quantity.toNumber()})
            </>
          )
        } else {
          return <>{displayAllArgs(args)}</>
        }
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
    51: {
      name: 'Mango v3: Close open orders',
      accounts: [],
      getDataUI: async () => {
        return <></>
      },
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
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
        programId: PublicKey,
        cluster: string
      ) => {
        const GROUP = cluster === 'devnet' ? 'devnet.2' : 'mainnet.1'
        const groupConfig = Config.ids().getGroupWithName(GROUP)!
        const marketConfig = groupConfig!.perpMarkets.find(
          (x) => x.publicKey.toBase58() === _accounts[1].pubkey.toBase58()
        )!
        const client = new MangoClient(_connection, groupConfig.mangoProgramId)
        const group = await client.getMangoGroup(groupConfig.publicKey)

        const [perpMarket] = await Promise.all([
          group.loadPerpMarket(
            _connection,
            marketConfig.marketIndex,
            marketConfig.baseDecimals,
            marketConfig.quoteDecimals
          ),
          group.loadRootBanks(_connection),
        ])
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .ChangePerpMarketParams2
        const mngoPerPeriod = !args.mngoPerPeriodOption
          ? perpMarket.liquidityMiningInfo.mngoPerPeriod
          : args.mngoPerPeriod
        const maxDepthBps = !args.maxDepthBpsOption
          ? perpMarket.liquidityMiningInfo.maxDepthBps
          : args.maxDepthBps
        const targetPeriodLength = !args.targetPeriodLengthOption
          ? perpMarket.liquidityMiningInfo.targetPeriodLength
          : args.targetPeriodLength
        const progress =
          1 -
          perpMarket.liquidityMiningInfo.mngoLeft.toNumber() /
            mngoPerPeriod.toNumber()
        const start = perpMarket.liquidityMiningInfo.periodStart.toNumber()
        const now = Date.now() / 1000
        const elapsed = now - start
        const est = start + elapsed / progress
        const maxDepthUi =
          (maxDepthBps.toNumber() * perpMarket.baseLotSize.toNumber()) /
          Math.pow(10, perpMarket.baseDecimals)
        return (
          <>
            <>
              <div>
                <p className="mb-0">Depth rewarded</p>
                <div className="font-bold">
                  {maxDepthUi.toLocaleString() + ' '}
                  <span className="text-xs font-normal text-th-fgd-3">
                    {marketConfig.baseSymbol}
                  </span>
                </div>
              </div>
              <div className="col-span- py-3">
                <p className="mb-0">Target period length</p>
                <div className="font-bold">
                  {(targetPeriodLength.toNumber() / 60).toFixed()} minutes
                </div>
              </div>
              <div className="col-span-1 py-3">
                <p className="mb-0">MNGO per period</p>
                <div className="font-bold">
                  {(mngoPerPeriod.toNumber() / Math.pow(10, 6)).toFixed(2)}
                </div>
              </div>
              <div className="col-span-1 py-3">
                <p className="mb-0">MNGO left in period</p>
                <div className="font-bold">
                  {(
                    perpMarket.liquidityMiningInfo.mngoLeft.toNumber() /
                    Math.pow(10, 6)
                  ).toFixed(2)}
                </div>
              </div>

              <div className="col-span-1 py-3">
                <p className="mb-0">Est period end</p>
                <div className="font-bold">
                  {dayjs(est * 1000).isValid()
                    ? dayjs(est * 1000).format('DD MMM YYYY')
                    : ''}
                </div>
                <div className="text-xs text-th-fgd-3">
                  {dayjs(est * 1000).isValid()
                    ? dayjs(est * 1000).format('h:mma')
                    : ''}
                </div>
              </div>

              <div className="col-span-1 py-3">
                <p className="mb-0">Period progress</p>
                <div className="font-bold">
                  {mngoPerPeriod.toNumber() && (
                    <>{(progress * 100).toFixed(2)}%</>
                  )}
                </div>
              </div>
            </>
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
    59: {
      name: 'Mango v3: Change Spot Market Params',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Spot Market' },
        2: { name: 'Root Bank' },
      },
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .ChangeSpotMarketParams
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
    67: {
      name: 'Mango v3: Set Market Mode',
      accounts: {
        0: { name: 'Mango Group' },
      },
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .SetMarketMode
        const mangoGroup = IDS.groups.find(
          (x) => x.publicKey === _accounts[0].pubkey.toBase58()
        )!
        return (
          <>
            <div>
              Market:{' '}
              {
                mangoGroup[
                  args.marketType === 0 ? 'spotMarkets' : 'perpMarkets'
                ]!.find((x) => x.marketIndex === Number(args.marketIndex))!.name
              }
            </div>
            <div>
              Market Mode:{' '}
              {MARKET_MODE.find((x) => x.value === args.marketMode)?.name}
            </div>
            <div>
              Market Type:{' '}
              {ASSET_TYPE.find((x) => x.value === args.marketType)?.name}
            </div>
            <div className="mt-5">
              Raw args
              <div>{displayAllArgs(args)}</div>
            </div>
          </>
        )
      },
    },
    68: {
      name: 'Mango v3: Remove Perp Market',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Admin Pk' },
        2: { name: 'Perp Market Pk' },
        3: { name: 'Event Queue' },
        4: { name: 'Bids' },
        5: { name: 'Asks' },
        6: { name: 'MNGO vault Pk' },
        7: { name: 'Mango dao treasury vault' },
        8: { name: 'Signer Pk' },
      },
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const mangoGroup = IDS.groups.find(
          (x) => x.publicKey === _accounts[0].pubkey.toBase58()
        )!
        return (
          <>
            <div>
              Market:{' '}
              {
                mangoGroup['perpMarkets']!.find(
                  (x) => x.publicKey === _accounts[2].pubkey.toBase58()
                )!.name
              }
            </div>
          </>
        )
      },
    },
    69: {
      name: 'Mango v3: Swap Spot Market',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Admin' },
        2: { name: 'New Spot Market' },
        3: { name: 'Old Spot Market' },
        4: { name: 'Dex program' },
      },
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        console.log(data)
        return <></>
      },
    },
    70: {
      name: 'Mango v3: Remove Spot Market',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Admin Pk' },
        2: { name: 'Dust account' },
        3: { name: 'Root Bank' },
        4: { name: 'Admin vault' },
        5: { name: 'Signer' },
        6: { name: 'nodeBanks' },
        7: { name: 'vaults' },
      },
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        console.log(data)
        return <></>
      },
    },
    71: {
      name: 'Mango v3: Remove Oracle',
      accounts: {
        0: { name: 'Mango Group' },
        1: { name: 'Admin Pk' },
        2: { name: 'Oracle' },
      },
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        console.log(data)
        return <></>
      },
    },
    74: {
      name: 'Mango v3: Change Referral Fee Params v2',
      accounts: {
        0: { name: 'Mango Group' },
      },
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const args = MangoInstructionLayout.decode(Buffer.from(data), 0)
          .ChangeReferralFeeParams2
        return <>{displayAllArgs(args)}</>
      },
    },
  },
}

// also allow decoding of instructions for devnet versions of mango
MANGO_INSTRUCTIONS['4skJ85cdxQAFVKbcGgfun8iZPL7BadVYXG3kGEGkufqA'] =
  MANGO_INSTRUCTIONS['mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68']
MANGO_INSTRUCTIONS['5mUyxYoFX2fyQ5A34jErFBRipC5rQNQ8gC2K73qV6xiJ'] =
  MANGO_INSTRUCTIONS['mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68']
