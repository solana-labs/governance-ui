import { Connection } from '@solana/web3.js'
import { AccountMetaData } from '../../../models/accounts'
import { MangoInstructionLayout } from '@blockworks-foundation/mango-client'

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
        return (
          <>
            <p>initLeverage: {args.initLeverage.toNumber()}</p>
            <p>maintLeverage: {args.maintLeverage.toNumber()}</p>
            <p>liquidationFee: {args.liquidationFee.toNumber()}</p>
            <p>optimalUtil: {args.optimalUtil.toNumber()}</p>
            <p>optimalRate: {args.optimalRate.toNumber()}</p>
            <p>maxRate: {args.maxRate.toNumber()}</p>
          </>
        )
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
        const mngoMint = { name: 'MNGO', decimals: 6 }
        return (
          <>
            <p>initLeverage: {args.initLeverage.toNumber()}</p>
            <p>maintLeverage: {args.maintLeverage.toNumber()}</p>
            <p>liquidationFee: {args.liquidationFee.toNumber()}</p>
            <p>makerFee: {args.makerFee.toNumber()}</p>
            <p>takerFee: {args.takerFee.toNumber()}</p>
            <p>baseLotSize: {args.baseLotSize.toNumber()}</p>
            <p>quoteLotSize: {args.quoteLotSize.toNumber()}</p>
            <p>rate: {args.rate.toString()}</p>
            <p>maxDepthBps: {args.maxDepthBps.toNumber()}</p>
            <p>targetPeriodLength: {args.targetPeriodLength.toNumber()}</p>
            <p>
              mngoPerPeriod:{' '}
              {args.mngoPerPeriod.toNumber() / Math.pow(10, mngoMint.decimals)}
            </p>
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
        const mngoMint = { name: 'MNGO', decimals: 6 }
        return (
          <>
            {args.initLeverageOption && (
              <p>initLeverage: {args.initLeverage.toNumber()}</p>
            )}
            {args.maintLeverageOption && (
              <p>maintLeverage: {args.maintLeverage.toNumber()}</p>
            )}
            {args.liquidationFeeOption && (
              <p>liquidationFee: {args.liquidationFee.toNumber()}</p>
            )}

            {args.makerFeeOption && <p>makerFee: {args.makerFee.toNumber()}</p>}

            {args.takerFeeOption && <p>takerFee: {args.takerFee.toNumber()}</p>}

            {args.baseLotSizeOption && (
              <p>baseLotSize: {args.baseLotSize.toNumber()}</p>
            )}

            {args.quoteLotSizeOption && (
              <p>quoteLotSize: {args.quoteLotSize.toNumber()}</p>
            )}

            {args.rateOption && <p>rate: {args.rate.toString()}</p>}

            {args.maxDepthBpsOption && (
              <p>maxDepthBps: {args.maxDepthBps.toNumber()}</p>
            )}

            {args.targetPeriodLengthOption && (
              <p>targetPeriodLength: {args.targetPeriodLength.toNumber()}</p>
            )}

            {args.mngoPerPeriodOption && (
              <p>
                mngoPerPeriod:{' '}
                {args.mngoPerPeriod.toNumber() /
                  Math.pow(10, mngoMint.decimals)}
              </p>
            )}
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
        const mngoMint = { name: 'MNGO', decimals: 6 }
        return (
          <>
            <p>initLeverage: {args.initLeverage.toNumber()}</p>
            <p>maintLeverage: {args.maintLeverage.toNumber()}</p>
            <p>liquidationFee: {args.liquidationFee.toNumber()}</p>
            <p>makerFee: {args.makerFee.toNumber()}</p>
            <p>takerFee: {args.takerFee.toNumber()}</p>
            <p>baseLotSize: {args.baseLotSize.toNumber()}</p>
            <p>quoteLotSize: {args.quoteLotSize.toNumber()}</p>
            <p>rate: {args.rate.toString()}</p>
            <p>maxDepthBps: {args.maxDepthBps.toNumber()}</p>
            <p>targetPeriodLength: {args.targetPeriodLength.toNumber()}</p>
            <p>
              mngoPerPeriod:{' '}
              {args.mngoPerPeriod.toNumber() / Math.pow(10, mngoMint.decimals)}
            </p>
            <p>exp: {args.exp.toNumber()}</p>
            <p>version: {args.version.toNumber()}</p>
            <p>lmSizeShift: {args.lmSizeShift.toNumber()}</p>
          </>
        )
      },
    },
  },
}
