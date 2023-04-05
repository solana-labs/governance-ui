export type Poseidon = {
  version: '0.1.0'
  name: 'poseidon'
  instructions: [
    {
      name: 'initBoundedStrategy'
      accounts: [
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'authority'
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'account'
                type: 'publicKey'
                account: 'BoundedStrategy'
                path: 'strategy'
              },
              {
                kind: 'const'
                type: 'string'
                value: 'authority'
              }
            ]
          }
        },
        {
          name: 'mint'
          isMut: false
          isSigner: false
        },
        {
          name: 'serumMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'orderPayer'
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'account'
                type: 'publicKey'
                account: 'BoundedStrategy'
                path: 'strategy'
              },
              {
                kind: 'const'
                type: 'string'
                value: 'orderPayer'
              }
            ]
          }
        },
        {
          name: 'strategy'
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'account'
                type: 'publicKey'
                path: 'serum_market'
              },
              {
                kind: 'account'
                type: 'publicKey'
                account: 'Mint'
                path: 'mint'
              },
              {
                kind: 'arg'
                type: 'u64'
                path: 'bound_price'
              },
              {
                kind: 'arg'
                type: 'i64'
                path: 'reclaim_date'
              },
              {
                kind: 'const'
                type: 'string'
                value: 'boundedStrategy'
              }
            ]
          }
        },
        {
          name: 'reclaimAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'depositAccount'
          isMut: false
          isSigner: false
          docs: ['The account where swapped assets will be transferred to']
        },
        {
          name: 'openOrders'
          isMut: true
          isSigner: false
          docs: ['The OpenOrders account to initialize']
          pda: {
            seeds: [
              {
                kind: 'account'
                type: 'publicKey'
                account: 'BoundedStrategy'
                path: 'strategy'
              },
              {
                kind: 'const'
                type: 'string'
                value: 'openOrders'
              }
            ]
          }
        },
        {
          name: 'dexProgram'
          isMut: false
          isSigner: false
          docs: ['The Serum program']
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'transferAmount'
          type: 'u64'
        },
        {
          name: 'boundPrice'
          type: 'u64'
        },
        {
          name: 'reclaimDate'
          type: 'i64'
        },
        {
          name: 'orderSide'
          type: 'u8'
        },
        {
          name: 'bound'
          type: 'u8'
        },
        {
          name: 'openOrdersSpace'
          type: 'u64'
        }
      ]
    },
    {
      name: 'boundedTrade'
      accounts: [
        {
          name: 'payer'
          isMut: false
          isSigner: true
          docs: ['Anyone can fire this transaction']
        },
        {
          name: 'strategy'
          isMut: false
          isSigner: false
          docs: ['The BoundedStrategy account']
        },
        {
          name: 'serumMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'bids'
          isMut: true
          isSigner: false
          docs: ["The Serum Market's bids account"]
        },
        {
          name: 'asks'
          isMut: true
          isSigner: false
          docs: ["The Serum Market's asks accoutn"]
        },
        {
          name: 'openOrders'
          isMut: true
          isSigner: false
        },
        {
          name: 'orderPayer'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: false
        },
        {
          name: 'requestQueue'
          isMut: true
          isSigner: false
        },
        {
          name: 'eventQueue'
          isMut: true
          isSigner: false
        },
        {
          name: 'coinVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'pcVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'serumVaultSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'depositAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'dexProgram'
          isMut: false
          isSigner: false
          docs: ['The Serum program']
        },
        {
          name: 'tokenProgramId'
          isMut: false
          isSigner: false
          docs: ['The SPL Token program id']
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'reclaim'
      accounts: [
        {
          name: 'receiver'
          isMut: true
          isSigner: false
          docs: ['The account that will receive the SOL']
        },
        {
          name: 'strategy'
          isMut: true
          isSigner: false
          docs: ['The BoundedStrategy account']
        },
        {
          name: 'authority'
          isMut: false
          isSigner: false
          docs: ['The PDA that has authority over the order payer']
        },
        {
          name: 'orderPayer'
          isMut: true
          isSigner: false
          docs: ['The account where the assets to trade with are']
        },
        {
          name: 'openOrders'
          isMut: true
          isSigner: false
        },
        {
          name: 'serumMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'reclaimAccount'
          isMut: true
          isSigner: false
          docs: ['The account that will receive the assets']
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'dexProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'srSettleFunds'
      accounts: [
        {
          name: 'reclaimAccount'
          isMut: true
          isSigner: false
          docs: ['Either the PC or Coin wallet from the strategy']
        },
        {
          name: 'strategy'
          isMut: false
          isSigner: false
          docs: ['The BoundedStrategy account']
        },
        {
          name: 'serumMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'openOrders'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: false
        },
        {
          name: 'coinVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'pcVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'serumVaultSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'depositAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'dexProgram'
          isMut: false
          isSigner: false
          docs: ['The Serum program']
        },
        {
          name: 'tokenProgramId'
          isMut: false
          isSigner: false
          docs: ['The SPL Token program id']
        }
      ]
      args: []
    },
    {
      name: 'initBoundedStrategyV2'
      accounts: [
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'collateralAccount'
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: 'account'
                type: 'publicKey'
                account: 'BoundedStrategyV2'
                path: 'strategy'
              },
              {
                kind: 'const'
                type: 'string'
                value: 'orderPayer'
              }
            ]
          }
        },
        {
          name: 'mint'
          isMut: false
          isSigner: false
        },
        {
          name: 'strategy'
          isMut: true
          isSigner: false
          docs: [
            "TODO: The BoundedStrategy seeds will likely need another key. Otherwise DAO's and other",
            'users will be uniquely constrained by these values.'
          ]
          pda: {
            seeds: [
              {
                kind: 'account'
                type: 'publicKey'
                account: 'Mint'
                path: 'mint'
              },
              {
                kind: 'arg'
                type: 'u64'
                path: 'bounded_price_numerator'
              },
              {
                kind: 'arg'
                type: 'u64'
                path: 'bounded_price_denominator'
              },
              {
                kind: 'arg'
                type: 'i64'
                path: 'reclaim_date'
              },
              {
                kind: 'const'
                type: 'string'
                value: 'boundedStrategy'
              }
            ]
          }
        },
        {
          name: 'reclaimAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'depositAccount'
          isMut: false
          isSigner: false
          docs: ['The account where swapped assets will be transferred to']
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'transferAmount'
          type: 'u64'
        },
        {
          name: 'boundedPriceNumerator'
          type: 'u64'
        },
        {
          name: 'boundedPriceDenominator'
          type: 'u64'
        },
        {
          name: 'reclaimDate'
          type: 'i64'
        }
      ]
    },
    {
      name: 'boundedTradeV2'
      accounts: [
        {
          name: 'payer'
          isMut: false
          isSigner: true
          docs: ['Anyone can fire this transaction']
        },
        {
          name: 'strategy'
          isMut: false
          isSigner: false
          docs: ['The BoundedStrategy account']
        },
        {
          name: 'orderPayer'
          isMut: true
          isSigner: false
        },
        {
          name: 'depositAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'additionalData'
          type: 'bytes'
        }
      ]
    },
    {
      name: 'reclaimV2'
      accounts: [
        {
          name: 'receiver'
          isMut: true
          isSigner: false
          docs: ['The account that will receive the SOL']
        },
        {
          name: 'strategy'
          isMut: true
          isSigner: false
          docs: ['The BoundedStrategyV2 account']
        },
        {
          name: 'collateralAccount'
          isMut: true
          isSigner: false
          docs: ['The account where the assets to trade with are']
        },
        {
          name: 'reclaimAccount'
          isMut: true
          isSigner: false
          docs: ['The account that will receive the assets']
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    }
  ]
  accounts: [
    {
      name: 'boundedStrategyV2'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'collateralMint'
            type: 'publicKey'
          },
          {
            name: 'collateralAccount'
            docs: ['The token account where the assets to be traded are held']
            type: 'publicKey'
          },
          {
            name: 'reclaimDate'
            docs: ["The date at which the DAO's assets can be reclaimed"]
            type: 'i64'
          },
          {
            name: 'reclaimAddress'
            docs: [
              'The address that the assets are transferred to when being reclaimed.'
            ]
            type: 'publicKey'
          },
          {
            name: 'depositAddress'
            docs: ['The address where the swapped asset should be deposited']
            type: 'publicKey'
          },
          {
            name: 'boundedPriceNumerator'
            docs: [
              'Using a numerator and denominator we can back out a price without having to use floating',
              'point math or account for token decimals when price checking.',
              '',
              '### Example:',
              'Buying SOL with USDC for $92.75',
              'Use a numerator of 92_750_000 because USDC has 6 decimals. So 92_750_000 is 92.75 USDC.',
              "Use a denominator of 1_000_000_000 because SOL has 9 decimal places. So that's 1 SOL.",
              '92.75 USDC / 1 SOL'
            ]
            type: 'u64'
          },
          {
            name: 'boundedPriceDenominator'
            type: 'u64'
          },
          {
            name: 'bump'
            docs: ["The bump for the strategy's derived address"]
            type: 'u8'
          }
        ]
      }
    },
    {
      name: 'boundedStrategy'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            docs: [
              'The PDA authority that owns the order_payer and open_orders account'
            ]
            type: 'publicKey'
          },
          {
            name: 'serumMarket'
            docs: ['The Serum market where the execution will take place']
            type: 'publicKey'
          },
          {
            name: 'openOrders'
            docs: [
              'The open_orders account that is owned by the authority and used to place orders'
            ]
            type: 'publicKey'
          },
          {
            name: 'orderPayer'
            docs: [
              'The SPL TokenAccount that contains the tokens that will be put into Serum for trading'
            ]
            type: 'publicKey'
          },
          {
            name: 'orderSide'
            docs: [
              'The side of the order book the market order will be placed',
              '0 for Bid, 1 for Ask'
            ]
            type: 'u8'
          },
          {
            name: 'reclaimDate'
            docs: ["The date at which the DAO's assets can be reclaimed"]
            type: 'i64'
          },
          {
            name: 'reclaimAddress'
            docs: [
              'The address that the assets are transferred to when being reclaimed.'
            ]
            type: 'publicKey'
          },
          {
            name: 'depositAddress'
            docs: ['The address where the swapped asset should be deposited']
            type: 'publicKey'
          },
          {
            name: 'bound'
            docs: ['0 for lower bound, 1 for upper bound']
            type: 'u8'
          },
          {
            name: 'boundedPrice'
            docs: [
              'The price of the base asset that governs the bound. The decimals are',
              "equivalent to the price on the Serum Market's order book"
            ]
            type: 'u64'
          },
          {
            name: 'authorityBump'
            type: 'u8'
          },
          {
            name: 'serumDexId'
            docs: [
              'The address of the serum dex program this strategy trades on'
            ]
            type: 'publicKey'
          }
        ]
      }
    }
  ]
  types: [
    {
      name: 'U64F64'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'val'
            type: 'u128'
          }
        ]
      }
    },
    {
      name: 'DexList'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'OpenBookV3'
          },
          {
            name: 'Raydium'
          }
        ]
      }
    },
    {
      name: 'CurveType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'ConstantProduct'
          },
          {
            name: 'Stable'
          }
        ]
      }
    },
    {
      name: 'FeeTier'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Base'
          },
          {
            name: '_SRM2'
          },
          {
            name: '_SRM3'
          },
          {
            name: '_SRM4'
          },
          {
            name: '_SRM5'
          },
          {
            name: '_SRM6'
          },
          {
            name: '_MSRM'
          },
          {
            name: 'Stable'
          }
        ]
      }
    },
    {
      name: 'FeeTier'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Base'
          },
          {
            name: 'SRM2'
          },
          {
            name: 'SRM3'
          },
          {
            name: 'SRM4'
          },
          {
            name: 'SRM5'
          },
          {
            name: 'SRM6'
          },
          {
            name: 'MSRM'
          },
          {
            name: 'Stable'
          }
        ]
      }
    }
  ]
  errors: [
    {
      code: 6000
      name: 'IncorrectSystemProgram'
      msg: 'Must use correct SystemProgram'
    },
    {
      code: 6001
      name: 'BadReclaimAddress'
      msg: "Reclaim account's Mint must match"
    },
    {
      code: 6002
      name: 'ReclaimDateHasPassed'
      msg: 'Reclaim date must be in the future'
    },
    {
      code: 6003
      name: 'BoundPriceIsZero'
      msg: 'Bound price must be greater than 0'
    },
    {
      code: 6004
      name: 'NonBinaryOrderSide'
      msg: 'Order side must be 0 or 1'
    },
    {
      code: 6005
      name: 'NonBinaryBound'
      msg: 'Bound must be 0 or 1'
    },
    {
      code: 6006
      name: 'MarketPriceIsOutOfBounds'
      msg: 'Market price is out of bounds'
    },
    {
      code: 6007
      name: 'NoLowerBoundedBids'
      msg: 'Lower bounded bids are blocked'
    },
    {
      code: 6008
      name: 'NoUpperBoundedAsks'
      msg: 'Upper bounded asks are blocked'
    },
    {
      code: 6009
      name: 'ReclaimDateHasNotPassed'
      msg: 'Cannot reclaim assets before the reclaim date'
    },
    {
      code: 6010
      name: 'TransferAmountCantBe0'
      msg: 'Transfer amount cannot be 0'
    },
    {
      code: 6011
      name: 'BidsRequireQuoteCurrency'
      msg: 'Strategy requires the quote currency to place bids'
    },
    {
      code: 6012
      name: 'AsksRequireBaseCurrency'
      msg: 'Strategy requires the base currency to place asks'
    },
    {
      code: 6013
      name: 'OrderPayerMisMatch'
      msg: 'Order payer does not match the strategy'
    },
    {
      code: 6014
      name: 'AuthorityMisMatch'
      msg: 'Authority does not match the strategy'
    },
    {
      code: 6015
      name: 'DepositAddressMisMatch'
      msg: 'Depsoit address does not match the strategy'
    },
    {
      code: 6016
      name: 'WrongReclaimAddress'
      msg: 'Cannot reclaim to different address'
    },
    {
      code: 6017
      name: 'BadDepositAddress'
      msg: 'Deposit address must have same owner as reclaim address'
    },
    {
      code: 6018
      name: 'WrongOpenOrdersKey'
      msg: 'open orders does not match strategy'
    },
    {
      code: 6019
      name: 'FailedToLoadOpenBookDexMarket'
      msg: 'Failed to load OpenBook DEX Market'
    },
    {
      code: 6020
      name: 'BadOpenOrdersKey'
      msg: 'OpenOrders account does not match derived address'
    },
    {
      code: 6021
      name: 'UknownDexId'
      msg: 'Uknown DEX Program ID'
    },
    {
      code: 6022
      name: 'OutputMintMismatch'
      msg: 'Output mint does not match route'
    },
    {
      code: 6023
      name: 'InputMintMismatch'
      msg: 'Input mint does not match route'
    },
    {
      code: 6024
      name: 'IncorrectKeysForLeg'
      msg: "The Leg's accounts aren't correct or ordered properly"
    },
    {
      code: 6025
      name: 'BadTokenAccountKeyForLeg'
      msg: 'The intermediary token account key is incorrect'
    },
    {
      code: 6026
      name: 'BadLutProgramAddress'
      msg: 'Bad LUT program address'
    },
    {
      code: 6027
      name: 'TooManyAccounts'
      msg: 'Cannot handle more than 30 accounts'
    }
  ]
}

