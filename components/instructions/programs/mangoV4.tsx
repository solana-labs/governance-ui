import { Bank, USDC_MINT, toUiDecimals } from '@blockworks-foundation/mango-v4'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import { BN, BorshInstructionCoder } from '@coral-xyz/anchor'
import { AccountMetaData } from '@solana/spl-governance'
import { Connection, PublicKey } from '@solana/web3.js'
import {
  compareObjectsAndGetDifferentKeys,
  FlatListingArgs,
  ListingArgsFormatted,
  getOracle,
  EditTokenArgsFormatted,
  FlatEditArgs,
  getFormattedListingPresets,
  decodePriceFromOracleAi,
  getFormattedBankValues,
  REDUCE_ONLY_OPTIONS,
  getSuggestedCoinPresetInfo,
} from '@utils/Mango/listingTools'
import { secondsToHours } from 'date-fns'
import WarningFilledIcon from '@carbon/icons-react/lib/WarningFilled'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { Market } from '@project-serum/serum'
import tokenPriceService, {
  TokenInfoWithoutDecimals,
} from '@utils/services/tokenPrice'
import {
  LISTING_PRESETS_KEY,
  MidPriceImpact,
  coinTiersToNames,
  getMidPriceImpacts,
  getProposedKey,
} from '@blockworks-foundation/mango-v4-settings/lib/helpers/listingTools'
import { tryParseKey } from '@tools/validators/pubkey'
import Loading from '@components/Loading'
import { getClient, getGroupForClient } from '@utils/mangoV4Tools'
import { tryGetMint } from '@utils/tokens'
import { formatNumber } from '@utils/formatNumber'
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
      const isMintOnCurve = PublicKey.isOnCurve(proposedMint)

      const [
        info,
        proposedOracle,
        args,
        oracleAi,
        mintInfo,
      ] = await Promise.all([
        displayArgs(connection, data),
        getOracle(connection, oracle),
        getDataObjectFlattened<FlatListingArgs>(connection, data),
        connection.getAccountInfo(oracle),
        tryGetMint(connection, proposedMint),
      ])

      const oracleData = await decodePriceFromOracleAi(
        oracleAi!,
        connection,
        proposedOracle.type
      )

      const presetInfo = await getSuggestedCoinPresetInfo(
        proposedMint.toBase58()
      )

      const formattedProposedArgs = getFormattedListingValues(args)

      const formattedSuggestedPresets = getFormattedListingPresets(
        0,
        mintInfo?.account.decimals || 0,
        oracleData.uiPrice
      )

      const currentListingArgsMatchedTier = Object.values(
        formattedSuggestedPresets
      ).find((preset) => {
        const formattedPreset = getFormattedListingValues({
          tokenIndex: args.tokenIndex,
          name: args.name,
          oracle: args.oracle,
          ...preset,
        })

        return (
          JSON.stringify({
            //deposit limit depends on current price so can be different a bit in proposal
            ...formattedProposedArgs,
            depositLimit: 0,
          }) ===
          JSON.stringify({
            ...formattedPreset,
            depositLimit: 0,
          })
        )
      })

      const suggestedPreset = formattedSuggestedPresets[presetInfo.presetKey]

      const suggestedFormattedPreset: ListingArgsFormatted = Object.keys(
        suggestedPreset
      ).length
        ? getFormattedListingValues({
            tokenIndex: args.tokenIndex,
            name: args.name,
            oracle: args.oracle,
            ...suggestedPreset,
          })
        : ({} as ListingArgsFormatted)

      const invalidKeys: (keyof ListingArgsFormatted)[] = Object.keys(
        suggestedPreset
      ).length
        ? compareObjectsAndGetDifferentKeys<ListingArgsFormatted>(
            formattedProposedArgs,
            suggestedFormattedPreset
          )
        : []

      const invalidFields: Partial<ListingArgsFormatted> = invalidKeys
        .filter((x) => {
          //soft invalid keys - some of the keys can be off by some small maring
          if (x === 'depositLimit') {
            return !isDifferenceWithin5Percent(
              Number(formattedProposedArgs['depositLimit'] || 0),
              Number(suggestedFormattedPreset['depositLimit'] || 0)
            )
          }
          return true
        })
        .reduce((obj, key) => {
          return {
            ...obj,
            [key]: suggestedFormattedPreset[key],
          }
        }, {})

      const DisplayListingPropertyWrapped = ({
        label,
        valKey,
        suffix,
        prefix: perfix,
      }: {
        label: string
        valKey: string
        suffix?: string
        prefix?: string
      }) => {
        return (
          <DisplayListingProperty
            label={label}
            val={formattedProposedArgs[valKey]}
            suggestedVal={invalidFields[valKey]}
            suffix={formattedProposedArgs[valKey] && suffix}
            prefix={perfix}
          />
        )
      }

      try {
        return (
          <div>
            <div className="pb-4 space-y-3">
              {presetInfo.presetKey === 'UNTRUSTED' && (
                <>
                  <h3 className="text-orange flex items-center">
                    <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                    Suggested token tier: C
                  </h3>
                  <h3 className="text-orange flex">
                    Very low liquidity check params carefully
                  </h3>
                </>
              )}
              {!invalidKeys.length && (
                <h3 className="text-green flex items-center">
                  <CheckCircleIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                  Proposal params match suggested token tier -{' '}
                  {coinTiersToNames[presetInfo.presetKey]}.
                </h3>
              )}
              {invalidKeys.length > 0 && (
                <h3 className="text-orange flex items-center">
                  <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                  Proposal params do not match suggested token tier -{' '}
                  {coinTiersToNames[presetInfo.presetKey]} check params
                  carefully
                </h3>
              )}
              {currentListingArgsMatchedTier && (
                <h3 className="text-green flex items-center">
                  <CheckCircleIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                  Full match found with tier {/* @ts-ignore */}
                  {currentListingArgsMatchedTier.preset_name}
                </h3>
              )}
              {isMintOnCurve && (
                <div className="text-orange pt-4">
                  Proposed token has open mint
                </div>
              )}
              <div
                className={`py-2 ${
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
              </div>
              {oracleData.uiPrice ? (
                <div className="py-4 space-y-2">
                  <div>Oracle Price: ${oracleData.uiPrice}</div>
                  <div>
                    Oracle Last known confidence: {oracleData.deviation}%
                  </div>
                </div>
              ) : (
                <div className="py-4">No Oracle Data</div>
              )}
              <div className="py-4">
                <div className="flex mb-2">
                  <div className="w-3 h-3 bg-orange mr-2"></div> - Proposed
                  values
                </div>
                <div className="flex">
                  <div className="w-3 h-3 bg-green mr-2"></div> - Suggested by
                  liqudity
                </div>
              </div>
              <DisplayListingPropertyWrapped
                label="Token index"
                valKey={`tokenIndex`}
              />
              <DisplayListingPropertyWrapped
                label="Token name"
                valKey={`tokenName`}
              />
              <DisplayListingPropertyWrapped
                label="Oracle Confidence Filter"
                valKey={'oracleConfidenceFilter'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Oracle Max Staleness Slots"
                valKey={'oracleMaxStalenessSlots'}
              />
              <DisplayListingPropertyWrapped
                label="Interest rate adjustment factor"
                valKey={'adjustmentFactor'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Interest rate utilization point 0"
                valKey={'interestRateUtilizationPoint0'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Interest rate point 0"
                valKey={'interestRatePoint0'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Interest rate utilization point 1"
                valKey={'interestRateUtilizationPoint1'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Interest rate point 1"
                valKey={'interestRatePoint1'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Zero Util Rate"
                valKey={'zeroUtilRate'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Interest rate max rate"
                valKey={'maxRate'}
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Loan Fee Rate"
                valKey={'loanFeeRate'}
                suffix=" %"
              />
              <DisplayListingPropertyWrapped
                label="Loan Origination Fee Rate"
                valKey={'loanOriginationFeeRate'}
                suffix=" %"
              />
              <DisplayListingPropertyWrapped
                label="Maintenance Asset Weight"
                valKey={'maintAssetWeight'}
              />
              <DisplayListingPropertyWrapped
                label="Init Asset Weight"
                valKey={'initAssetWeight'}
              />
              <DisplayListingPropertyWrapped
                label="Maintenance Liab Weight"
                valKey={'maintLiabWeight'}
              />
              <DisplayListingPropertyWrapped
                label="Init Liab Weight"
                valKey={'initLiabWeight'}
              />
              <DisplayListingPropertyWrapped
                label="Liquidation Fee"
                valKey="liquidationFee"
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Platform Liquidation Fee"
                valKey="platformLiquidationFee"
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Min Vault To Deposits Ratio"
                valKey="minVaultToDepositsRatio"
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Net Borrow Limit Window Size"
                valKey="netBorrowLimitWindowSizeTs"
                suffix="H"
              />
              <DisplayListingPropertyWrapped
                label="Net Borrow Limit Per Window Quote (compared with 5% margin)"
                valKey="netBorrowLimitPerWindowQuote"
                prefix="$"
              />
              <DisplayListingPropertyWrapped
                label="Borrow Weight Scale Start Quote"
                valKey="borrowWeightScaleStartQuote"
                prefix="$"
              />
              <DisplayListingPropertyWrapped
                label="Deposit Weight Scale Start Quote"
                valKey="depositWeightScaleStartQuote"
                prefix="$"
              />
              <DisplayListingPropertyWrapped
                label="Stable Price Delay Interval"
                valKey="stablePriceDelayIntervalSeconds"
                suffix="H"
              />
              <DisplayListingPropertyWrapped
                label="Stable Price Delay Growth Limit"
                valKey="stablePriceDelayGrowthLimit"
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="Stable Price Growth Limit"
                valKey="stablePriceGrowthLimit"
                suffix="%"
              />
              <DisplayListingPropertyWrapped
                label="reduceOnly"
                valKey="reduceOnly"
              />
              <DisplayListingPropertyWrapped
                label="Token Conditional Swap Taker Fee Rate"
                valKey="tokenConditionalSwapTakerFeeRate"
              />
              <DisplayListingPropertyWrapped
                label="Token Conditional Swap Maker Fee Rate"
                valKey="tokenConditionalSwapMakerFeeRate"
              />
              <DisplayListingPropertyWrapped
                label="Flash Loan Deposit Fee Rate"
                valKey="flashLoanSwapFeeRate"
                suffix=" bps"
              />
              <DisplayListingProperty
                label="Deposit Limit (compared with 5% margin)"
                val={`${
                  mintInfo && formattedProposedArgs.depositLimit
                    ? toUiDecimals(
                        new BN(formattedProposedArgs.depositLimit.toString()),
                        mintInfo.account.decimals
                      )
                    : formattedProposedArgs.depositLimit
                } ${args.name} ($${
                  mintInfo && formattedProposedArgs.depositLimit
                    ? (
                        toUiDecimals(
                          new BN(formattedProposedArgs.depositLimit.toString()),
                          mintInfo.account.decimals
                        ) * oracleData.uiPrice
                      ).toFixed(0)
                    : 0
                })`}
                suggestedVal={
                  mintInfo && invalidFields?.depositLimit
                    ? `${toUiDecimals(
                        new BN(invalidFields.depositLimit.toString()),
                        mintInfo.account.decimals
                      )} ${args.name} ($${(
                        toUiDecimals(
                          new BN(invalidFields.depositLimit.toString()),
                          mintInfo.account.decimals
                        ) * oracleData.uiPrice
                      ).toFixed(0)})`
                    : undefined
                }
              />
              <DisplayListingPropertyWrapped
                label="Interest Target Utilization"
                valKey="interestTargetUtilization"
              />
              <DisplayListingPropertyWrapped
                label="Interest Curve Scaling"
                valKey="interestCurveScaling"
              />
              <DisplayListingProperty
                label="Group Insurance Fund"
                val={formattedProposedArgs.groupInsuranceFund?.toString()}
                suggestedVal={invalidFields.groupInsuranceFund?.toString()}
              />
              <DisplayListingPropertyWrapped
                label="Collateral Fee Per Day"
                valKey="collateralFeePerDay"
                suffix=" %"
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
      const group = accounts[0].pubkey
      const baseBank = accounts[7].pubkey
      const quoteBank = accounts[6].pubkey
      const openbookMarketPk = accounts[3].pubkey
      const openBookProgram = accounts[2].pubkey

      const info = await displayArgs(connection, data)
      const client = await getClient(connection)
      const mangoGroup = await getGroupForClient(client, group)
      const banks = [...mangoGroup.banksMapByMint.values()].map((x) => x[0])
      let baseMint = banks.find((x) => x.publicKey.equals(baseBank))?.mint
      let quoteMint = banks.find((x) => x.publicKey.equals(quoteBank))?.mint
      const currentMarket = await Market.load(
        connection,
        openbookMarketPk,
        undefined,
        openBookProgram
      )
      if (!baseMint || !quoteMint) {
        baseMint = currentMarket.baseMintAddress
        quoteMint = currentMarket.quoteMintAddress
      }

      try {
        return (
          <div>
            {/* {bestMarket && openbookMarketPk.equals(bestMarket.pubKey) && (
              <div className="text-green flex items-center">
                <CheckCircleIcon className="w-5 mr-2"></CheckCircleIcon>
                Proposed market match the best market according to listing
                presets
              </div>
            )}
            {!bestMarket && (
              <div className="text-orange flex items-center">
                <WarningFilledIcon className="w-5 mr-2"></WarningFilledIcon>
                Best market not found check market carefully
              </div>
            )}
            {bestMarket?.error && (
              <div className="text-orange flex items-center pb-4">
                <WarningFilledIcon className="w-5 mr-2"></WarningFilledIcon>
                {bestMarket?.error}
              </div>
            )}
            {bestMarket && !openbookMarketPk.equals(bestMarket.pubKey) && (
              <div className="flex flex-row text-orange ">
                <div className="flex items-center">
                  <WarningFilledIcon className="w-5 mr-2"></WarningFilledIcon>
                  <div>
                    proposed market not matching the one with most liquidity,
                    check market carefully. Suggested market -{' '}
                    <a
                      className="underline"
                      target="_blank"
                      href={`https://openserum.io/${bestMarket.pubKey.toBase58()}`}
                      rel="noreferrer"
                    >
                      Suggested Openbook market link
                    </a>
                  </div>
                </div>
              </div>
            )} */}
            <div className="py-3 flex">
              <div className="mr-2">Proposed market: </div>
              <a
                className="underline"
                target="_blank"
                href={`https://openserum.io/${openbookMarketPk.toBase58()}`}
                rel="noreferrer"
              >
                Proposed Openbook market link
              </a>
            </div>

            <div className="my-4">
              <div>Tick Size: {currentMarket.tickSize}</div>
              <div>
                Base Lot Size: {currentMarket.decoded?.baseLotSize?.toNumber()}
              </div>
              <div>
                Quote Lot Size:{' '}
                {currentMarket.decoded?.quoteLotSize?.toNumber()}
              </div>
              <div>
                Quote decimals: {currentMarket['_quoteSplTokenDecimals']}
              </div>
              <div>Base decimals: {currentMarket['_baseSplTokenDecimals']}</div>
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
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const oracle = accounts[6].pubkey

      const [info, proposedOracle, oracleAi] = await Promise.all([
        displayArgs(connection, data),
        getOracle(connection, oracle),
        connection.getAccountInfo(oracle),
      ])

      const oracleData = await decodePriceFromOracleAi(
        oracleAi!,
        connection,
        proposedOracle.type
      )
      try {
        return (
          <div>
            {oracleData.uiPrice ? (
              <div className="py-4 space-y-2">
                <div>Oracle Price: ${oracleData.uiPrice}</div>
                <div>Oracle Last known confidence: {oracleData.deviation}%</div>
              </div>
            ) : (
              <div className="py-4">No Oracle Data</div>
            )}
            <div>{info}</div>
          </div>
        )
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
      { name: 'Fallback oracle' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      try {
        let mintData: null | TokenInfoWithoutDecimals | undefined = null

        const mintInfo = accounts[2].pubkey
        const group = accounts[0].pubkey
        const client = await getClient(connection)
        const [mangoGroup, info, args] = await Promise.all([
          getGroupForClient(client, group),
          displayArgs(connection, data),
          getDataObjectFlattened<FlatEditArgs>(connection, data),
        ])
        let priceImpact: MidPriceImpact | undefined
        const mint = [...mangoGroup.mintInfosMapByMint.values()].find((x) =>
          x.publicKey.equals(mintInfo)
        )?.mint

        let liqudityTier: Partial<{
          presetKey: LISTING_PRESETS_KEY
          priceImpact: string
        }> = {}

        let invalidKeys: (keyof EditTokenArgsFormatted)[] = []
        let invalidFields: Partial<EditTokenArgsFormatted> = {}
        let bank: null | Bank = null
        let bankFormattedValues: null | ReturnType<
          typeof getFormattedBankValues
        > = null

        const parsedArgs: Partial<EditTokenArgsFormatted> = {
          tokenIndex: args.tokenIndex,
          tokenName: args.nameOpt,
          oracleConfidenceFilter: args['oracleConfigOpt.confFilter']
            ? args['oracleConfigOpt.confFilter'] >= 100
              ? args['oracleConfigOpt.confFilter'].toString()
              : (args['oracleConfigOpt.confFilter'] * 100).toFixed(2)
            : undefined,
          oracleMaxStalenessSlots:
            args['oracleConfigOpt.maxStalenessSlots'] === null
              ? -1
              : args['oracleConfigOpt.maxStalenessSlots'],
          interestRateUtilizationPoint0:
            args['interestRateParamsOpt.util0'] !== undefined
              ? (args['interestRateParamsOpt.util0'] * 100)?.toFixed(2)
              : undefined,
          interestRatePoint0:
            args['interestRateParamsOpt.rate0'] !== undefined
              ? (args['interestRateParamsOpt.rate0'] * 100)?.toFixed(2)
              : undefined,
          interestRateUtilizationPoint1:
            args['interestRateParamsOpt.util1'] !== undefined
              ? (args['interestRateParamsOpt.util1'] * 100)?.toFixed(2)
              : undefined,
          interestRatePoint1:
            args['interestRateParamsOpt.rate1'] !== undefined
              ? (args['interestRateParamsOpt.rate1'] * 100)?.toFixed(2)
              : undefined,
          maxRate:
            args['interestRateParamsOpt.maxRate'] !== undefined
              ? (args['interestRateParamsOpt.maxRate'] * 100)?.toFixed(2)
              : undefined,
          adjustmentFactor:
            args['interestRateParamsOpt.adjustmentFactor'] !== undefined
              ? (args['interestRateParamsOpt.adjustmentFactor'] * 100).toFixed(
                  2
                )
              : undefined,
          loanFeeRate:
            args.loanFeeRateOpt !== undefined
              ? (args.loanFeeRateOpt * 100)?.toFixed(2)
              : undefined,
          loanOriginationFeeRate:
            args.loanOriginationFeeRateOpt !== undefined
              ? (args.loanOriginationFeeRateOpt * 100)?.toFixed(2)
              : undefined,
          maintAssetWeight: args.maintAssetWeightOpt?.toFixed(2),
          initAssetWeight: args.initAssetWeightOpt?.toFixed(2),
          maintLiabWeight: args.maintLiabWeightOpt?.toFixed(2),
          initLiabWeight: args.initLiabWeightOpt?.toFixed(2),
          liquidationFee:
            args['liquidationFeeOpt'] !== undefined
              ? (args['liquidationFeeOpt'] * 100)?.toFixed(2)
              : undefined,
          platformLiquidationFee:
            args['platformLiquidationFeeOpt'] !== undefined
              ? (args['platformLiquidationFeeOpt'] * 100)?.toFixed(2)
              : undefined,
          minVaultToDepositsRatio:
            args['minVaultToDepositsRatioOpt'] !== undefined
              ? (args['minVaultToDepositsRatioOpt'] * 100)?.toFixed(2)
              : undefined,
          netBorrowLimitPerWindowQuote:
            args['netBorrowLimitPerWindowQuoteOpt'] !== undefined
              ? toUiDecimals(args['netBorrowLimitPerWindowQuoteOpt'], 6)
              : undefined,
          netBorrowLimitWindowSizeTs:
            args.netBorrowLimitWindowSizeTsOpt !== undefined
              ? secondsToHours(args.netBorrowLimitWindowSizeTsOpt)
              : undefined,
          borrowWeightScaleStartQuote:
            args.borrowWeightScaleStartQuoteOpt !== undefined
              ? toUiDecimals(args.borrowWeightScaleStartQuoteOpt, 6)
              : undefined,
          depositWeightScaleStartQuote:
            args.depositWeightScaleStartQuoteOpt !== undefined
              ? toUiDecimals(args.depositWeightScaleStartQuoteOpt, 6)
              : undefined,
          groupInsuranceFund:
            args.groupInsuranceFundOpt !== null
              ? args.groupInsuranceFundOpt
              : undefined,
          tokenConditionalSwapMakerFeeRate:
            args.tokenConditionalSwapMakerFeeRateOpt,
          tokenConditionalSwapTakerFeeRate:
            args.tokenConditionalSwapTakerFeeRateOpt,
          flashLoanSwapFeeRate:
            args.flashLoanSwapFeeRateOpt !== undefined
              ? (args.loanOriginationFeeRateOpt * 10000)?.toFixed(2)
              : undefined,
          reduceOnly:
            args.reduceOnlyOpt !== undefined
              ? REDUCE_ONLY_OPTIONS[args.reduceOnlyOpt].name
              : undefined,
          interestCurveScaling: args.interestCurveScalingOpt,
          interestTargetUtilization: args.interestTargetUtilizationOpt,
          maintWeightShiftStart: args.maintWeightShiftStartOpt?.toNumber(),
          maintWeightShiftEnd: args.maintWeightShiftEndOpt?.toNumber(),
          maintWeightShiftAssetTarget: args.maintWeightShiftAssetTargetOpt,
          maintWeightShiftLiabTarget: args.maintWeightShiftLiabTargetOpt,
          depositLimit: args.depositLimitOpt?.toString(),
          setFallbackOracle: args.setFallbackOracle,
          maintWeightShiftAbort: args.maintWeightShiftAbort,
          zeroUtilRate:
            args.zeroUtilRateOpt !== undefined
              ? (args.zeroUtilRateOpt * 100).toFixed(2)
              : undefined,
          disableAssetLiquidation: args.disableAssetLiquidationOpt,
          collateralFeePerDay:
            args.collateralFeePerDayOpt !== undefined
              ? (args.collateralFeePerDayOpt * 100)?.toFixed(4)
              : undefined,
          forceWithdraw: args.forceWithdrawOpt,
          forceClose: args.forceCloseOpt,
        }

        if (mint) {
          bank = mangoGroup.getFirstBankByMint(mint)
          bankFormattedValues = getFormattedBankValues(mangoGroup, bank)
          mintData = tokenPriceService.getTokenInfo(mint.toBase58())

          const midPriceImpacts = getMidPriceImpacts(
            mangoGroup.pis.length ? mangoGroup.pis : []
          )

          const tokenToPriceImpact = midPriceImpacts
            .filter(
              (x) => x.avg_price_impact_percent < 1 || x.target_amount <= 1000
            )
            .reduce(
              (acc: { [key: string]: MidPriceImpact }, val: MidPriceImpact) => {
                if (
                  !acc[val.symbol] ||
                  val.target_amount > acc[val.symbol].target_amount
                ) {
                  acc[val.symbol] = val
                }
                return acc
              },
              {}
            )

          priceImpact = tokenToPriceImpact[getApiTokenName(bank.name)]

          const suggestedPresetKey = priceImpact
            ? getProposedKey(
                priceImpact.avg_price_impact_percent < 1
                  ? priceImpact?.target_amount
                  : undefined
              )
            : 'UNTRUSTED'

          liqudityTier = !mint.equals(USDC_MINT)
            ? {
                presetKey: suggestedPresetKey,
                priceImpact: priceImpact
                  ? priceImpact.avg_price_impact_percent.toString()
                  : '',
              }
            : {
                presetKey: 'asset_250',
                priceImpact: '0',
              }

          const suggestedPreset = getFormattedListingPresets(
            bank.uiDeposits(),
            bank.mintDecimals,
            bank.uiPrice
          )[liqudityTier.presetKey!]

          const suggestedFormattedPreset:
            | EditTokenArgsFormatted
            | Record<string, never> = Object.keys(suggestedPreset).length
            ? {
                ...getFormattedListingValues({
                  tokenIndex: args.tokenIndex,
                  name: args.nameOpt,
                  oracle: args.oracleOpt,
                  ...suggestedPreset,
                }),
                groupInsuranceFund: suggestedPreset.groupInsuranceFund,
                maintWeightShiftStart: args.maintWeightShiftStartOpt?.toNumber(),
                maintWeightShiftEnd: args.maintWeightShiftEndOpt?.toNumber(),
                maintWeightShiftAssetTarget:
                  args.maintWeightShiftAssetTargetOpt,
                maintWeightShiftLiabTarget: args.maintWeightShiftLiabTargetOpt,
                maintWeightShiftAbort: args.maintWeightShiftAbort,
                setFallbackOracle: args.setFallbackOracle,
                forceWithdraw: args.forceWithdrawOpt,
                forceClose: args.forceCloseOpt,
              }
            : {}

          invalidKeys = (Object.keys(suggestedPreset).length
            ? compareObjectsAndGetDifferentKeys<
                Partial<EditTokenArgsFormatted>
              >(parsedArgs, suggestedFormattedPreset)
            : []
          )
            .filter((x) => parsedArgs[x] !== undefined)
            .filter((x) => {
              //soft invalid keys - some of the keys can be off by some small maring
              if (x === 'depositLimit') {
                return !isDifferenceWithin5Percent(
                  Number(parsedArgs['depositLimit'] || 0),
                  Number(suggestedFormattedPreset['depositLimit'] || 0)
                )
              }
              if (x === 'netBorrowLimitPerWindowQuote') {
                return !isDifferenceWithin5Percent(
                  Number(parsedArgs['netBorrowLimitPerWindowQuote'] || 0),
                  Number(
                    suggestedFormattedPreset['netBorrowLimitPerWindowQuote'] ||
                      0
                  )
                )
              }
              if (x === 'collateralFeePerDay') {
                return false
              }
              return true
            })

          invalidFields = invalidKeys.reduce((obj, key) => {
            return {
              ...obj,
              [key]: suggestedFormattedPreset[key],
            }
          }, {})
        }

        return (
          <div>
            <h3>{mintData && <div>Token: {mintData.symbol}</div>}</h3>
            {!priceImpact && (
              <h3 className="text-orange flex items-center">
                <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                No price impact data in group
              </h3>
            )}
            {liqudityTier.presetKey === 'UNTRUSTED' && (
              <>
                <h3 className="text-orange flex items-center">
                  <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                  Suggested token tier: C
                </h3>
                <h3 className="text-orange flex">
                  Very low liquidity check params carefully
                </h3>
              </>
            )}
            {!invalidKeys.length && liqudityTier.presetKey && (
              <h3 className="text-green flex items-center">
                <CheckCircleIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                Proposal params match suggested token tier -{' '}
                {coinTiersToNames[liqudityTier.presetKey]}.
              </h3>
            )}
            {invalidKeys && invalidKeys!.length > 0 && liqudityTier.presetKey && (
              <h3 className="text-orange flex items-center">
                <WarningFilledIcon className="h-4 w-4 fill-current mr-2 flex-shrink-0" />
                Proposal params do not match suggested token tier -{' '}
                {coinTiersToNames[liqudityTier.presetKey]} check params
                carefully
              </h3>
            )}
            <div className="py-4">
              <div className="flex mb-2">
                <div className="w-3 h-3 bg-white mr-2"></div> - Current values
              </div>
              <div className="flex mb-2">
                <div className="w-3 h-3 bg-orange mr-2"></div> - Proposed values
              </div>
              <div className="flex">
                <div className="w-3 h-3 bg-green mr-2"></div> - Suggested by
                liqudity
              </div>
            </div>
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
                currentValue={
                  bankFormattedValues?.oracleConfFilter &&
                  `${bankFormattedValues.oracleConfFilter}%`
                }
                value={
                  parsedArgs.oracleConfidenceFilter &&
                  `${parsedArgs.oracleConfidenceFilter}%`
                }
                suggestedVal={
                  invalidFields.oracleConfidenceFilter &&
                  `${invalidFields.oracleConfidenceFilter}%`
                }
              />
              <DisplayNullishProperty
                label="Oracle Max Staleness Slots"
                currentValue={bankFormattedValues?.maxStalenessSlots}
                value={
                  parsedArgs.oracleMaxStalenessSlots === null
                    ? -1
                    : parsedArgs.oracleMaxStalenessSlots
                }
                suggestedVal={invalidFields.oracleMaxStalenessSlots}
              />
              <DisplayNullishProperty
                label="Interest rate adjustment factor"
                currentValue={
                  bankFormattedValues?.adjustmentFactor &&
                  `${bankFormattedValues.adjustmentFactor}%`
                }
                value={
                  parsedArgs.adjustmentFactor &&
                  `${parsedArgs.adjustmentFactor}%`
                }
                suggestedVal={
                  invalidFields.adjustmentFactor &&
                  `${invalidFields.adjustmentFactor}%`
                }
              />
              <DisplayNullishProperty
                label="Interest rate utilization point 0"
                value={
                  parsedArgs.interestRateUtilizationPoint0 &&
                  `${parsedArgs.interestRateUtilizationPoint0}%`
                }
                currentValue={
                  bankFormattedValues?.util0 && `${bankFormattedValues.util0}%`
                }
                suggestedVal={
                  invalidFields.interestRateUtilizationPoint0 &&
                  `${invalidFields.interestRateUtilizationPoint0}%`
                }
              />
              <DisplayNullishProperty
                label="Interest rate point 0"
                value={
                  parsedArgs.interestRatePoint0 &&
                  `${parsedArgs.interestRatePoint0}%`
                }
                currentValue={
                  bankFormattedValues?.rate0 && `${bankFormattedValues.rate0}%`
                }
                suggestedVal={
                  invalidFields.interestRatePoint0 &&
                  `${invalidFields.interestRatePoint0}%`
                }
              />
              <DisplayNullishProperty
                label="Interest rate utilization point 1"
                value={
                  parsedArgs.interestRateUtilizationPoint1 &&
                  `${parsedArgs.interestRateUtilizationPoint1}%`
                }
                currentValue={
                  bankFormattedValues?.util1 && `${bankFormattedValues?.util1}%`
                }
                suggestedVal={
                  invalidFields.interestRateUtilizationPoint1 &&
                  `${invalidFields.interestRateUtilizationPoint1}%`
                }
              />
              <DisplayNullishProperty
                label="Interest rate point 1"
                value={
                  parsedArgs.interestRatePoint1 &&
                  `${parsedArgs.interestRatePoint1}%`
                }
                currentValue={
                  bankFormattedValues?.rate1 && `${bankFormattedValues.rate1}%`
                }
                suggestedVal={
                  invalidFields.interestRatePoint1 &&
                  `${invalidFields.interestRatePoint1}%`
                }
              />
              <DisplayNullishProperty
                label="Interest rate max rate"
                value={parsedArgs.maxRate && `${parsedArgs.maxRate}%`}
                currentValue={
                  bankFormattedValues?.maxRate &&
                  `${bankFormattedValues.maxRate}%`
                }
                suggestedVal={
                  invalidFields.maxRate && `${invalidFields.maxRate}%`
                }
              />
              <DisplayNullishProperty
                label="Zero util rate"
                value={parsedArgs.zeroUtilRate && `${parsedArgs.zeroUtilRate}%`}
                currentValue={
                  bankFormattedValues?.zeroUtilRate &&
                  `${bankFormattedValues.zeroUtilRate}%`
                }
                suggestedVal={
                  invalidFields.zeroUtilRate && `${invalidFields.zeroUtilRate}%`
                }
              />
              <DisplayNullishProperty
                label="Loan Fee Rate"
                value={parsedArgs.loanFeeRate && `${parsedArgs.loanFeeRate} %`}
                currentValue={
                  bankFormattedValues?.loanFeeRate &&
                  `${bankFormattedValues.loanFeeRate} %`
                }
                suggestedVal={
                  invalidFields.loanFeeRate && `${invalidFields.loanFeeRate} %`
                }
              />
              <DisplayNullishProperty
                label="Loan Origination Fee Rate"
                value={
                  parsedArgs.loanOriginationFeeRate &&
                  `${parsedArgs.loanOriginationFeeRate} %`
                }
                currentValue={
                  bankFormattedValues?.loanOriginationFeeRate &&
                  `${bankFormattedValues.loanOriginationFeeRate} %`
                }
                suggestedVal={
                  invalidFields.loanOriginationFeeRate &&
                  `${invalidFields.loanOriginationFeeRate} %`
                }
              />
              <DisplayNullishProperty
                label="Maintenance Asset Weight"
                value={parsedArgs.maintAssetWeight}
                currentValue={bankFormattedValues?.maintAssetWeight}
                suggestedVal={invalidFields.maintAssetWeight}
              />
              <DisplayNullishProperty
                label="Init Asset Weight"
                value={parsedArgs.initAssetWeight}
                currentValue={bankFormattedValues?.initAssetWeight}
                suggestedVal={invalidFields.initAssetWeight}
              />
              <DisplayNullishProperty
                label="Maintenance Liab Weight"
                value={parsedArgs.maintLiabWeight}
                currentValue={bankFormattedValues?.maintLiabWeight}
                suggestedVal={invalidFields.maintLiabWeight}
              />
              <DisplayNullishProperty
                label="Init Liab Weight"
                value={parsedArgs.initLiabWeight}
                currentValue={bankFormattedValues?.initLiabWeight}
                suggestedVal={invalidFields.initLiabWeight}
              />
              <DisplayNullishProperty
                label="Liquidation Fee"
                value={
                  parsedArgs.liquidationFee && `${parsedArgs.liquidationFee}%`
                }
                currentValue={
                  bankFormattedValues?.liquidationFee &&
                  `${bankFormattedValues.liquidationFee}%`
                }
                suggestedVal={
                  invalidFields.liquidationFee &&
                  `${invalidFields.liquidationFee}%`
                }
              />
              <DisplayNullishProperty
                label="Platform Liquidation Fee"
                value={
                  parsedArgs.platformLiquidationFee &&
                  `${parsedArgs.platformLiquidationFee}%`
                }
                currentValue={
                  bankFormattedValues?.platformLiquidationFee &&
                  `${bankFormattedValues.platformLiquidationFee}%`
                }
                suggestedVal={
                  invalidFields.platformLiquidationFee &&
                  `${invalidFields.platformLiquidationFee}%`
                }
              />
              <DisplayNullishProperty
                label="Min Vault To Deposits Ratio"
                value={
                  parsedArgs.minVaultToDepositsRatio &&
                  `${parsedArgs.minVaultToDepositsRatio}%`
                }
                currentValue={
                  bankFormattedValues?.minVaultToDepositsRatio &&
                  `${bankFormattedValues.minVaultToDepositsRatio}%`
                }
                suggestedVal={
                  invalidFields.minVaultToDepositsRatio &&
                  `${invalidFields.minVaultToDepositsRatio}%`
                }
              />
              <DisplayNullishProperty
                label="Net Borrow Limit Window Size"
                value={
                  parsedArgs.netBorrowLimitWindowSizeTs &&
                  `${parsedArgs.netBorrowLimitWindowSizeTs}H`
                }
                currentValue={
                  bankFormattedValues?.netBorrowLimitWindowSizeTs &&
                  `${bankFormattedValues.netBorrowLimitWindowSizeTs}H`
                }
                suggestedVal={
                  invalidFields.netBorrowLimitWindowSizeTs &&
                  `${invalidFields.netBorrowLimitWindowSizeTs}H`
                }
              />

              <DisplayNullishProperty
                label="Net Borrow Limit Per Window Quote (compared with 5% margin)"
                value={
                  parsedArgs.netBorrowLimitPerWindowQuote &&
                  `$${parsedArgs.netBorrowLimitPerWindowQuote}`
                }
                currentValue={
                  bankFormattedValues?.netBorrowLimitPerWindowQuote &&
                  `$${bankFormattedValues.netBorrowLimitPerWindowQuote}`
                }
                suggestedVal={
                  invalidFields.netBorrowLimitPerWindowQuote &&
                  `$${invalidFields.netBorrowLimitPerWindowQuote}`
                }
              />
              <DisplayNullishProperty
                label="Borrow Weight Scale Start Quote"
                value={
                  parsedArgs.borrowWeightScaleStartQuote &&
                  `$${parsedArgs.borrowWeightScaleStartQuote}`
                }
                currentValue={
                  bankFormattedValues?.borrowWeightScaleStartQuote &&
                  `$${bankFormattedValues.borrowWeightScaleStartQuote}`
                }
                suggestedVal={
                  invalidFields.borrowWeightScaleStartQuote &&
                  `$${invalidFields.borrowWeightScaleStartQuote}`
                }
              />
              <DisplayNullishProperty
                label="Deposit Weight Scale Start Quote"
                value={
                  parsedArgs.depositWeightScaleStartQuote &&
                  `$${parsedArgs.depositWeightScaleStartQuote}`
                }
                currentValue={
                  bankFormattedValues?.depositWeightScaleStartQuote &&
                  `$${bankFormattedValues.depositWeightScaleStartQuote}`
                }
                suggestedVal={
                  invalidFields.depositWeightScaleStartQuote &&
                  `$${invalidFields.depositWeightScaleStartQuote}`
                }
              />
              <DisplayNullishProperty
                label="Group Insurance Fund"
                value={parsedArgs.groupInsuranceFund?.toString()}
                currentValue={
                  mint
                    ? mangoGroup.mintInfosMapByMint
                        .get(mint.toBase58())
                        ?.groupInsuranceFund.toString()
                    : undefined
                }
                suggestedVal={invalidFields.groupInsuranceFund?.toString()}
              />
              <DisplayNullishProperty
                label="Oracle"
                value={args.oracleOpt?.toBase58()}
                currentValue={bankFormattedValues?.oracle}
              />
              {accounts.length &&
                accounts[4] &&
                accounts[4].pubkey.toBase58() !==
                  bankFormattedValues?.fallbackOracle && (
                  <DisplayNullishProperty
                    label="Fallback Oracle"
                    value={accounts[4].pubkey.toBase58()}
                    currentValue={bankFormattedValues?.fallbackOracle}
                  />
                )}
              <DisplayNullishProperty
                label="Token Conditional Swap Maker Fee Rate"
                value={parsedArgs.tokenConditionalSwapMakerFeeRate}
                currentValue={
                  bankFormattedValues?.tokenConditionalSwapMakerFeeRate
                }
                suggestedVal={invalidFields.tokenConditionalSwapMakerFeeRate}
              />
              <DisplayNullishProperty
                label="Token Conditional Swap Taker Fee Rate"
                value={parsedArgs.tokenConditionalSwapTakerFeeRate}
                currentValue={
                  bankFormattedValues?.tokenConditionalSwapTakerFeeRate
                }
                suggestedVal={invalidFields.tokenConditionalSwapTakerFeeRate}
              />
              <DisplayNullishProperty
                label="Flash Loan Swap Fee Rate"
                value={
                  parsedArgs.flashLoanSwapFeeRate &&
                  `${parsedArgs.flashLoanSwapFeeRate} bps`
                }
                currentValue={
                  bankFormattedValues?.flashLoanSwapFeeRate &&
                  `${bankFormattedValues.flashLoanSwapFeeRate} bps`
                }
                suggestedVal={
                  invalidFields.flashLoanSwapFeeRate &&
                  `${invalidFields.flashLoanSwapFeeRate} bps`
                }
              />
              <DisplayNullishProperty
                label="Reduce only"
                value={parsedArgs.reduceOnly}
                currentValue={bankFormattedValues?.reduceOnly}
              />
              <DisplayNullishProperty
                label="Interest Curve Scaling"
                value={parsedArgs.interestCurveScaling}
                currentValue={bankFormattedValues?.interestCurveScaling}
                suggestedVal={invalidFields.interestCurveScaling}
              />
              <DisplayNullishProperty
                label="Interest Target Utilization"
                value={parsedArgs.interestTargetUtilization}
                currentValue={bankFormattedValues?.interestTargetUtilization}
                suggestedVal={invalidFields.interestTargetUtilization}
              />
              <DisplayNullishProperty
                label="Maint Weight Shift Start"
                value={parsedArgs.maintWeightShiftStart}
                currentValue={bankFormattedValues?.maintWeightShiftStart}
                suggestedVal={invalidFields.maintWeightShiftStart}
              />
              <DisplayNullishProperty
                label="Maint Weight Shift End"
                value={parsedArgs.maintWeightShiftEnd}
                currentValue={bankFormattedValues?.maintWeightShiftEnd}
                suggestedVal={invalidFields.maintWeightShiftEnd}
              />
              <DisplayNullishProperty
                label="Maint Weight Shift Asset Target"
                value={parsedArgs.maintWeightShiftAssetTarget}
                currentValue={bankFormattedValues?.maintWeightShiftAssetTarget}
                suggestedVal={invalidFields.maintWeightShiftAssetTarget}
              />
              <DisplayNullishProperty
                label="Maint Weight Shift Liab Target"
                value={parsedArgs.maintWeightShiftLiabTarget}
                currentValue={bankFormattedValues?.maintWeightShiftLiabTarget}
                suggestedVal={invalidFields.maintWeightShiftLiabTarget}
              />
              <DisplayNullishProperty
                label="Deposit Limit (compared with 5% margin)"
                value={
                  bank &&
                  parsedArgs.depositLimit &&
                  `${
                    bank && parsedArgs.depositLimit
                      ? toUiDecimals(
                          new BN(parsedArgs.depositLimit),
                          bank.mintDecimals
                        )
                      : parsedArgs.depositLimit
                  } ${bank?.name} ($${(
                    toUiDecimals(
                      new BN(parsedArgs.depositLimit.toString()),
                      bank.mintDecimals
                    ) * bank.uiPrice
                  ).toFixed(0)})`
                }
                currentValue={
                  bank &&
                  bankFormattedValues?.depositLimit &&
                  `${
                    bank && bankFormattedValues?.depositLimit
                      ? toUiDecimals(
                          new BN(bankFormattedValues.depositLimit),
                          bank.mintDecimals
                        )
                      : bankFormattedValues?.depositLimit
                  } ${bank?.name} ($${(
                    toUiDecimals(
                      new BN(bankFormattedValues.depositLimit.toString()),
                      bank.mintDecimals
                    ) * bank.uiPrice
                  ).toFixed(0)})`
                }
                suggestedVal={
                  bank &&
                  invalidFields?.depositLimit &&
                  `${
                    bank && invalidFields?.depositLimit
                      ? toUiDecimals(
                          new BN(invalidFields.depositLimit),
                          bank.mintDecimals
                        )
                      : invalidFields?.depositLimit
                  } ${bank?.name}  ($${(
                    toUiDecimals(
                      new BN(invalidFields.depositLimit.toString()),
                      bank.mintDecimals
                    ) * bank.uiPrice
                  ).toFixed(0)})`
                }
              />
              <DisplayNullishProperty
                label="Collateral Fee Per Day"
                value={
                  parsedArgs.collateralFeePerDay &&
                  `${parsedArgs.collateralFeePerDay}%`
                }
                currentValue={
                  bankFormattedValues?.collateralFeePerDay &&
                  `${bankFormattedValues.collateralFeePerDay}%`
                }
                suggestedVal={
                  invalidFields.collateralFeePerDay &&
                  `${invalidFields.collateralFeePerDay}%`
                }
              />
              {parsedArgs?.disableAssetLiquidation && (
                <DisplayNullishProperty
                  label="Disable Asset Liquidation"
                  value={`${parsedArgs.disableAssetLiquidation}`}
                  currentValue={null}
                  suggestedVal={null}
                />
              )}
              {parsedArgs?.maintWeightShiftAbort && (
                <DisplayNullishProperty
                  label="Maint Weight Shift Abort"
                  value={`${parsedArgs.maintWeightShiftAbort}`}
                  currentValue={null}
                  suggestedVal={null}
                />
              )}
              {parsedArgs?.forceClose && (
                <DisplayNullishProperty
                  label="Force close"
                  value={`${parsedArgs.forceClose}`}
                  currentValue={null}
                  suggestedVal={null}
                />
              )}
              {parsedArgs?.forceWithdraw && (
                <DisplayNullishProperty
                  label="Force withdraw"
                  value={`${parsedArgs.forceWithdraw}`}
                  currentValue={null}
                  suggestedVal={null}
                />
              )}
              {parsedArgs?.setFallbackOracle && (
                <DisplayNullishProperty
                  label="Set fall back oracle"
                  value={`${parsedArgs.setFallbackOracle}`}
                  currentValue={null}
                  suggestedVal={null}
                />
              )}
            </div>
            <h3>Raw values</h3>
            <div>{info}</div>
          </div>
        )
      } catch (e) {
        console.log(e)
        const info = await displayArgs(connection, data)

        try {
          return <div>{info}</div>
        } catch (e) {
          console.log(e)
          return <div>{JSON.stringify(data)}</div>
        }
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
  11366: {
    name: 'Withdraw all token fees',
    accounts: [
      { name: 'Group' },
      { name: 'Bank' },
      { name: 'Vault' },
      { name: 'Destination' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const group = accounts[0].pubkey
      const bank = accounts[1].pubkey
      const client = await getClient(connection)
      const mangoGroup = await getGroupForClient(client, group)
      const mint = [...mangoGroup.banksMapByMint.values()].find(
        (x) => x[0]!.publicKey.equals(bank)!
      )![0]!.mint!
      const tokenSymbol = tokenPriceService.getTokenInfo(mint.toBase58())
        ?.symbol
      try {
        return (
          <div>
            {tokenSymbol ? tokenSymbol : <Loading className="w-5"></Loading>}
          </div>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  63223: {
    name: 'Token Withdraw',
    accounts: [
      { name: 'Group' },
      { name: 'Account' },
      { name: 'Owner' },
      { name: 'Bank' },
      { name: 'Vault' },
      { name: 'Oracle' },
      { name: 'TokenAccount' },
      { name: 'TokenProgram' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const args = await getDataObjectFlattened<any>(connection, data)
      const accountInfo = await connection.getParsedAccountInfo(
        accounts[6].pubkey
      )
      const mint = await tryGetMint(
        connection,
        new PublicKey(accountInfo.value?.data['parsed'].info.mint)
      )
      const tokenInfo = tokenPriceService.getTokenInfo(
        accountInfo.value?.data['parsed'].info.mint
      )

      try {
        return (
          <div>
            <div>
              amount:{' '}
              {mint?.account.decimals
                ? formatNumber(
                    toUiDecimals(args.amount, mint?.account.decimals)
                  )
                : args.amount}{' '}
              {tokenInfo?.symbol}
            </div>
            <div>allowBorrow: {args.allowBorrow.toString()}</div>
          </div>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  15219: {
    name: 'Withdraw all perp fees',
    accounts: [
      { name: 'Group' },
      { name: 'Perp market' },
      { name: 'Bank' },
      { name: 'Vault' },
      { name: 'Destination' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const group = accounts[0].pubkey
      const perpMarket = accounts[1].pubkey
      const client = await getClient(connection)
      const mangoGroup = await getGroupForClient(client, group)
      const marketName = [
        ...mangoGroup.perpMarketsMapByName.values(),
      ].find((x) => x.publicKey.equals(perpMarket))?.name
      try {
        return (
          <div>
            {marketName ? marketName : <Loading className="w-5"></Loading>}
          </div>
        )
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
  117255: {
    name: 'Token Deposit',
    accounts: [
      { name: 'Group' },
      { name: 'Account' },
      { name: 'Owner' },
      { name: 'Payer' },
    ],
    getDataUI: async (
      connection: Connection,
      data: Uint8Array,
      accounts: AccountMetaData[]
    ) => {
      const args = await getDataObjectFlattened<any>(connection, data)
      const accountInfo = await connection.getParsedAccountInfo(
        accounts[6].pubkey
      )
      const mint = await tryGetMint(
        connection,
        new PublicKey(accountInfo.value?.data['parsed'].info.mint)
      )
      const tokenInfo = tokenPriceService.getTokenInfo(
        accountInfo.value?.data['parsed'].info.mint
      )
      try {
        return (
          <div>
            <div>
              amount:{' '}
              {mint?.account.decimals
                ? formatNumber(
                    toUiDecimals(args.amount, mint?.account.decimals)
                  )
                : args.amount}{' '}
              {tokenInfo?.symbol}
            </div>
            <div>reduce only: {args.reduceOnly.toString()}</div>
          </div>
        )
      } catch (e) {
        console.log(e)
        return <div>{JSON.stringify(data)}</div>
      }
    },
  },
  186211: {
    name: 'Edit Mango Account',
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
  zF2vSz6V9g1YHGmfrzsY497NJzbRr84QUrPry4bLQ25: instructions(),
}

async function getDataObjectFlattened<T>(
  connection: Connection,
  data: Uint8Array
) {
  try {
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
  } catch (e) {
    return {} as T
  }
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
          if (key === 'maintWeightShiftAbort' && args[key] === false) {
            return false
          }
          if (key === 'setFallbackOracle' && args[key] === false) {
            return false
          }

          return true
        })
        .map((key) => {
          const isPublicKey = tryParseKey(args[key])
          const isBN = args[key] instanceof BN
          if (isBN && key === 'price.val') {
            return args[key] / Math.pow(2, 48)
          }
          return (
            <div key={key} className="flex">
              <div className="mr-3">{key}:</div>
              <div>{`${isPublicKey ? args[key] : commify(args[key])}`}</div>
            </div>
          )
        })}
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

const DisplayNullishProperty = ({
  label,
  value,
  suggestedVal,
  currentValue,
}: {
  label: string
  currentValue?: string | null | undefined | number
  value: string | null | undefined | number
  suggestedVal?: string | null | undefined | number
}) =>
  value ? (
    <div className="flex space-x-3">
      <div>{label}:</div>
      <div className="flex">
        <div className={`${currentValue ? 'text-grey' : ''}`}>
          {currentValue}
        </div>
      </div>
      {currentValue && <div className="mx-1">/</div>}
      <div className="flex">
        <div className="text-orange">{value}</div>
      </div>
      {suggestedVal && <div className="mx-1">/</div>}
      {suggestedVal && <div className="text-green">{suggestedVal}</div>}
    </div>
  ) : null

const DisplayListingProperty = ({
  label,
  val,
  suggestedVal,
  suffix,
  prefix,
}: {
  label: string
  val: any
  suggestedVal?: any
  suffix?: string
  prefix?: string
}) => (
  <div className="flex space-x-3">
    <div>{label}:</div>
    <div className="flex">
      <div className={`${suggestedVal ? 'text-orange' : ''}`}>
        {prefix}
        {`${val}`}
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

const getFormattedListingValues = (args: FlatListingArgs) => {
  const formattedArgs: ListingArgsFormatted = {
    tokenIndex: args.tokenIndex,
    tokenName: args.name,
    oracle: args.oracle?.toBase58 && args.oracle?.toBase58(),
    oracleConfidenceFilter:
      args['oracleConfig.confFilter'] >= 100
        ? args['oracleConfig.confFilter'].toString()
        : (args['oracleConfig.confFilter'] * 100).toFixed(2),
    oracleMaxStalenessSlots: args['oracleConfig.maxStalenessSlots'],
    interestRateUtilizationPoint0: (
      args['interestRateParams.util0'] * 100
    ).toFixed(2),
    interestRatePoint0: (args['interestRateParams.rate0'] * 100).toFixed(2),
    interestRateUtilizationPoint1: (
      args['interestRateParams.util1'] * 100
    ).toFixed(2),
    interestRatePoint1: (args['interestRateParams.rate1'] * 100).toFixed(2),
    maxRate: (args['interestRateParams.maxRate'] * 100).toFixed(2),
    adjustmentFactor: (
      args['interestRateParams.adjustmentFactor'] * 100
    ).toFixed(2),
    loanFeeRate: (args.loanFeeRate * 100).toFixed(2),
    loanOriginationFeeRate: (args.loanOriginationFeeRate * 100).toFixed(2),
    maintAssetWeight: args.maintAssetWeight.toFixed(2),
    initAssetWeight: args.initAssetWeight.toFixed(2),
    maintLiabWeight: args.maintLiabWeight.toFixed(2),
    initLiabWeight: args.initLiabWeight.toFixed(2),
    liquidationFee: (args['liquidationFee'] * 100).toFixed(2),
    platformLiquidationFee: (args['platformLiquidationFee'] * 100).toFixed(2),
    minVaultToDepositsRatio: (args['minVaultToDepositsRatio'] * 100).toFixed(2),
    netBorrowLimitPerWindowQuote: toUiDecimals(
      args['netBorrowLimitPerWindowQuote'],
      6
    ),
    netBorrowLimitWindowSizeTs: secondsToHours(args.netBorrowLimitWindowSizeTs),
    borrowWeightScaleStartQuote: toUiDecimals(
      args.borrowWeightScaleStartQuote,
      6
    ),
    depositWeightScaleStartQuote: toUiDecimals(
      args.depositWeightScaleStartQuote,
      6
    ),
    stablePriceDelayGrowthLimit: (
      args.stablePriceDelayGrowthLimit * 100
    ).toFixed(2),
    stablePriceDelayIntervalSeconds: secondsToHours(
      args.stablePriceDelayIntervalSeconds
    ),
    stablePriceGrowthLimit: (args.stablePriceGrowthLimit * 100).toFixed(2),
    tokenConditionalSwapMakerFeeRate: args.tokenConditionalSwapMakerFeeRate,
    tokenConditionalSwapTakerFeeRate: args.tokenConditionalSwapTakerFeeRate,
    flashLoanSwapFeeRate: (args.flashLoanSwapFeeRate * 10000).toFixed(2),
    reduceOnly: REDUCE_ONLY_OPTIONS[args.reduceOnly].name,
    depositLimit: args.depositLimit.toString(),
    interestTargetUtilization: args.interestTargetUtilization,
    interestCurveScaling: args.interestCurveScaling,
    groupInsuranceFund: args.groupInsuranceFund,
    collateralFeePerDay: (args.collateralFeePerDay * 100).toFixed(4),
    zeroUtilRate: (args.zeroUtilRate * 100).toFixed(2),
    disableAssetLiquidation: args.disableAssetLiquidation,
  }
  return formattedArgs
}

//need yarn add js-sha256 snakeCase
// function sighash(nameSpace: string, ixName: string): Buffer {
//   const name = snakeCase(ixName)
//   const preimage = `${nameSpace}:${name}`
//   return Buffer.from(sha256.digest(preimage)).slice(0, 8)
// }

const getApiTokenName = (bankName: string) => {
  if (bankName === 'ETH (Portal)') {
    return 'ETH'
  }
  return bankName
}

function isDifferenceWithin5Percent(a: number, b: number): boolean {
  // Calculate the absolute difference
  const difference = Math.abs(a - b)

  // Calculate the average of the two numbers
  const average = (a + b) / 2

  // Calculate the percentage difference
  const percentageDifference = (difference / average) * 100

  // Check if the difference is within 5%
  return percentageDifference <= 5
}
