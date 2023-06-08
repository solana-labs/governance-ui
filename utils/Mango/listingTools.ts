import { toUiDecimals } from '@blockworks-foundation/mango-v4'
import { secondsToHours } from 'date-fns'

export type ListingArgs = {
  tokenIndex: number
  name: string
  'oracleConfig.confFilter': number
  'oracleConfig.maxStalenessSlots': number
  'interestRateParams.utilnumber': number
  'interestRateParams.ratenumber': number
  'interestRateParams.util1': number
  'interestRateParams.rate1': number
  'interestRateParams.maxRate': number
  'interestRateParams.adjustmentFactor': number
  loanFeeRate: number
  loanOriginationFeeRate: number
  maintAssetWeight: number
  initAssetWeight: number
  maintLiabWeight: number
  initLiabWeight: number
  liquidationFee: number
  minVaultToDepositsRatio: number
  netBorrowLimitPerWindowQuote: number
  netBorrowLimitWindowSizeTs: number
}

export const getFormattedListingValues = (args: ListingArgs) => {
  const formmatedArgs = {
    tokenIndex: args.tokenIndex,
    tokenName: args.name,
    oracleConfidenceFilter: (args['oracleConfig.confFilter'] * 100).toFixed(2),
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
    loanFeeRate: (args.loanFeeRate * 10000).toFixed(2),
    loanOriginationFeeRate: (args.loanOriginationFeeRate * 10000).toFixed(2),
    maintAssetWeight: args.maintAssetWeight.toFixed(2),
    initAssetWeight: args.initAssetWeight.toFixed(2),
    maintLiabWeight: args.maintLiabWeight.toFixed(2),
    initLiabWeight: args.initLiabWeight.toFixed(2),
    liquidationFee: (args['liquidationFee'] * 100).toFixed(2),
    minVaultToDepositsRatio: (args['minVaultToDepositsRatio'] * 100).toFixed(2),
    netBorrowLimitPerWindowQuote: toUiDecimals(
      args['netBorrowLimitPerWindowQuote'],
      6
    ),
    netBorrowLimitWindowSizeTs: secondsToHours(args.netBorrowLimitWindowSizeTs),
  }
  return formmatedArgs
}
