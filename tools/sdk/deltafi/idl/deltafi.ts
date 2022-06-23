import { Idl } from '@project-serum/anchor';

export const deltafiDexV2: Idl = {
  version: '0.1.0',
  name: 'deltafi_dex_v2',
  instructions: [
    {
      name: 'createMarketConfig',
      accounts: [
        {
          name: 'seed',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'marketConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'deltafiMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'deltafiToken',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'pythProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'createSwap',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'seed',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mintQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenBase',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenQuote',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'adminFeeTokenBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'adminFeeTokenQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
        {
          name: 'swapType',
          type: {
            defined: 'SwapType',
          },
        },
        {
          name: 'swapConfig',
          type: {
            defined: 'SwapConfig',
          },
        },
      ],
    },
    {
      name: 'updateSwapConfig',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'swapConfig',
          type: {
            defined: 'SwapConfig',
          },
        },
      ],
    },
    {
      name: 'updateSwapVirtualReserve',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'virtualBaseReserve',
          type: 'u64',
        },
        {
          name: 'virtualQuoteReserve',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updateFarmConfig',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'farmInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'farmConfig',
          type: {
            defined: 'FarmConfig',
          },
        },
      ],
    },
    {
      name: 'initNormalSwap',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseAmount',
          type: 'u64',
        },
        {
          name: 'quoteAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'initStableSwap',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseAmount',
          type: 'u64',
        },
        {
          name: 'quoteAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'initSerumSwap',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'serumMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumBids',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumAsks',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseAmount',
          type: 'u64',
        },
        {
          name: 'quoteAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'createLiquidityProvider',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'createLiquidityProviderV2',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'depositToNormalSwap',
      accounts: [
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseAmount',
          type: 'u64',
        },
        {
          name: 'quoteAmount',
          type: 'u64',
        },
        {
          name: 'minBaseShare',
          type: 'u64',
        },
        {
          name: 'minQuoteShare',
          type: 'u64',
        },
      ],
    },
    {
      name: 'depositToStableSwap',
      accounts: [
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseAmount',
          type: 'u64',
        },
        {
          name: 'quoteAmount',
          type: 'u64',
        },
        {
          name: 'minBaseShare',
          type: 'u64',
        },
        {
          name: 'minQuoteShare',
          type: 'u64',
        },
      ],
    },
    {
      name: 'depositToSerumSwap',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'serumMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumBids',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumAsks',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseAmount',
          type: 'u64',
        },
        {
          name: 'quoteAmount',
          type: 'u64',
        },
        {
          name: 'minBaseShare',
          type: 'u64',
        },
        {
          name: 'minQuoteShare',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawFromNormalSwap',
      accounts: [
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'adminFeeTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminFeeTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseShare',
          type: 'u64',
        },
        {
          name: 'quoteShare',
          type: 'u64',
        },
        {
          name: 'minBaseAmount',
          type: 'u64',
        },
        {
          name: 'minQuoteAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawFromStableSwap',
      accounts: [
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'adminFeeTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminFeeTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseShare',
          type: 'u64',
        },
        {
          name: 'quoteShare',
          type: 'u64',
        },
        {
          name: 'minBaseAmount',
          type: 'u64',
        },
        {
          name: 'minQuoteAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawFromSerumSwap',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'serumMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumBids',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumAsks',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'adminFeeTokenBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminFeeTokenQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseShare',
          type: 'u64',
        },
        {
          name: 'quoteShare',
          type: 'u64',
        },
        {
          name: 'minBaseAmount',
          type: 'u64',
        },
        {
          name: 'minQuoteAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'normalSwap',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amountIn',
          type: 'u64',
        },
        {
          name: 'minAmountOut',
          type: 'u64',
        },
      ],
    },
    {
      name: 'normalSwapWithReferrer',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'referrer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amountIn',
          type: 'u64',
        },
        {
          name: 'minAmountOut',
          type: 'u64',
        },
      ],
    },
    {
      name: 'normalSwapWithRebate',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rebateToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amountIn',
          type: 'u64',
        },
        {
          name: 'minAmountOut',
          type: 'u64',
        },
      ],
    },
    {
      name: 'stableSwap',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amountIn',
          type: 'u64',
        },
        {
          name: 'minAmountOut',
          type: 'u64',
        },
      ],
    },
    {
      name: 'stableSwapWithReferrer',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'referrer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amountIn',
          type: 'u64',
        },
        {
          name: 'minAmountOut',
          type: 'u64',
        },
      ],
    },
    {
      name: 'stableSwapWithRebate',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rebateToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pythPriceBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pythPriceQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amountIn',
          type: 'u64',
        },
        {
          name: 'minAmountOut',
          type: 'u64',
        },
      ],
    },
    {
      name: 'serumSwap',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'serumMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumBids',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumAsks',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amountIn',
          type: 'u64',
        },
        {
          name: 'minAmountOut',
          type: 'u64',
        },
      ],
    },
    {
      name: 'serumSwapWithReferrer',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'referrer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'serumMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumBids',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumAsks',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amountIn',
          type: 'u64',
        },
        {
          name: 'minAmountOut',
          type: 'u64',
        },
      ],
    },
    {
      name: 'createFarm',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'farmInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
        {
          name: 'seed',
          type: 'publicKey',
        },
        {
          name: 'farmConfig',
          type: {
            defined: 'FarmConfig',
          },
        },
      ],
    },
    {
      name: 'depositToFarm',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'farmInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'farmUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'baseAmount',
          type: 'u64',
        },
        {
          name: 'quoteAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawFromFarm',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'farmInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidityProvider',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'farmUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'baseAmount',
          type: 'u64',
        },
        {
          name: 'quoteAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'claimFarmRewards',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'swapInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'farmInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'farmUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDeltafiToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDeltafiToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'createDeltafiUser',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'createDeltafiUserWithReferrer',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'referrer',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'claimSwapRewards',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDeltafiToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDeltafiToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'claimTradeRewards',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDeltafiToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDeltafiToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'claimReferralRewards',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'deltafiUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDeltafiToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'swapDeltafiToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'createFarmUser',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'farmInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'farmUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'createFarmUserV2',
      accounts: [
        {
          name: 'marketConfig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'farmInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'farmUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'DeltafiUser',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'configKey',
            type: 'publicKey',
          },
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'referrer',
            type: 'publicKey',
          },
          {
            name: 'owedTradeRewards',
            type: 'u64',
          },
          {
            name: 'claimedTradeRewards',
            type: 'u64',
          },
          {
            name: 'owedReferralRewards',
            type: 'u64',
          },
          {
            name: 'claimedReferralRewards',
            type: 'u64',
          },
          {
            name: 'reserved',
            type: {
              array: ['u64', 32],
            },
          },
        ],
      },
    },
    {
      name: 'FarmUser',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'configKey',
            type: 'publicKey',
          },
          {
            name: 'farmKey',
            type: 'publicKey',
          },
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'basePosition',
            type: {
              defined: 'FarmPosition',
            },
          },
          {
            name: 'quotePosition',
            type: {
              defined: 'FarmPosition',
            },
          },
          {
            name: 'reserved',
            type: {
              array: ['u64', 32],
            },
          },
        ],
      },
    },
    {
      name: 'FarmInfo',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'seed',
            type: 'publicKey',
          },
          {
            name: 'configKey',
            type: 'publicKey',
          },
          {
            name: 'swapKey',
            type: 'publicKey',
          },
          {
            name: 'stakedBaseShare',
            type: 'u64',
          },
          {
            name: 'stakedQuoteShare',
            type: 'u64',
          },
          {
            name: 'farmConfig',
            type: {
              defined: 'FarmConfig',
            },
          },
          {
            name: 'reserved',
            type: {
              array: ['u64', 32],
            },
          },
        ],
      },
    },
    {
      name: 'MarketConfig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'version',
            type: 'u8',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'seed',
            type: 'publicKey',
          },
          {
            name: 'adminKey',
            type: 'publicKey',
          },
          {
            name: 'deltafiMint',
            type: 'publicKey',
          },
          {
            name: 'deltafiToken',
            type: 'publicKey',
          },
          {
            name: 'pythProgramId',
            type: 'publicKey',
          },
          {
            name: 'serumProgramId',
            type: 'publicKey',
          },
          {
            name: 'reservedU64',
            type: {
              array: ['u64', 32],
            },
          },
        ],
      },
    },
    {
      name: 'SwapInfo',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'isInitialized',
            type: 'bool',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'seed',
            type: 'publicKey',
          },
          {
            name: 'swapType',
            type: {
              defined: 'SwapType',
            },
          },
          {
            name: 'configKey',
            type: 'publicKey',
          },
          {
            name: 'mintBase',
            type: 'publicKey',
          },
          {
            name: 'mintQuote',
            type: 'publicKey',
          },
          {
            name: 'tokenBase',
            type: 'publicKey',
          },
          {
            name: 'tokenQuote',
            type: 'publicKey',
          },
          {
            name: 'adminFeeTokenBase',
            type: 'publicKey',
          },
          {
            name: 'adminFeeTokenQuote',
            type: 'publicKey',
          },
          {
            name: 'mintBaseDecimals',
            type: 'u8',
          },
          {
            name: 'mintQuoteDecimals',
            type: 'u8',
          },
          {
            name: 'pythPriceBase',
            type: 'publicKey',
          },
          {
            name: 'pythPriceQuote',
            type: 'publicKey',
          },
          {
            name: 'serumMarket',
            type: 'publicKey',
          },
          {
            name: 'serumBids',
            type: 'publicKey',
          },
          {
            name: 'serumAsks',
            type: 'publicKey',
          },
          {
            name: 'poolState',
            type: {
              defined: 'PoolState',
            },
          },
          {
            name: 'swapConfig',
            type: {
              defined: 'SwapConfig',
            },
          },
          {
            name: 'reservedU64',
            type: {
              array: ['u64', 24],
            },
          },
        ],
      },
    },
    {
      name: 'LiquidityProvider',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'configKey',
            type: 'publicKey',
          },
          {
            name: 'swapKey',
            type: 'publicKey',
          },
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'baseShare',
            type: 'u64',
          },
          {
            name: 'quoteShare',
            type: 'u64',
          },
          {
            name: 'stakedBaseShare',
            type: 'u64',
          },
          {
            name: 'stakedQuoteShare',
            type: 'u64',
          },
          {
            name: 'deprecatedU64',
            type: {
              array: ['u64', 10],
            },
          },
          {
            name: 'reservedU64',
            type: {
              array: ['u64', 32],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'PoolState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'marketPrice',
            type: 'u128',
          },
          {
            name: 'baseReserve',
            type: 'u64',
          },
          {
            name: 'quoteReserve',
            type: 'u64',
          },
          {
            name: 'targetBaseReserve',
            type: 'u128',
          },
          {
            name: 'targetQuoteReserve',
            type: 'u128',
          },
          {
            name: 'baseSupply',
            type: 'u64',
          },
          {
            name: 'quoteSupply',
            type: 'u64',
          },
          {
            name: 'totalTradedBase',
            type: 'u128',
          },
          {
            name: 'totalTradedQuote',
            type: 'u128',
          },
          {
            name: 'accumulatedTradeReward',
            type: 'u64',
          },
          {
            name: 'lastRewardWindowStartTimestamp',
            type: 'u64',
          },
          {
            name: 'marketPriceLastUpdateSlot',
            type: 'u64',
          },
          {
            name: 'lowPrice',
            type: 'u128',
          },
          {
            name: 'highPrice',
            type: 'u128',
          },
          {
            name: 'virtualBaseReserve',
            type: 'u64',
          },
          {
            name: 'virtualQuoteReserve',
            type: 'u64',
          },
          {
            name: 'reservedU64',
            type: {
              array: ['u64', 14],
            },
          },
        ],
      },
    },
    {
      name: 'FarmPosition',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'depositedAmount',
            type: 'u64',
          },
          {
            name: 'rewardsOwed',
            type: 'u64',
          },
          {
            name: 'cumulativeInterest',
            type: 'u64',
          },
          {
            name: 'lastUpdateTs',
            type: 'i64',
          },
          {
            name: 'nextClaimTs',
            type: 'i64',
          },
          {
            name: 'latestDepositSlot',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'FarmConfig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'baseAprNumerator',
            type: 'u64',
          },
          {
            name: 'baseAprDenominator',
            type: 'u64',
          },
          {
            name: 'quoteAprNumerator',
            type: 'u64',
          },
          {
            name: 'quoteAprDenominator',
            type: 'u64',
          },
          {
            name: 'minClaimPeriod',
            type: 'u32',
          },
          {
            name: 'isPaused',
            type: 'bool',
          },
          {
            name: 'maxStakedBaseShare',
            type: 'u64',
          },
          {
            name: 'maxStakedQuoteShare',
            type: 'u64',
          },
          {
            name: 'endTimestamp',
            type: 'u64',
          },
          {
            name: 'reservedU64',
            type: {
              array: ['u64', 32],
            },
          },
        ],
      },
    },
    {
      name: 'SwapConfig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'isPaused',
            type: 'bool',
          },
          {
            name: 'enableConfidenceInterval',
            type: 'bool',
          },
          {
            name: 'maxSwapPercentage',
            type: 'u8',
          },
          {
            name: 'minReserveLimitPercentage',
            type: 'u8',
          },
          {
            name: 'serumMarketTokenRatioLimitPercentage',
            type: 'u8',
          },
          {
            name: 'adminTradeFeeNumerator',
            type: 'u32',
          },
          {
            name: 'adminTradeFeeDenominator',
            type: 'u32',
          },
          {
            name: 'adminWithdrawFeeNumerator',
            type: 'u32',
          },
          {
            name: 'adminWithdrawFeeDenominator',
            type: 'u32',
          },
          {
            name: 'tradeFeeNumerator',
            type: 'u32',
          },
          {
            name: 'tradeFeeDenominator',
            type: 'u32',
          },
          {
            name: 'withdrawFeeNumerator',
            type: 'u32',
          },
          {
            name: 'withdrawFeeDenominator',
            type: 'u32',
          },
          {
            name: 'tradeRewardNumerator',
            type: 'u32',
          },
          {
            name: 'tradeRewardDenominator',
            type: 'u32',
          },
          {
            name: 'referralRewardNumerator',
            type: 'u32',
          },
          {
            name: 'referralRewardDenominator',
            type: 'u32',
          },
          {
            name: 'maxStablePriceDiffNumerator',
            type: 'u32',
          },
          {
            name: 'maxStablePriceDiffDenominator',
            type: 'u32',
          },
          {
            name: 'tradeRewardCap',
            type: 'u64',
          },
          {
            name: 'tradeRewardMaxReserve',
            type: 'u64',
          },
          {
            name: 'slope',
            type: 'u128',
          },
          {
            name: 'disableStablePriceDiffCheck',
            type: 'bool',
          },
          {
            name: 'disableQuoteTokenPriceCheck',
            type: 'bool',
          },
          {
            name: 'rebateNumerator',
            type: 'u32',
          },
          {
            name: 'rebateDenominator',
            type: 'u32',
          },
          {
            name: 'maxVirtualReserveRatio',
            type: 'u16',
          },
          {
            name: 'reservedU8',
            type: {
              array: ['u8', 4],
            },
          },
          {
            name: 'reservedU64',
            type: {
              array: ['u64', 14],
            },
          },
        ],
      },
    },
    {
      name: 'SwapDirection',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'SellBase',
          },
          {
            name: 'SellQuote',
          },
        ],
      },
    },
    {
      name: 'SwapType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'NormalSwap',
          },
          {
            name: 'StableSwap',
          },
          {
            name: 'SerumSwap',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'AlreadyInUse',
      msg: 'Swap account already in use',
    },
    {
      code: 6001,
      name: 'InvalidAdmin',
      msg: 'Address of the admin fee account is incorrect',
    },
    {
      code: 6002,
      name: 'ActiveTransfer',
      msg: 'Active admin transfer in progress',
    },
    {
      code: 6003,
      name: 'NoActiveTransfer',
      msg: 'No active admin transfer in progress',
    },
    {
      code: 6004,
      name: 'AdminDeadlineExceeded',
      msg: 'Admin transfer deadline exceeded',
    },
    {
      code: 6005,
      name: 'Unauthorized',
      msg: 'Account is not authorized to execute this instruction',
    },
    {
      code: 6006,
      name: 'InvalidAccountOwner',
      msg: 'Input account owner is not the program',
    },
    {
      code: 6007,
      name: 'InvalidOwner',
      msg: 'Input account owner is not the program address',
    },
    {
      code: 6008,
      name: 'InvalidSigner',
      msg: 'Input account must be signer',
    },
    {
      code: 6009,
      name: 'InvalidOutputOwner',
      msg: 'Output pool account owner cannot be the program address',
    },
    {
      code: 6010,
      name: 'IncorrectSwapAccount',
      msg: 'Address of the provided swap token account is incorrect',
    },
    {
      code: 6011,
      name: 'InvalidProgramAddress',
      msg: 'Invalid program address generated from nonce and key',
    },
    {
      code: 6012,
      name: 'InvalidCloseAuthority',
      msg: 'Token account has a close authority',
    },
    {
      code: 6013,
      name: 'InvalidFreezeAuthority',
      msg: 'Pool token mint has a freeze authority',
    },
    {
      code: 6014,
      name: 'IncorrectTokenProgramId',
      msg: 'Incorrect token program ID',
    },
    {
      code: 6015,
      name: 'IncorrectMint',
      msg: 'Address of the provided token mint is incorrect',
    },
    {
      code: 6016,
      name: 'UnexpectedMint',
      msg: 'Deserialized account is not an SPL Token mint',
    },
    {
      code: 6017,
      name: 'RepeatedMint',
      msg: 'Swap input token accounts have the same mint',
    },
    {
      code: 6018,
      name: 'ExpectedAccount',
      msg: 'Deserialized account is not an SPL Token account',
    },
    {
      code: 6019,
      name: 'InvalidInstruction',
      msg: 'Invalid instruction',
    },
    {
      code: 6020,
      name: 'InstructionUnpackError',
      msg: 'Instruction unpack is failed',
    },
    {
      code: 6021,
      name: 'EmptyPool',
      msg: 'Pool token supply is 0',
    },
    {
      code: 6022,
      name: 'EmptySupply',
      msg: 'Input token account empty',
    },
    {
      code: 6023,
      name: 'InvalidSupply',
      msg: 'Pool token mint has a non-zero supply',
    },
    {
      code: 6024,
      name: 'InvalidDelegate',
      msg: 'Token account has a delegate',
    },
    {
      code: 6025,
      name: 'InvalidInput',
      msg: 'InvalidInput',
    },
    {
      code: 6026,
      name: 'IsPaused',
      msg: 'Swap pool is paused',
    },
    {
      code: 6027,
      name: 'NotRentExempt',
      msg: 'Lamport balance below rent-exempt threshold',
    },
    {
      code: 6028,
      name: 'CalculationFailure',
      msg: 'CalculationFailure',
    },
    {
      code: 6029,
      name: 'ExceededSlippage',
      msg: 'Swap instruction exceeds desired slippage limit',
    },
    {
      code: 6030,
      name: 'MismatchedDecimals',
      msg: 'Token mints must have same decimals',
    },
    {
      code: 6031,
      name: 'InvalidPythConfig',
      msg: 'Input pyth config is invalid',
    },
    {
      code: 6032,
      name: 'InsufficientLiquidity',
      msg: 'Insufficient liquidity available',
    },
    {
      code: 6033,
      name: 'LiquidityPositionEmpty',
      msg: 'User has no liquidity position',
    },
    {
      code: 6034,
      name: 'InvalidPositionKey',
      msg: 'Invalid position key',
    },
    {
      code: 6035,
      name: 'InvalidClaimTime',
      msg: 'Invalid claim timestamp',
    },
    {
      code: 6036,
      name: 'InsufficientClaimAmount',
      msg: 'Insufficient claim amount',
    },
    {
      code: 6037,
      name: 'InsufficientFunds',
      msg: 'Insufficient funds',
    },
    {
      code: 6038,
      name: 'WithdrawNotEnough',
      msg: 'Withdraw not enough',
    },
    {
      code: 6039,
      name: 'TokenInitializeMintFailed',
      msg: 'Mint initialization failed',
    },
    {
      code: 6040,
      name: 'InvalidSlope',
      msg: 'Invalid slope',
    },
    {
      code: 6041,
      name: 'InvalidAccount',
      msg: 'Invalid account',
    },
    {
      code: 6042,
      name: 'TokenTransferFailed',
      msg: 'Token transfer failed',
    },
    {
      code: 6043,
      name: 'TokenMintToFailed',
      msg: 'Token mint to failed',
    },
    {
      code: 6044,
      name: 'TokenBurnFailed',
      msg: 'Token burn failed',
    },
    {
      code: 6045,
      name: 'InvalidPythPrice',
      msg: 'Invalid pyth price',
    },
    {
      code: 6046,
      name: 'UnstablePythPrice',
      msg: 'Unstable pyth price',
    },
    {
      code: 6047,
      name: 'InconfidentPythPrice',
      msg: 'Pyth confidence interval is too large',
    },
    {
      code: 6048,
      name: 'IndexOutOfRange',
      msg: 'Index of out rage',
    },
    {
      code: 6049,
      name: 'InvalidMarketConfig',
      msg: 'Input market config is invalid',
    },
    {
      code: 6050,
      name: 'InvalidPythProgramId',
      msg: 'Pyth program id is invalid',
    },
    {
      code: 6051,
      name: 'PotentialFlashLoanAttack',
      msg: 'Potential Flash Loan Attack',
    },
    {
      code: 6052,
      name: 'IncorrectSwapType',
      msg: 'Incorrect swap type',
    },
    {
      code: 6053,
      name: 'IncorrectStablePrice',
      msg: 'Incorrect stable price',
    },
    {
      code: 6054,
      name: 'InvalidTokenDecimals',
      msg: 'Invalid token decimals',
    },
    {
      code: 6055,
      name: 'InconsistentPoolState',
      msg: 'Inconsistent pool state',
    },
    {
      code: 6056,
      name: 'InvalidReferrer',
      msg: 'Invalid referrer address',
    },
    {
      code: 6057,
      name: 'InconsistentInitialPoolTokenBalance',
      msg: 'Inconsistent initial pool token balance',
    },
    {
      code: 6058,
      name: 'ExceededSwapOutAmount',
      msg: 'Swap out amount exceeds the limit',
    },
    {
      code: 6059,
      name: 'AlreadyInitialized',
      msg: 'Already initialized',
    },
    {
      code: 6060,
      name: 'NotInitialized',
      msg: 'Not initialized',
    },
    {
      code: 6061,
      name: 'InvalidSwapConfig',
      msg: 'Invalid swap config',
    },
    {
      code: 6062,
      name: 'InvalidFarmConfig',
      msg: 'Invalid farm config',
    },
    {
      code: 6063,
      name: 'InsufficientPoolReserve',
      msg: 'Insufficient pool reserve',
    },
    {
      code: 6064,
      name: 'StableSwapPriceDiffLimitExceeded',
      msg: 'stable swap price diff limit exceeded',
    },
    {
      code: 6065,
      name: 'InvalidTimestamp',
      msg: 'Invalid timestamp',
    },
    {
      code: 6066,
      name: 'InvalidSerumData',
      msg: 'InvalidSerumData',
    },
    {
      code: 6067,
      name: 'InvalidPythPriceAccount',
      msg: 'Invalid pyth price account',
    },
    {
      code: 6068,
      name: 'InvalidSerumMarketTokenRatio',
      msg: 'InvalidSerumMarketTokenRatio',
    },
    {
      code: 6069,
      name: 'DepeggedQuotePrice',
      msg: 'DepeggedQuotePrice',
    },
    {
      code: 6070,
      name: 'InvalidWithdrawalAmount',
      msg: 'Invalid withdrawal amount',
    },
    {
      code: 6071,
      name: 'InvalidStakingAmount',
      msg: 'Invalid staking amount',
    },
    {
      code: 6072,
      name: 'RebateNotEnabled',
      msg: 'Rebate not enabled',
    },
  ],
};