export const IDL: Poseidon = {
  version: '0.1.0',
  name: 'poseidon',
  instructions: [
    {
      name: 'initBoundedStrategy',
      accounts: [
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'account',
                type: 'publicKey',
                account: 'BoundedStrategy',
                path: 'strategy',
              },
              {
                kind: 'const',
                type: 'string',
                value: 'authority',
              },
            ],
          },
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'orderPayer',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'account',
                type: 'publicKey',
                account: 'BoundedStrategy',
                path: 'strategy',
              },
              {
                kind: 'const',
                type: 'string',
                value: 'orderPayer',
              },
            ],
          },
        },
        {
          name: 'strategy',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'account',
                type: 'publicKey',
                path: 'serum_market',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'mint',
              },
              {
                kind: 'arg',
                type: 'u64',
                path: 'bound_price',
              },
              {
                kind: 'arg',
                type: 'i64',
                path: 'reclaim_date',
              },
              {
                kind: 'const',
                type: 'string',
                value: 'boundedStrategy',
              },
            ],
          },
        },
        {
          name: 'reclaimAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositAccount',
          isMut: false,
          isSigner: false,
          docs: ['The account where swapped assets will be transferred to'],
        },
        {
          name: 'openOrders',
          isMut: true,
          isSigner: false,
          docs: ['The OpenOrders account to initialize'],
          pda: {
            seeds: [
              {
                kind: 'account',
                type: 'publicKey',
                account: 'BoundedStrategy',
                path: 'strategy',
              },
              {
                kind: 'const',
                type: 'string',
                value: 'openOrders',
              },
            ],
          },
        },
        {
          name: 'dexProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Serum program'],
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
          name: 'transferAmount',
          type: 'u64',
        },
        {
          name: 'boundPrice',
          type: 'u64',
        },
        {
          name: 'reclaimDate',
          type: 'i64',
        },
        {
          name: 'orderSide',
          type: 'u8',
        },
        {
          name: 'bound',
          type: 'u8',
        },
        {
          name: 'openOrdersSpace',
          type: 'u64',
        },
      ],
    },
    {
      name: 'boundedTrade',
      accounts: [
        {
          name: 'payer',
          isMut: false,
          isSigner: true,
          docs: ['Anyone can fire this transaction'],
        },
        {
          name: 'strategy',
          isMut: false,
          isSigner: false,
          docs: ['The BoundedStrategy account'],
        },
        {
          name: 'serumMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bids',
          isMut: true,
          isSigner: false,
          docs: ["The Serum Market's bids account"],
        },
        {
          name: 'asks',
          isMut: true,
          isSigner: false,
          docs: ["The Serum Market's asks accoutn"],
        },
        {
          name: 'openOrders',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'orderPayer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'requestQueue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'eventQueue',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'coinVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pcVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'serumVaultSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'depositAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'dexProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Serum program'],
        },
        {
          name: 'tokenProgramId',
          isMut: false,
          isSigner: false,
          docs: ['The SPL Token program id'],
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'reclaim',
      accounts: [
        {
          name: 'receiver',
          isMut: true,
          isSigner: false,
          docs: ['The account that will receive the SOL'],
        },
        {
          name: 'strategy',
          isMut: true,
          isSigner: false,
          docs: ['The BoundedStrategy account'],
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
          docs: ['The PDA that has authority over the order payer'],
        },
        {
          name: 'orderPayer',
          isMut: true,
          isSigner: false,
          docs: ['The account where the assets to trade with are'],
        },
        {
          name: 'openOrders',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'serumMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'reclaimAccount',
          isMut: true,
          isSigner: false,
          docs: ['The account that will receive the assets'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'dexProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'srSettleFunds',
      accounts: [
        {
          name: 'reclaimAccount',
          isMut: true,
          isSigner: false,
          docs: ['Either the PC or Coin wallet from the strategy'],
        },
        {
          name: 'strategy',
          isMut: false,
          isSigner: false,
          docs: ['The BoundedStrategy account'],
        },
        {
          name: 'serumMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'openOrders',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'coinVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pcVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'serumVaultSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'depositAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'dexProgram',
          isMut: false,
          isSigner: false,
          docs: ['The Serum program'],
        },
        {
          name: 'tokenProgramId',
          isMut: false,
          isSigner: false,
          docs: ['The SPL Token program id'],
        },
      ],
      args: [],
    },
    {
      name: 'initBoundedStrategyV2',
      accounts: [
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'collateralAccount',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'account',
                type: 'publicKey',
                account: 'BoundedStrategyV2',
                path: 'strategy',
              },
              {
                kind: 'const',
                type: 'string',
                value: 'orderPayer',
              },
            ],
          },
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'strategy',
          isMut: true,
          isSigner: false,
          docs: [
            "TODO: The BoundedStrategy seeds will likely need another key. Otherwise DAO's and other",
            'users will be uniquely constrained by these values.',
          ],
          pda: {
            seeds: [
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'mint',
              },
              {
                kind: 'arg',
                type: 'u64',
                path: 'bounded_price_numerator',
              },
              {
                kind: 'arg',
                type: 'u64',
                path: 'bounded_price_denominator',
              },
              {
                kind: 'arg',
                type: 'i64',
                path: 'reclaim_date',
              },
              {
                kind: 'const',
                type: 'string',
                value: 'boundedStrategy',
              },
            ],
          },
        },
        {
          name: 'reclaimAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositAccount',
          isMut: false,
          isSigner: false,
          docs: ['The account where swapped assets will be transferred to'],
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
      ],
      args: [
        {
          name: 'transferAmount',
          type: 'u64',
        },
        {
          name: 'boundedPriceNumerator',
          type: 'u64',
        },
        {
          name: 'boundedPriceDenominator',
          type: 'u64',
        },
        {
          name: 'reclaimDate',
          type: 'i64',
        },
      ],
    },
    {
      name: 'boundedTradeV2',
      accounts: [
        {
          name: 'payer',
          isMut: false,
          isSigner: true,
          docs: ['Anyone can fire this transaction'],
        },
        {
          name: 'strategy',
          isMut: false,
          isSigner: false,
          docs: ['The BoundedStrategy account'],
        },
        {
          name: 'orderPayer',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'additionalData',
          type: 'bytes',
        },
      ],
    },
    {
      name: 'reclaimV2',
      accounts: [
        {
          name: 'receiver',
          isMut: true,
          isSigner: false,
          docs: ['The account that will receive the SOL'],
        },
        {
          name: 'strategy',
          isMut: true,
          isSigner: false,
          docs: ['The BoundedStrategyV2 account'],
        },
        {
          name: 'collateralAccount',
          isMut: true,
          isSigner: false,
          docs: ['The account where the assets to trade with are'],
        },
        {
          name: 'reclaimAccount',
          isMut: true,
          isSigner: false,
          docs: ['The account that will receive the assets'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'boundedStrategyV2',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'collateralMint',
            type: 'publicKey',
          },
          {
            name: 'collateralAccount',
            docs: ['The token account where the assets to be traded are held'],
            type: 'publicKey',
          },
          {
            name: 'reclaimDate',
            docs: ["The date at which the DAO's assets can be reclaimed"],
            type: 'i64',
          },
          {
            name: 'reclaimAddress',
            docs: [
              'The address that the assets are transferred to when being reclaimed.',
            ],
            type: 'publicKey',
          },
          {
            name: 'depositAddress',
            docs: ['The address where the swapped asset should be deposited'],
            type: 'publicKey',
          },
          {
            name: 'boundedPriceNumerator',
            docs: [
              'Using a numerator and denominator we can back out a price without having to use floating',
              'point math or account for token decimals when price checking.',
              '',
              '### Example:',
              'Buying SOL with USDC for $92.75',
              'Use a numerator of 92_750_000 because USDC has 6 decimals. So 92_750_000 is 92.75 USDC.',
              "Use a denominator of 1_000_000_000 because SOL has 9 decimal places. So that's 1 SOL.",
              '92.75 USDC / 1 SOL',
            ],
            type: 'u64',
          },
          {
            name: 'boundedPriceDenominator',
            type: 'u64',
          },
          {
            name: 'bump',
            docs: ["The bump for the strategy's derived address"],
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'boundedStrategy',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            docs: [
              'The PDA authority that owns the order_payer and open_orders account',
            ],
            type: 'publicKey',
          },
          {
            name: 'serumMarket',
            docs: ['The Serum market where the execution will take place'],
            type: 'publicKey',
          },
          {
            name: 'openOrders',
            docs: [
              'The open_orders account that is owned by the authority and used to place orders',
            ],
            type: 'publicKey',
          },
          {
            name: 'orderPayer',
            docs: [
              'The SPL TokenAccount that contains the tokens that will be put into Serum for trading',
            ],
            type: 'publicKey',
          },
          {
            name: 'orderSide',
            docs: [
              'The side of the order book the market order will be placed',
              '0 for Bid, 1 for Ask',
            ],
            type: 'u8',
          },
          {
            name: 'reclaimDate',
            docs: ["The date at which the DAO's assets can be reclaimed"],
            type: 'i64',
          },
          {
            name: 'reclaimAddress',
            docs: [
              'The address that the assets are transferred to when being reclaimed.',
            ],
            type: 'publicKey',
          },
          {
            name: 'depositAddress',
            docs: ['The address where the swapped asset should be deposited'],
            type: 'publicKey',
          },
          {
            name: 'bound',
            docs: ['0 for lower bound, 1 for upper bound'],
            type: 'u8',
          },
          {
            name: 'boundedPrice',
            docs: [
              'The price of the base asset that governs the bound. The decimals are',
              "equivalent to the price on the Serum Market's order book",
            ],
            type: 'u64',
          },
          {
            name: 'authorityBump',
            type: 'u8',
          },
          {
            name: 'serumDexId',
            docs: [
              'The address of the serum dex program this strategy trades on',
            ],
            type: 'publicKey',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'U64F64',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'val',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'DexList',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'OpenBookV3',
          },
          {
            name: 'Raydium',
          },
        ],
      },
    },
    {
      name: 'CurveType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'ConstantProduct',
          },
          {
            name: 'Stable',
          },
        ],
      },
    },
    {
      name: 'FeeTier',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Base',
          },
          {
            name: '_SRM2',
          },
          {
            name: '_SRM3',
          },
          {
            name: '_SRM4',
          },
          {
            name: '_SRM5',
          },
          {
            name: '_SRM6',
          },
          {
            name: '_MSRM',
          },
          {
            name: 'Stable',
          },
        ],
      },
    },
    {
      name: 'FeeTier',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Base',
          },
          {
            name: 'SRM2',
          },
          {
            name: 'SRM3',
          },
          {
            name: 'SRM4',
          },
          {
            name: 'SRM5',
          },
          {
            name: 'SRM6',
          },
          {
            name: 'MSRM',
          },
          {
            name: 'Stable',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'IncorrectSystemProgram',
      msg: 'Must use correct SystemProgram',
    },
    {
      code: 6001,
      name: 'BadReclaimAddress',
      msg: "Reclaim account's Mint must match",
    },
    {
      code: 6002,
      name: 'ReclaimDateHasPassed',
      msg: 'Reclaim date must be in the future',
    },
    {
      code: 6003,
      name: 'BoundPriceIsZero',
      msg: 'Bound price must be greater than 0',
    },
    {
      code: 6004,
      name: 'NonBinaryOrderSide',
      msg: 'Order side must be 0 or 1',
    },
    {
      code: 6005,
      name: 'NonBinaryBound',
      msg: 'Bound must be 0 or 1',
    },
    {
      code: 6006,
      name: 'MarketPriceIsOutOfBounds',
      msg: 'Market price is out of bounds',
    },
    {
      code: 6007,
      name: 'NoLowerBoundedBids',
      msg: 'Lower bounded bids are blocked',
    },
    {
      code: 6008,
      name: 'NoUpperBoundedAsks',
      msg: 'Upper bounded asks are blocked',
    },
    {
      code: 6009,
      name: 'ReclaimDateHasNotPassed',
      msg: 'Cannot reclaim assets before the reclaim date',
    },
    {
      code: 6010,
      name: 'TransferAmountCantBe0',
      msg: 'Transfer amount cannot be 0',
    },
    {
      code: 6011,
      name: 'BidsRequireQuoteCurrency',
      msg: 'Strategy requires the quote currency to place bids',
    },
    {
      code: 6012,
      name: 'AsksRequireBaseCurrency',
      msg: 'Strategy requires the base currency to place asks',
    },
    {
      code: 6013,
      name: 'OrderPayerMisMatch',
      msg: 'Order payer does not match the strategy',
    },
    {
      code: 6014,
      name: 'AuthorityMisMatch',
      msg: 'Authority does not match the strategy',
    },
    {
      code: 6015,
      name: 'DepositAddressMisMatch',
      msg: 'Depsoit address does not match the strategy',
    },
    {
      code: 6016,
      name: 'WrongReclaimAddress',
      msg: 'Cannot reclaim to different address',
    },
    {
      code: 6017,
      name: 'BadDepositAddress',
      msg: 'Deposit address must have same owner as reclaim address',
    },
    {
      code: 6018,
      name: 'WrongOpenOrdersKey',
      msg: 'open orders does not match strategy',
    },
    {
      code: 6019,
      name: 'FailedToLoadOpenBookDexMarket',
      msg: 'Failed to load OpenBook DEX Market',
    },
    {
      code: 6020,
      name: 'BadOpenOrdersKey',
      msg: 'OpenOrders account does not match derived address',
    },
    {
      code: 6021,
      name: 'UknownDexId',
      msg: 'Uknown DEX Program ID',
    },
    {
      code: 6022,
      name: 'OutputMintMismatch',
      msg: 'Output mint does not match route',
    },
    {
      code: 6023,
      name: 'InputMintMismatch',
      msg: 'Input mint does not match route',
    },
    {
      code: 6024,
      name: 'IncorrectKeysForLeg',
      msg: "The Leg's accounts aren't correct or ordered properly",
    },
    {
      code: 6025,
      name: 'BadTokenAccountKeyForLeg',
      msg: 'The intermediary token account key is incorrect',
    },
    {
      code: 6026,
      name: 'BadLutProgramAddress',
      msg: 'Bad LUT program address',
    },
    {
      code: 6027,
      name: 'TooManyAccounts',
      msg: 'Cannot handle more than 30 accounts',
    },
  ],
}
