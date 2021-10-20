import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData, InstructionData } from '../../models/accounts'

import { MangoInstructionLayout } from '@blockworks-foundation/mango-client'

import { BPF_UPGRADEABLE_LOADER_INSTRUCTIONS } from './programs/bpfUpgradeableLoader'
import { getProgramName } from './programs/names'
import { RAYDIUM_INSTRUCTIONS } from './programs/raydium'
import { SPL_TOKEN_INSTRUCTIONS } from './programs/splToken'

// Well known account names displayed on the instruction card
export const ACCOUNT_NAMES = {
  Guiwem4qBivtkSFrxZAEfuthBz6YuWyCwS4G3fjBYu5Z: 'Mango DAO MNGO Treasury Vault',
  '9RGoboEjmaAjSCXsKi6p6zJucnwF3Eg5NUN9jPS6ziL3':
    'Mango DAO MNGO Treasury Governance',
  '4PdEyhrV3gaUj4ffwjKGXBLo42jF2CQCCBoXenwCRWXf':
    'Mango DAO Insurance Fund Vault',
  '65u1A86RC2U6whcHeD2mRG1tXCSmH2GsiktmEFQmzZgq':
    'Mango DAO Insurance Fund Governance',
  '59BEyxwrFpt3x4sZ7TcXC3bHx3seGfqGkATcDx6siLWy':
    'Mango v3 Insurance Fund Vault',
  '9qFV99WD5TKnpYw8w3xz3mgMBR5anoSZo2BynrGmNZqY': 'Mango v3 Revenue Vault',
  '6GX2brfV7byA8bCurwgcqiGxNEgzjUmdYgarYZZr2MKe': 'Mango v3 Revenue Governance',
  CF8sDcPztLDkvnEbYnCaXiDxhUpZ2uKLStpmFfRDNxSd:
    'Mango v3 BTC-PERP Incentive Vault',
  '7Gm5zF6FNJpyhqdwKcEdMQw3r5YzitYUGVDKYMPT1cMy': 'Mango v3 Program Governance',
}

export function getAccountName(accountPk: PublicKey) {
  return ACCOUNT_NAMES[accountPk.toBase58()] ?? getProgramName(accountPk)
}

export interface AccountDescriptor {
  name: string
  important?: boolean
}

export interface InstructionDescriptorFactory {
  name: string
  accounts: AccountDescriptor[]
  getDataUI: (
    connection: Connection,
    data: Uint8Array,
    accounts: AccountMetaData[]
  ) => Promise<JSX.Element>
}

export interface InstructionDescriptor {
  name: string
  accounts: AccountDescriptor[]
  dataUI: JSX.Element
}

// Well known program instructions displayed on the instruction card
export const INSTRUCTION_DESCRIPTORS = {
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
  },
  ...SPL_TOKEN_INSTRUCTIONS,
  ...BPF_UPGRADEABLE_LOADER_INSTRUCTIONS,
  ...RAYDIUM_INSTRUCTIONS,
}

export async function getInstructionDescriptor(
  connection: Connection,
  instruction: InstructionData
) {
  const descriptors = INSTRUCTION_DESCRIPTORS[
    instruction.programId.toBase58()
  ] as InstructionDescriptorFactory[]

  const descriptor = descriptors && descriptors[instruction.data[0]]

  const dataUI = (descriptor?.getDataUI &&
    (await descriptor?.getDataUI(
      connection,
      instruction.data,
      instruction.accounts
    ))) ?? <>{JSON.stringify(instruction.data)}</>

  return {
    name: descriptor?.name,
    accounts: descriptor?.accounts,
    dataUI,
  }
}
