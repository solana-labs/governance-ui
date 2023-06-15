import { MangoClient, toUiDecimals } from '@blockworks-foundation/mango-v4'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import { AnchorProvider, BN, BorshInstructionCoder } from '@coral-xyz/anchor'
import { Wallet } from '@marinade.finance/marinade-ts-sdk'
import { AccountMetaData } from '@solana/spl-governance'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import {
  LISTING_PRESETS,
  getFormattedListingValues,
  getSuggestedCoinTier,
  compareObjectsAndGetDifferentKeys,
  ListingArgs,
  ListingArgsFormatted,
  coinTiersToNames,
  getOracle,
} from '@utils/Mango/listingTools'
import { secondsToHours } from 'date-fns'
import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled'
import { CheckCircleIcon } from '@heroicons/react/solid'
// import { snakeCase } from 'snake-case'
// import { sha256 } from 'js-sha256'

//in case of mango discriminator is string sum of two first numbers in data array e.g `${data[0]}${data[1]}`
const instructions = () => ({
  12451: {
    name: 'Alt Extend',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Payer' },
      { name: 'Address Lookup Table' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  23568: {
    name: 'Alt Set',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Address Lookup Table' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  201177: {
    name: 'Ix Gate Set',
    accounts: [{ name: 'Group' }, { name: 'Admin' }],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  124114: {
    name: 'Perp edit',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Perp Market' },
      { name: 'Oracle' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  109198: {
    name: 'Stub oracle set',
    accounts: [{ name: 'Group' }, { name: 'Admin' }, { name: 'Oracle' }],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  16388: {
    name: 'Token add bank',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Mint' },
      { name: 'Existing Bank' },
      { name: 'Bank' },
      { name: 'Vault' },
      { name: 'Mint Info' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  888: {
    name: 'Edit Group',
    accounts: [{ name: 'Group' }, { name: 'Admin' }],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  17263: {
    name: 'Create Stub Oracle',
    accounts: [
      { name: 'Group' },
      { name: 'Oracle' },
      { name: 'Admin' },
      { name: 'Mint' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  10928: {
    name: 'Register Token',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Mint' },
      { name: 'Bank' },
      { name: 'Vault' },
      { name: 'Mint Info' },
      { name: 'Oracle' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const proposedMint = accounts[2].pubkey
      const oracle = accounts[6].pubkey

      const [info, proposedOracle, suggestedTier, args] = await Promise.all([
        displayArgs(connection, data),
        getOracle(connection, oracle),
        getSuggestedCoinTier(proposedMint.toBase58()),
        getDataObjectFlattened<ListingArgs>(connection, data),
      ])
      const formattedProposedArgs = getFormattedListingValues(args)
      const suggestedPreset = LISTING_PRESETS[suggestedTier.tier]

      const suggestedFormattedPreset = Object.keys(suggestedPreset).length
        ? getFormattedListingValues({
            tokenIndex: args.tokenIndex,
            name: args.name,
            ...suggestedPreset,
          } as ListingArgs)
        : ({} as ListingArgsFormatted)
      const suggestedUntrusted = suggestedTier.tier === 'UNTRUSTED'
      const invalidKeys: (keyof ListingArgsFormatted)[] = Object.keys(
        suggestedPreset
      ).length
        ? compareObjectsAndGetDifferentKeys<ListingArgsFormatted>(
            formattedProposedArgs,
            suggestedFormattedPreset
          )
        : []
      const invalidFields: Partial<ListingArgsFormatted> = invalidKeys.reduce(
        (obj, key) => {
          return {
            ...obj,
            [key]: suggestedFormattedPreset[key],
          }
        },
        {}
      )
      const DisplayListingPropertyWrapped = ({
        label,
        suggestedUntrusted,
        valKey,
        suffix,
        prefix: perfix,
      }: {
        label: string
        suggestedUntrusted: boolean
        valKey: string
        suffix?: string
        prefix?: string
      }) => {
        return (
          <DisplayListingPropertyWrapederty
            label={label}
            suggestedUntrusted={suggestedUntrusted}
            val={formattedProposedArgs[valKey]}
            suggestedVal={invalidFields[valKey]}
            suffix={suffix}
            prefix={perfix}
          />
        )
      }

      try {
        return (
          <div>
            <div className="pb-4 space-y-3">
              {suggestedUntrusted && (
                <>
                  <h3 className="text-orange flex items-center">
                    <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                    Suggested token tier: UNTRUSTED.
                  </h3>
                  <h3 className="text-orange flex">
                    Very low liquidity Price impact of{' '}
                    {suggestedTier.priceImpact}% on $1000 swap. This token
                    should probably be listed using the Register Trustless Token
                    instruction check params carefully
                  </h3>
                </>
              )}
              {!suggestedUntrusted && !invalidKeys.length && (
                <h3 className="text-green flex items-center">
                  <CheckCircleIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                  Proposal params match suggested token tier -{' '}
                  {coinTiersToNames[suggestedTier.tier]}.
                </h3>
              )}
              {!suggestedUntrusted && invalidKeys.length && (
                <h3 className="text-orange flex items-center">
                  <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                  Proposal params do not match suggested token tier -{' '}
                  {coinTiersToNames[suggestedTier.tier]} check params carefully
                </h3>
              )}
              <div
                className={`py-4 ${
                  proposedOracle.type === 'Unknown' ? 'text-red' : ''
                }`}
              >
                Oracle provider: {proposedOracle.type}{' '}
                {proposedOracle.url && (
                  <>
                    {' '}
                    -{' '}
                    <a
                      className="underline mr-2"
                      target="_blank"
                      href={proposedOracle.url}
                      rel="noreferrer"
                    >
                      Link
                    </a>
                  </>
                )}
                {proposedOracle.type === 'Switchboard' &&
                  (suggestedTier.tier === 'PREMIUM' ||
                    suggestedTier.tier === 'MID') && (
                    <span className="text-orange">
                      Midwit or Bluechip tokens should be listed with pyth
                      oracle
                    </span>
                  )}
              </div>

              <DisplayListingPropertyWrapped
                label="Token index"
                suggestedUntrusted={false}
                valKey={`tokenIndex`}
              />
              <DisplayListingPropertyWrapped
                label="Token name"
                suggestedUntrusted={false}
                valKey={`tokenName`}
              />
              <DisplayListingPropertyWrapped
                label="Oracle Confidence Filter"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'oracleConfidenceFilter'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Oracle Max Staleness Slots"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'oracleMaxStalenessSlots'}
              />
              <DisplayListingPropertyWrapped
                label="Interest rate adjustment factor"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'adjustmentFactor'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Interest rate utilization point 0"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'interestRateUtilizationPoint0'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Interest rate point 0"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'interestRatePoint0'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Interest rate utilization point 1"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'interestRateUtilizationPoint1'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Interest rate point 1"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'interestRatePoint1'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Interest rate max rate"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'maxRate'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Loan Fee Rate"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'loanFeeRate'}
                suffix=" bps"
              />
              <DisplayListingPropertyWrapped
                label="Loan Origination Fee Rate"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'loanOriginationFeeRate'}
                suffix=" bps"
              />
              <DisplayListingPropertyWrapped
                label="Maintenance Asset Weight"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'maintAssetWeight'}
              />
              <DisplayListingPropertyWrapped
                label="Init Asset Weight"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'initAssetWeight'}
              />
              <DisplayListingPropertyWrapped
                label="Maintenance Liab Weight"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'maintLiabWeight'}
              />
              <DisplayListingPropertyWrapped
                label="Init Liab Weight"
                suggestedUntrusted={suggestedUntrusted}
                valKey={'initLiabWeight'}
              />
              <DisplayListingPropertyWrapped
                label="Liquidation Fee"
                suggestedUntrusted={suggestedUntrusted}
                valKey="liquidationFee"
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Min Vault To Deposits Ratio"
                suggestedUntrusted={suggestedUntrusted}
                valKey="minVaultToDepositsRatio"
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Net Borrow Limit Window Size"
                suggestedUntrusted={suggestedUntrusted}
                valKey="netBorrowLimitWindowSizeTs"
                suffix="H"
              />
              <DisplayListingPropertyWrapped
                label="Net Borrow Limit Per Window Quote"
                suggestedUntrusted={suggestedUntrusted}
                valKey="netBorrowLimitPerWindowQuote"
                prefix="$"
              />
            </div>
            <AdvancedOptionsDropdown className="mt-4" title="Raw values">
              <div>{info}</div>
            </AdvancedOptionsDropdown>
          </div>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  4014: {
    name: 'Register Openbook Market',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Openbook Program' },
      { name: 'Openbook External Market' },
      { name: 'Openbook Market' },
      { name: 'Index Reservation' },
      { name: 'Quote Bank' },
      { name: 'Base Bank' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      const openbookMarketPk = accounts[3].pubkey
      try {
        return (
          <div>
            <div className="py-3">
              <a
                className="underline"
                target="_blank"
                href={`https://openserum.io/${openbookMarketPk.toBase58()}`}
                rel="noreferrer"
              >
                Openbook market link
              </a>
            </div>
            {info}
          </div>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  5645: {
    name: 'Register Trustless Token',
    accounts: [
      { name: 'Group' },
      { name: 'Fast Listing Admin' },
      { name: 'Mint' },
      { name: 'Bank' },
      { name: 'Vault' },
      { name: 'Mint Info' },
      { name: 'Oracle' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  49115: {
    name: 'Edit Market',
    accounts: [{ name: 'Group' }, { name: 'Admin' }, { name: 'Market' }],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  145204: {
    name: 'Edit Token',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Mint Info' },
      { name: 'Oracle' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      const args = (await getDataObjectFlattened(connection, data)) as any

      const parsedArgs = {
        tokenIndex: args.tokenIndex,
        tokenName: args.name,
        oracleConfidenceFilter: args['oracleConfigOpt.confFilter']
          ? (args['oracleConfigOpt.confFilter'] * 100)?.toFixed(2)
          : '',
        oracleMaxStalenessSlots: args['oracleConfigOpt.maxStalenessSlots'],
        interestRateUtilizationPoint0: args['interestRateParamsOpt.util0']
          ? (args['interestRateParamsOpt.util0'] * 100)?.toFixed(2)
          : '',
        interestRatePoint0: args['interestRateParamsOpt.rate0']
          ? (args['interestRateParamsOpt.rate0'] * 100)?.toFixed(2)
          : '',
        interestRateUtilizationPoint1: args['interestRateParamsOpt.util1']
          ? (args['interestRateParamsOpt.util1'] * 100)?.toFixed(2)
          : '',
        interestRatePoint1: args['interestRateParamsOpt.rate1']
          ? (args['interestRateParamsOpt.rate1'] * 100)?.toFixed(2)
          : '',
        maxRate: args['interestRateParamsOpt.maxRate']
          ? (args['interestRateParamsOpt.maxRate'] * 100)?.toFixed(2)
          : '',
        adjustmentFactor: args['interestRateParamsOpt.adjustmentFactor']
          ? (args['interestRateParamsOpt.adjustmentFactor'] * 100).toFixed(2)
          : '',
        loanFeeRate: args.loanFeeRateOpt
          ? (args.loanFeeRateOpt * 10000)?.toFixed(2)
          : '',
        loanOriginationFeeRate: args.loanOriginationFeeRateOpt
          ? (args.loanOriginationFeeRateOpt * 10000)?.toFixed(2)
          : '',
        maintAssetWeight: args.maintAssetWeightOpt?.toFixed(2),
        initAssetWeight: args.initAssetWeightOpt?.toFixed(2),
        maintLiabWeight: args.maintLiabWeightOpt?.toFixed(2),
        initLiabWeight: args.initLiabWeightOpt?.toFixed(2),
        liquidationFee: args['liquidationFeeOpt']
          ? (args['liquidationFeeOpt'] * 100)?.toFixed(2)
          : '',
        minVaultToDepositsRatio: args['minVaultToDepositsRatioOpt']
          ? (args['minVaultToDepositsRatioOpt'] * 100)?.toFixed(2)
          : '',
        netBorrowLimitPerWindowQuote: args['netBorrowLimitPerWindowQuoteOpt']
          ? toUiDecimals(args['netBorrowLimitPerWindowQuoteOpt'], 6)
          : '',
        netBorrowLimitWindowSizeTs: args.netBorrowLimitWindowSizeTsOpt
          ? secondsToHours(args.netBorrowLimitWindowSizeTsOpt)
          : '',
        borrowWeightScaleStartQuote: args.borrowWeightScaleStartQuoteOpt
          ? toUiDecimals(args.borrowWeightScaleStartQuoteOpt, 6)
          : '',
        depositWeightScaleStartQuote: args.depositWeightScaleStartQuoteOpt
          ? toUiDecimals(args.depositWeightScaleStartQuoteOpt, 6)
          : '',
        groupInsuranceFund:
          args.groupInsuranceFundOpt !== null ? args.groupInsuranceFundOpt : '',
      }
      try {
        return (
          <div>
            <div className="border-b mb-4 pb-4 space-y-3">
              <DisplayNullishProperty
                label="Token index"
                value={parsedArgs.tokenIndex}
              />
              <DisplayNullishProperty
                label="Token name"
                value={parsedArgs.tokenName}
              />
              <DisplayNullishProperty
                label="Oracle Confidence Filter"
                value={
                  parsedArgs.oracleConfidenceFilter &&
                  `${parsedArgs.oracleConfidenceFilter}%`
                }
              />
              <DisplayNullishProperty
                label="Oracle Max Staleness Slots"
                value={parsedArgs.oracleMaxStalenessSlots}
              />
              <DisplayNullishProperty
                label="Interest rate adjustment factor"
                value={
                  parsedArgs.adjustmentFactor &&
                  `${parsedArgs.adjustmentFactor}%`
                }
              />
              <DisplayNullishProperty
                label="Interest rate utilization point 0"
                value={
                  parsedArgs.interestRateUtilizationPoint0 &&
                  `${parsedArgs.interestRateUtilizationPoint0}%`
                }
              />
              <DisplayNullishProperty
                label="Interest rate point 0"
                value={
                  parsedArgs.interestRatePoint0 &&
                  `${parsedArgs.interestRatePoint0}%`
                }
              />
              <DisplayNullishProperty
                label="Interest rate utilization point 1"
                value={
                  parsedArgs.interestRateUtilizationPoint1 &&
                  `${parsedArgs.interestRateUtilizationPoint1}%`
                }
              />
              <DisplayNullishProperty
                label="Interest rate point 1"
                value={
                  parsedArgs.interestRatePoint1 &&
                  `${parsedArgs.interestRatePoint1}%`
                }
              />
              <DisplayNullishProperty
                label="Interest rate max rate"
                value={parsedArgs.maxRate && `${parsedArgs.maxRate}%`}
              />
              <DisplayNullishProperty
                label="Loan Fee Rate"
                value={
                  parsedArgs.loanFeeRate && `${parsedArgs.loanFeeRate} bps`
                }
              />
              <DisplayNullishProperty
                label="Loan Origination Fee Rate"
                value={
                  parsedArgs.loanOriginationFeeRate &&
                  `${parsedArgs.loanOriginationFeeRate} bps`
                }
              />
              <DisplayNullishProperty
                label="Maintenance Asset Weight"
                value={parsedArgs.maintAssetWeight}
              />
              <DisplayNullishProperty
                label="Init Asset Weight"
                value={parsedArgs.initAssetWeight}
              />
              <DisplayNullishProperty
                label="Maintenance Liab Weight"
                value={parsedArgs.maintLiabWeight}
              />
              <DisplayNullishProperty
                label="Init Liab Weight"
                value={parsedArgs.initLiabWeight}
              />
              <DisplayNullishProperty
                label="Liquidation Fee"
                value={
                  parsedArgs.liquidationFee && `${parsedArgs.liquidationFee}%`
                }
              />
              <DisplayNullishProperty
                label="Min Vault To Deposits Ratio"
                value={
                  parsedArgs.minVaultToDepositsRatio &&
                  `${parsedArgs.minVaultToDepositsRatio}%`
                }
              />
              <DisplayNullishProperty
                label="Net Borrow Limit Window Size"
                value={
                  parsedArgs.netBorrowLimitWindowSizeTs &&
                  `${parsedArgs.netBorrowLimitWindowSizeTs}H`
                }
              />
              <DisplayNullishProperty
                label="Net Borrow Limit Per Window Quote"
                value={
                  parsedArgs.netBorrowLimitPerWindowQuote &&
                  `$${parsedArgs.netBorrowLimitPerWindowQuote}`
                }
              />
              <DisplayNullishProperty
                label="Borrow Weight Scale Start Quote"
                value={
                  parsedArgs.borrowWeightScaleStartQuote &&
                  `$${parsedArgs.borrowWeightScaleStartQuote}`
                }
              />
              <DisplayNullishProperty
                label="Deposit Weight Scale Start Quote"
                value={
                  parsedArgs.depositWeightScaleStartQuote &&
                  `$${parsedArgs.depositWeightScaleStartQuote}`
                }
              />
              <DisplayNullishProperty
                label="Group Insurance Fund"
                value={parsedArgs.groupInsuranceFund?.toString()}
              />
            </div>
            <h3>Raw values</h3>
            <div>{info}</div>
          </div>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  9347: {
    name: 'Create Perp Market',
    accounts: [
      { name: 'Group' },
      { name: 'Admin' },
      { name: 'Oracle' },
      { name: 'Perp Market' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  19895: {
    name: 'Create Mango Account',
    accounts: [
      { name: 'Group' },
      { name: 'Account' },
      { name: 'Owner' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array
      //accounts: AccountMetaData[]
    ) => {
      const info = await displayArgs(connection, data)
      try {
        return <div>{info}</div>
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
})

export const MANGO_V4_INSTRUCTIONS = {
  '4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg': instructions(),
}

const getClient = async (connection: Connection) => {
  const options = AnchorProvider.defaultOptions()
  const adminProvider = new AnchorProvider(
    connection,
    new Wallet(Keypair.generate()),
    options
  )
  const client = await MangoClient.connect(
    adminProvider,
    'mainnet-beta',
    new PublicKey('78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX')
  )

  return client
}

async function getDataObjectFlattened<T>(
  connection: Connection,
  data: Uint8Array
) {
  const client = await getClient(connection)
  const decodedInstructionData = new BorshInstructionCoder(
    client.program.idl
  ).decode(Buffer.from(data))?.data as any

  //   console.log(
  //     client.program.idl.instructions.map((ix) => {
  //       const sh = sighash('global', ix.name)
  //       return {
  //         name: ix.name,
  //         sh: `${sh[0]}${sh[1]}`,
  //       }
  //     })
  //   )

  const args = {}
  for (const key of Object.keys(decodedInstructionData)) {
    const val = decodedInstructionData[key]
    if (val !== null) {
      if (
        typeof val === 'object' &&
        !Array.isArray(val) &&
        !(val instanceof BN) &&
        !(val instanceof PublicKey)
      ) {
        for (const innerKey of Object.keys(val)) {
          const innerVal = val[innerKey]
          args[`${key}.${innerKey}`] = innerVal
        }
      } else {
        args[key] = val
      }
    }
  }
  return args as T
}

const displayArgs = async (connection: Connection, data: Uint8Array) => {
  const args = await getDataObjectFlattened<any>(connection, data)
  return (
    <div className="space-y-3">
      {Object.keys(args)
        .filter((key) => {
          if (key === 'resetStablePrice' && args[key] === false) {
            return false
          }
          if (key === 'resetNetBorrowLimit' && args[key] === false) {
            return false
          }

          return true
        })
        .map((key) => (
          <div key={key} className="flex">
            <div className="mr-3">{key}:</div>
            <div>{`${commify(args[key])}`}</div>
          </div>
        ))}
    </div>
  )
}

function commify(n) {
  if (n?.toString) {
    const parts = n.toString().split('.')
    const numberPart = parts[0]
    const decimalPart = parts[1]
    const thousands = /\B(?=(\d{3})+(?!\d))/g
    return (
      numberPart.replace(thousands, ',') +
      (decimalPart ? '.' + decimalPart : '')
    )
  }
  return n
}

const DisplayNullishProperty = ({ label, value }) =>
  value && (
    <div className="flex space-x-3">
      <div>{label}:</div>
      <div>{value}</div>
    </div>
  )

const DisplayListingPropertyWrapederty = ({
  label,
  suggestedUntrusted,
  val,
  suggestedVal,
  suffix,
  prefix,
}: {
  label: string
  suggestedUntrusted: boolean
  val: any
  suggestedVal?: any
  suffix?: string
  prefix?: string
}) => (
  <div className="flex space-x-3">
    <div>{label}:</div>
    <div className="flex">
      <div
        className={`${suggestedUntrusted || suggestedVal ? 'text-orange' : ''}`}
      >
        {prefix}
        {val}
        {suffix}
      </div>
      {suggestedVal && <div className="mx-1">/</div>}
      {suggestedVal && (
        <div className="text-green">
          {' '}
          {prefix}
          {suggestedVal}
          {suffix}
        </div>
      )}
    </div>
  </div>
)

//need yarn add js-sha256 snakeCase
// function sighash(nameSpace: string, ixName: string): Buffer {
//   const name = snakeCase(ixName)
//   const preimage = `${nameSpace}:${name}`
//   return Buffer.from(sha256.digest(preimage)).slice(0, 8)
// }