export type DeltafiDexV2 = {
  version: '0.1.0';
  name: 'deltafi_dex_v2';
  instructions: [
    {
      name: 'createMarketConfig';
      accounts: [
        {
          name: 'seed';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'marketConfig';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'deltafiMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'deltafiToken';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'pythProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'createSwap';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'seed';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mintQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenBase';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'tokenQuote';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'adminFeeTokenBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'adminFeeTokenQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
        {
          name: 'swapType';
          type: {
            defined: 'SwapType';
          };
        },
        {
          name: 'swapConfig';
          type: {
            defined: 'SwapConfig';
          };
        },
      ];
    },
    {
      name: 'updateSwapConfig';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'swapConfig';
          type: {
            defined: 'SwapConfig';
          };
        },
      ];
    },
    {
      name: 'updateSwapVirtualReserve';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'virtualBaseReserve';
          type: 'u64';
        },
        {
          name: 'virtualQuoteReserve';
          type: 'u64';
        },
      ];
    },
    {
      name: 'updateFarmConfig';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'farmInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'farmConfig';
          type: {
            defined: 'FarmConfig';
          };
        },
      ];
    },
    {
      name: 'initNormalSwap';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseAmount';
          type: 'u64';
        },
        {
          name: 'quoteAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'initStableSwap';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseAmount';
          type: 'u64';
        },
        {
          name: 'quoteAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'initSerumSwap';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'serumMarket';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumBids';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumAsks';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseAmount';
          type: 'u64';
        },
        {
          name: 'quoteAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'createLiquidityProvider';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'createLiquidityProviderV2';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'depositToNormalSwap';
      accounts: [
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseAmount';
          type: 'u64';
        },
        {
          name: 'quoteAmount';
          type: 'u64';
        },
        {
          name: 'minBaseShare';
          type: 'u64';
        },
        {
          name: 'minQuoteShare';
          type: 'u64';
        },
      ];
    },
    {
      name: 'depositToStableSwap';
      accounts: [
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseAmount';
          type: 'u64';
        },
        {
          name: 'quoteAmount';
          type: 'u64';
        },
        {
          name: 'minBaseShare';
          type: 'u64';
        },
        {
          name: 'minQuoteShare';
          type: 'u64';
        },
      ];
    },
    {
      name: 'depositToSerumSwap';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'serumMarket';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumBids';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumAsks';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseAmount';
          type: 'u64';
        },
        {
          name: 'quoteAmount';
          type: 'u64';
        },
        {
          name: 'minBaseShare';
          type: 'u64';
        },
        {
          name: 'minQuoteShare';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawFromNormalSwap';
      accounts: [
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'adminFeeTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminFeeTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseShare';
          type: 'u64';
        },
        {
          name: 'quoteShare';
          type: 'u64';
        },
        {
          name: 'minBaseAmount';
          type: 'u64';
        },
        {
          name: 'minQuoteAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawFromStableSwap';
      accounts: [
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'adminFeeTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminFeeTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseShare';
          type: 'u64';
        },
        {
          name: 'quoteShare';
          type: 'u64';
        },
        {
          name: 'minBaseAmount';
          type: 'u64';
        },
        {
          name: 'minQuoteAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawFromSerumSwap';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'serumMarket';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumBids';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumAsks';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'adminFeeTokenBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminFeeTokenQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseShare';
          type: 'u64';
        },
        {
          name: 'quoteShare';
          type: 'u64';
        },
        {
          name: 'minBaseAmount';
          type: 'u64';
        },
        {
          name: 'minQuoteAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'normalSwap';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minAmountOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'normalSwapWithReferrer';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'referrer';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minAmountOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'normalSwapWithRebate';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rebateToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minAmountOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'stableSwap';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minAmountOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'stableSwapWithReferrer';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'referrer';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minAmountOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'stableSwapWithRebate';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rebateToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pythPriceBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pythPriceQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minAmountOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'serumSwap';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'serumMarket';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumBids';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumAsks';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minAmountOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'serumSwapWithReferrer';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'referrer';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'serumMarket';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumBids';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'serumAsks';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minAmountOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'createFarm';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'farmInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
        {
          name: 'seed';
          type: 'publicKey';
        },
        {
          name: 'farmConfig';
          type: {
            defined: 'FarmConfig';
          };
        },
      ];
    },
    {
      name: 'depositToFarm';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'farmInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'farmUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'baseAmount';
          type: 'u64';
        },
        {
          name: 'quoteAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawFromFarm';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'farmInfo';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'liquidityProvider';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'farmUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'baseAmount';
          type: 'u64';
        },
        {
          name: 'quoteAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'claimFarmRewards';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'swapInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'farmInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'farmUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDeltafiToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDeltafiToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'createDeltafiUser';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'createDeltafiUserWithReferrer';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'referrer';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'claimSwapRewards';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDeltafiToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDeltafiToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'claimTradeRewards';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDeltafiToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDeltafiToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'claimReferralRewards';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'deltafiUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDeltafiToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'swapDeltafiToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'createFarmUser';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'farmInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'farmUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'createFarmUserV2';
      accounts: [
        {
          name: 'marketConfig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'farmInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'farmUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'DeltafiUser';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'configKey';
            type: 'publicKey';
          },
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'referrer';
            type: 'publicKey';
          },
          {
            name: 'owedTradeRewards';
            type: 'u64';
          },
          {
            name: 'claimedTradeRewards';
            type: 'u64';
          },
          {
            name: 'owedReferralRewards';
            type: 'u64';
          },
          {
            name: 'claimedReferralRewards';
            type: 'u64';
          },
          {
            name: 'reserved';
            type: {
              array: ['u64', 32];
            };
          },
        ];
      };
    },
    {
      name: 'FarmUser';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'configKey';
            type: 'publicKey';
          },
          {
            name: 'farmKey';
            type: 'publicKey';
          },
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'basePosition';
            type: {
              defined: 'FarmPosition';
            };
          },
          {
            name: 'quotePosition';
            type: {
              defined: 'FarmPosition';
            };
          },
          {
            name: 'reserved';
            type: {
              array: ['u64', 32];
            };
          },
        ];
      };
    },
    {
      name: 'FarmInfo';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'seed';
            type: 'publicKey';
          },
          {
            name: 'configKey';
            type: 'publicKey';
          },
          {
            name: 'swapKey';
            type: 'publicKey';
          },
          {
            name: 'stakedBaseShare';
            type: 'u64';
          },
          {
            name: 'stakedQuoteShare';
            type: 'u64';
          },
          {
            name: 'farmConfig';
            type: {
              defined: 'FarmConfig';
            };
          },
          {
            name: 'reserved';
            type: {
              array: ['u64', 32];
            };
          },
        ];
      };
    },
    {
      name: 'MarketConfig';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'version';
            type: 'u8';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'seed';
            type: 'publicKey';
          },
          {
            name: 'adminKey';
            type: 'publicKey';
          },
          {
            name: 'deltafiMint';
            type: 'publicKey';
          },
          {
            name: 'deltafiToken';
            type: 'publicKey';
          },
          {
            name: 'pythProgramId';
            type: 'publicKey';
          },
          {
            name: 'serumProgramId';
            type: 'publicKey';
          },
          {
            name: 'reservedU64';
            type: {
              array: ['u64', 32];
            };
          },
        ];
      };
    },
    {
      name: 'SwapInfo';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isInitialized';
            type: 'bool';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'seed';
            type: 'publicKey';
          },
          {
            name: 'swapType';
            type: {
              defined: 'SwapType';
            };
          },
          {
            name: 'configKey';
            type: 'publicKey';
          },
          {
            name: 'mintBase';
            type: 'publicKey';
          },
          {
            name: 'mintQuote';
            type: 'publicKey';
          },
          {
            name: 'tokenBase';
            type: 'publicKey';
          },
          {
            name: 'tokenQuote';
            type: 'publicKey';
          },
          {
            name: 'adminFeeTokenBase';
            type: 'publicKey';
          },
          {
            name: 'adminFeeTokenQuote';
            type: 'publicKey';
          },
          {
            name: 'mintBaseDecimals';
            type: 'u8';
          },
          {
            name: 'mintQuoteDecimals';
            type: 'u8';
          },
          {
            name: 'pythPriceBase';
            type: 'publicKey';
          },
          {
            name: 'pythPriceQuote';
            type: 'publicKey';
          },
          {
            name: 'serumMarket';
            type: 'publicKey';
          },
          {
            name: 'serumBids';
            type: 'publicKey';
          },
          {
            name: 'serumAsks';
            type: 'publicKey';
          },
          {
            name: 'poolState';
            type: {
              defined: 'PoolState';
            };
          },
          {
            name: 'swapConfig';
            type: {
              defined: 'SwapConfig';
            };
          },
          {
            name: 'reservedU64';
            type: {
              array: ['u64', 24];
            };
          },
        ];
      };
    },
    {
      name: 'LiquidityProvider';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'configKey';
            type: 'publicKey';
          },
          {
            name: 'swapKey';
            type: 'publicKey';
          },
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'baseShare';
            type: 'u64';
          },
          {
            name: 'quoteShare';
            type: 'u64';
          },
          {
            name: 'stakedBaseShare';
            type: 'u64';
          },
          {
            name: 'stakedQuoteShare';
            type: 'u64';
          },
          {
            name: 'deprecatedU64';
            type: {
              array: ['u64', 10];
            };
          },
          {
            name: 'reservedU64';
            type: {
              array: ['u64', 32];
            };
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'PoolState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'marketPrice';
            type: 'u128';
          },
          {
            name: 'baseReserve';
            type: 'u64';
          },
          {
            name: 'quoteReserve';
            type: 'u64';
          },
          {
            name: 'targetBaseReserve';
            type: 'u128';
          },
          {
            name: 'targetQuoteReserve';
            type: 'u128';
          },
          {
            name: 'baseSupply';
            type: 'u64';
          },
          {
            name: 'quoteSupply';
            type: 'u64';
          },
          {
            name: 'totalTradedBase';
            type: 'u128';
          },
          {
            name: 'totalTradedQuote';
            type: 'u128';
          },
          {
            name: 'accumulatedTradeReward';
            type: 'u64';
          },
          {
            name: 'lastRewardWindowStartTimestamp';
            type: 'u64';
          },
          {
            name: 'marketPriceLastUpdateSlot';
            type: 'u64';
          },
          {
            name: 'lowPrice';
            type: 'u128';
          },
          {
            name: 'highPrice';
            type: 'u128';
          },
          {
            name: 'virtualBaseReserve';
            type: 'u64';
          },
          {
            name: 'virtualQuoteReserve';
            type: 'u64';
          },
          {
            name: 'reservedU64';
            type: {
              array: ['u64', 14];
            };
          },
        ];
      };
    },
    {
      name: 'FarmPosition';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'depositedAmount';
            type: 'u64';
          },
          {
            name: 'rewardsOwed';
            type: 'u64';
          },
          {
            name: 'cumulativeInterest';
            type: 'u64';
          },
          {
            name: 'lastUpdateTs';
            type: 'i64';
          },
          {
            name: 'nextClaimTs';
            type: 'i64';
          },
          {
            name: 'latestDepositSlot';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'FarmConfig';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'baseAprNumerator';
            type: 'u64';
          },
          {
            name: 'baseAprDenominator';
            type: 'u64';
          },
          {
            name: 'quoteAprNumerator';
            type: 'u64';
          },
          {
            name: 'quoteAprDenominator';
            type: 'u64';
          },
          {
            name: 'minClaimPeriod';
            type: 'u32';
          },
          {
            name: 'isPaused';
            type: 'bool';
          },
          {
            name: 'maxStakedBaseShare';
            type: 'u64';
          },
          {
            name: 'maxStakedQuoteShare';
            type: 'u64';
          },
          {
            name: 'endTimestamp';
            type: 'u64';
          },
          {
            name: 'reservedU64';
            type: {
              array: ['u64', 32];
            };
          },
        ];
      };
    },
    {
      name: 'SwapConfig';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isPaused';
            type: 'bool';
          },
          {
            name: 'enableConfidenceInterval';
            type: 'bool';
          },
          {
            name: 'maxSwapPercentage';
            type: 'u8';
          },
          {
            name: 'minReserveLimitPercentage';
            type: 'u8';
          },
          {
            name: 'serumMarketTokenRatioLimitPercentage';
            type: 'u8';
          },
          {
            name: 'adminTradeFeeNumerator';
            type: 'u32';
          },
          {
            name: 'adminTradeFeeDenominator';
            type: 'u32';
          },
          {
            name: 'adminWithdrawFeeNumerator';
            type: 'u32';
          },
          {
            name: 'adminWithdrawFeeDenominator';
            type: 'u32';
          },
          {
            name: 'tradeFeeNumerator';
            type: 'u32';
          },
          {
            name: 'tradeFeeDenominator';
            type: 'u32';
          },
          {
            name: 'withdrawFeeNumerator';
            type: 'u32';
          },
          {
            name: 'withdrawFeeDenominator';
            type: 'u32';
          },
          {
            name: 'tradeRewardNumerator';
            type: 'u32';
          },
          {
            name: 'tradeRewardDenominator';
            type: 'u32';
          },
          {
            name: 'referralRewardNumerator';
            type: 'u32';
          },
          {
            name: 'referralRewardDenominator';
            type: 'u32';
          },
          {
            name: 'maxStablePriceDiffNumerator';
            type: 'u32';
          },
          {
            name: 'maxStablePriceDiffDenominator';
            type: 'u32';
          },
          {
            name: 'tradeRewardCap';
            type: 'u64';
          },
          {
            name: 'tradeRewardMaxReserve';
            type: 'u64';
          },
          {
            name: 'slope';
            type: 'u128';
          },
          {
            name: 'disableStablePriceDiffCheck';
            type: 'bool';
          },
          {
            name: 'disableQuoteTokenPriceCheck';
            type: 'bool';
          },
          {
            name: 'rebateNumerator';
            type: 'u32';
          },
          {
            name: 'rebateDenominator';
            type: 'u32';
          },
          {
            name: 'maxVirtualReserveRatio';
            type: 'u16';
          },
          {
            name: 'reservedU8';
            type: {
              array: ['u8', 4];
            };
          },
          {
            name: 'reservedU64';
            type: {
              array: ['u64', 14];
            };
          },
        ];
      };
    },
    {
      name: 'SwapDirection';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'SellBase';
          },
          {
            name: 'SellQuote';
          },
        ];
      };
    },
    {
      name: 'SwapType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'NormalSwap';
          },
          {
            name: 'StableSwap';
          },
          {
            name: 'SerumSwap';
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'AlreadyInUse';
      msg: 'Swap account already in use';
    },
    {
      code: 6001;
      name: 'InvalidAdmin';
      msg: 'Address of the admin fee account is incorrect';
    },
    {
      code: 6002;
      name: 'ActiveTransfer';
      msg: 'Active admin transfer in progress';
    },
    {
      code: 6003;
      name: 'NoActiveTransfer';
      msg: 'No active admin transfer in progress';
    },
    {
      code: 6004;
      name: 'AdminDeadlineExceeded';
      msg: 'Admin transfer deadline exceeded';
    },
    {
      code: 6005;
      name: 'Unauthorized';
      msg: 'Account is not authorized to execute this instruction';
    },
    {
      code: 6006;
      name: 'InvalidAccountOwner';
      msg: 'Input account owner is not the program';
    },
    {
      code: 6007;
      name: 'InvalidOwner';
      msg: 'Input account owner is not the program address';
    },
    {
      code: 6008;
      name: 'InvalidSigner';
      msg: 'Input account must be signer';
    },
    {
      code: 6009;
      name: 'InvalidOutputOwner';
      msg: 'Output pool account owner cannot be the program address';
    },
    {
      code: 6010;
      name: 'IncorrectSwapAccount';
      msg: 'Address of the provided swap token account is incorrect';
    },
    {
      code: 6011;
      name: 'InvalidProgramAddress';
      msg: 'Invalid program address generated from nonce and key';
    },
    {
      code: 6012;
      name: 'InvalidCloseAuthority';
      msg: 'Token account has a close authority';
    },
    {
      code: 6013;
      name: 'InvalidFreezeAuthority';
      msg: 'Pool token mint has a freeze authority';
    },
    {
      code: 6014;
      name: 'IncorrectTokenProgramId';
      msg: 'Incorrect token program ID';
    },
    {
      code: 6015;
      name: 'IncorrectMint';
      msg: 'Address of the provided token mint is incorrect';
    },
    {
      code: 6016;
      name: 'UnexpectedMint';
      msg: 'Deserialized account is not an SPL Token mint';
    },
    {
      code: 6017;
      name: 'RepeatedMint';
      msg: 'Swap input token accounts have the same mint';
    },
    {
      code: 6018;
      name: 'ExpectedAccount';
      msg: 'Deserialized account is not an SPL Token account';
    },
    {
      code: 6019;
      name: 'InvalidInstruction';
      msg: 'Invalid instruction';
    },
    {
      code: 6020;
      name: 'InstructionUnpackError';
      msg: 'Instruction unpack is failed';
    },
    {
      code: 6021;
      name: 'EmptyPool';
      msg: 'Pool token supply is 0';
    },
    {
      code: 6022;
      name: 'EmptySupply';
      msg: 'Input token account empty';
    },
    {
      code: 6023;
      name: 'InvalidSupply';
      msg: 'Pool token mint has a non-zero supply';
    },
    {
      code: 6024;
      name: 'InvalidDelegate';
      msg: 'Token account has a delegate';
    },
    {
      code: 6025;
      name: 'InvalidInput';
      msg: 'InvalidInput';
    },
    {
      code: 6026;
      name: 'IsPaused';
      msg: 'Swap pool is paused';
    },
    {
      code: 6027;
      name: 'NotRentExempt';
      msg: 'Lamport balance below rent-exempt threshold';
    },
    {
      code: 6028;
      name: 'CalculationFailure';
      msg: 'CalculationFailure';
    },
    {
      code: 6029;
      name: 'ExceededSlippage';
      msg: 'Swap instruction exceeds desired slippage limit';
    },
    {
      code: 6030;
      name: 'MismatchedDecimals';
      msg: 'Token mints must have same decimals';
    },
    {
      code: 6031;
      name: 'InvalidPythConfig';
      msg: 'Input pyth config is invalid';
    },
    {
      code: 6032;
      name: 'InsufficientLiquidity';
      msg: 'Insufficient liquidity available';
    },
    {
      code: 6033;
      name: 'LiquidityPositionEmpty';
      msg: 'User has no liquidity position';
    },
    {
      code: 6034;
      name: 'InvalidPositionKey';
      msg: 'Invalid position key';
    },
    {
      code: 6035;
      name: 'InvalidClaimTime';
      msg: 'Invalid claim timestamp';
    },
    {
      code: 6036;
      name: 'InsufficientClaimAmount';
      msg: 'Insufficient claim amount';
    },
    {
      code: 6037;
      name: 'InsufficientFunds';
      msg: 'Insufficient funds';
    },
    {
      code: 6038;
      name: 'WithdrawNotEnough';
      msg: 'Withdraw not enough';
    },
    {
      code: 6039;
      name: 'TokenInitializeMintFailed';
      msg: 'Mint initialization failed';
    },
    {
      code: 6040;
      name: 'InvalidSlope';
      msg: 'Invalid slope';
    },
    {
      code: 6041;
      name: 'InvalidAccount';
      msg: 'Invalid account';
    },
    {
      code: 6042;
      name: 'TokenTransferFailed';
      msg: 'Token transfer failed';
    },
    {
      code: 6043;
      name: 'TokenMintToFailed';
      msg: 'Token mint to failed';
    },
    {
      code: 6044;
      name: 'TokenBurnFailed';
      msg: 'Token burn failed';
    },
    {
      code: 6045;
      name: 'InvalidPythPrice';
      msg: 'Invalid pyth price';
    },
    {
      code: 6046;
      name: 'UnstablePythPrice';
      msg: 'Unstable pyth price';
    },
    {
      code: 6047;
      name: 'InconfidentPythPrice';
      msg: 'Pyth confidence interval is too large';
    },
    {
      code: 6048;
      name: 'IndexOutOfRange';
      msg: 'Index of out rage';
    },
    {
      code: 6049;
      name: 'InvalidMarketConfig';
      msg: 'Input market config is invalid';
    },
    {
      code: 6050;
      name: 'InvalidPythProgramId';
      msg: 'Pyth program id is invalid';
    },
    {
      code: 6051;
      name: 'PotentialFlashLoanAttack';
      msg: 'Potential Flash Loan Attack';
    },
    {
      code: 6052;
      name: 'IncorrectSwapType';
      msg: 'Incorrect swap type';
    },
    {
      code: 6053;
      name: 'IncorrectStablePrice';
      msg: 'Incorrect stable price';
    },
    {
      code: 6054;
      name: 'InvalidTokenDecimals';
      msg: 'Invalid token decimals';
    },
    {
      code: 6055;
      name: 'InconsistentPoolState';
      msg: 'Inconsistent pool state';
    },
    {
      code: 6056;
      name: 'InvalidReferrer';
      msg: 'Invalid referrer address';
    },
    {
      code: 6057;
      name: 'InconsistentInitialPoolTokenBalance';
      msg: 'Inconsistent initial pool token balance';
    },
    {
      code: 6058;
      name: 'ExceededSwapOutAmount';
      msg: 'Swap out amount exceeds the limit';
    },
    {
      code: 6059;
      name: 'AlreadyInitialized';
      msg: 'Already initialized';
    },
    {
      code: 6060;
      name: 'NotInitialized';
      msg: 'Not initialized';
    },
    {
      code: 6061;
      name: 'InvalidSwapConfig';
      msg: 'Invalid swap config';
    },
    {
      code: 6062;
      name: 'InvalidFarmConfig';
      msg: 'Invalid farm config';
    },
    {
      code: 6063;
      name: 'InsufficientPoolReserve';
      msg: 'Insufficient pool reserve';
    },
    {
      code: 6064;
      name: 'StableSwapPriceDiffLimitExceeded';
      msg: 'stable swap price diff limit exceeded';
    },
    {
      code: 6065;
      name: 'InvalidTimestamp';
      msg: 'Invalid timestamp';
    },
    {
      code: 6066;
      name: 'InvalidSerumData';
      msg: 'InvalidSerumData';
    },
    {
      code: 6067;
      name: 'InvalidPythPriceAccount';
      msg: 'Invalid pyth price account';
    },
    {
      code: 6068;
      name: 'InvalidSerumMarketTokenRatio';
      msg: 'InvalidSerumMarketTokenRatio';
    },
    {
      code: 6069;
      name: 'DepeggedQuotePrice';
      msg: 'DepeggedQuotePrice';
    },
    {
      code: 6070;
      name: 'InvalidWithdrawalAmount';
      msg: 'Invalid withdrawal amount';
    },
    {
      code: 6071;
      name: 'InvalidStakingAmount';
      msg: 'Invalid staking amount';
    },
    {
      code: 6072;
      name: 'RebateNotEnabled';
      msg: 'Rebate not enabled';
    },
  ];
};
