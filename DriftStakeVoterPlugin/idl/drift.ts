export type Drift = {
  version: '2.66.0'
  name: 'drift'
  instructions: [
    {
      name: 'initializeUser'
      accounts: [
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'rent'
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
          name: 'subAccountId'
          type: 'u16'
        },
        {
          name: 'name'
          type: {
            array: ['u8', 32]
          }
        }
      ]
    },
    {
      name: 'initializeUserStats'
      accounts: [
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'initializeReferrerName'
      accounts: [
        {
          name: 'referrerName'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'rent'
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
          name: 'name'
          type: {
            array: ['u8', 32]
          }
        }
      ]
    },
    {
      name: 'deposit'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'spotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'userTokenAccount'
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
          name: 'marketIndex'
          type: 'u16'
        },
        {
          name: 'amount'
          type: 'u64'
        },
        {
          name: 'reduceOnly'
          type: 'bool'
        }
      ]
    },
    {
      name: 'withdraw'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'spotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'userTokenAccount'
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
          name: 'marketIndex'
          type: 'u16'
        },
        {
          name: 'amount'
          type: 'u64'
        },
        {
          name: 'reduceOnly'
          type: 'bool'
        }
      ]
    },
    {
      name: 'transferDeposit'
      accounts: [
        {
          name: 'fromUser'
          isMut: true
          isSigner: false
        },
        {
          name: 'toUser'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarketVault'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'marketIndex'
          type: 'u16'
        },
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'placePerpOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OrderParams'
          }
        }
      ]
    },
    {
      name: 'cancelOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'orderId'
          type: {
            option: 'u32'
          }
        }
      ]
    },
    {
      name: 'cancelOrderByUserId'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'userOrderId'
          type: 'u8'
        }
      ]
    },
    {
      name: 'cancelOrders'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'marketType'
          type: {
            option: {
              defined: 'MarketType'
            }
          }
        },
        {
          name: 'marketIndex'
          type: {
            option: 'u16'
          }
        },
        {
          name: 'direction'
          type: {
            option: {
              defined: 'PositionDirection'
            }
          }
        }
      ]
    },
    {
      name: 'cancelOrdersByIds'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'orderIds'
          type: {
            vec: 'u32'
          }
        }
      ]
    },
    {
      name: 'modifyOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'orderId'
          type: {
            option: 'u32'
          }
        },
        {
          name: 'modifyOrderParams'
          type: {
            defined: 'ModifyOrderParams'
          }
        }
      ]
    },
    {
      name: 'modifyOrderByUserId'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'userOrderId'
          type: 'u8'
        },
        {
          name: 'modifyOrderParams'
          type: {
            defined: 'ModifyOrderParams'
          }
        }
      ]
    },
    {
      name: 'placeAndTakePerpOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OrderParams'
          }
        },
        {
          name: 'makerOrderId'
          type: {
            option: 'u32'
          }
        }
      ]
    },
    {
      name: 'placeAndMakePerpOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'taker'
          isMut: true
          isSigner: false
        },
        {
          name: 'takerStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OrderParams'
          }
        },
        {
          name: 'takerOrderId'
          type: 'u32'
        }
      ]
    },
    {
      name: 'placeSpotOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OrderParams'
          }
        }
      ]
    },
    {
      name: 'placeAndTakeSpotOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OrderParams'
          }
        },
        {
          name: 'fulfillmentType'
          type: {
            option: {
              defined: 'SpotFulfillmentType'
            }
          }
        },
        {
          name: 'makerOrderId'
          type: {
            option: 'u32'
          }
        }
      ]
    },
    {
      name: 'placeAndMakeSpotOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'taker'
          isMut: true
          isSigner: false
        },
        {
          name: 'takerStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            defined: 'OrderParams'
          }
        },
        {
          name: 'takerOrderId'
          type: 'u32'
        },
        {
          name: 'fulfillmentType'
          type: {
            option: {
              defined: 'SpotFulfillmentType'
            }
          }
        }
      ]
    },
    {
      name: 'placeOrders'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'params'
          type: {
            vec: {
              defined: 'OrderParams'
            }
          }
        }
      ]
    },
    {
      name: 'beginSwap'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'outSpotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'inSpotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'outTokenAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'inTokenAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'instructions'
          isMut: false
          isSigner: false
          docs: ['Instructions Sysvar for instruction introspection']
        }
      ]
      args: [
        {
          name: 'inMarketIndex'
          type: 'u16'
        },
        {
          name: 'outMarketIndex'
          type: 'u16'
        },
        {
          name: 'amountIn'
          type: 'u64'
        }
      ]
    },
    {
      name: 'endSwap'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'outSpotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'inSpotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'outTokenAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'inTokenAccount'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'instructions'
          isMut: false
          isSigner: false
          docs: ['Instructions Sysvar for instruction introspection']
        }
      ]
      args: [
        {
          name: 'inMarketIndex'
          type: 'u16'
        },
        {
          name: 'outMarketIndex'
          type: 'u16'
        },
        {
          name: 'limitPrice'
          type: {
            option: 'u64'
          }
        },
        {
          name: 'reduceOnly'
          type: {
            option: {
              defined: 'SwapReduceOnly'
            }
          }
        }
      ]
    },
    {
      name: 'addPerpLpShares'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'nShares'
          type: 'u64'
        },
        {
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'removePerpLpShares'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'sharesToBurn'
          type: 'u64'
        },
        {
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'removePerpLpSharesInExpiringMarket'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'sharesToBurn'
          type: 'u64'
        },
        {
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'updateUserName'
      accounts: [
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'subAccountId'
          type: 'u16'
        },
        {
          name: 'name'
          type: {
            array: ['u8', 32]
          }
        }
      ]
    },
    {
      name: 'updateUserCustomMarginRatio'
      accounts: [
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'subAccountId'
          type: 'u16'
        },
        {
          name: 'marginRatio'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updateUserMarginTradingEnabled'
      accounts: [
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'subAccountId'
          type: 'u16'
        },
        {
          name: 'marginTradingEnabled'
          type: 'bool'
        }
      ]
    },
    {
      name: 'updateUserDelegate'
      accounts: [
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'subAccountId'
          type: 'u16'
        },
        {
          name: 'delegate'
          type: 'publicKey'
        }
      ]
    },
    {
      name: 'updateUserReduceOnly'
      accounts: [
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'subAccountId'
          type: 'u16'
        },
        {
          name: 'reduceOnly'
          type: 'bool'
        }
      ]
    },
    {
      name: 'updateUserAdvancedLp'
      accounts: [
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'subAccountId'
          type: 'u16'
        },
        {
          name: 'advancedLp'
          type: 'bool'
        }
      ]
    },
    {
      name: 'deleteUser'
      accounts: [
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: []
    },
    {
      name: 'reclaimRent'
      accounts: [
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
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
      name: 'fillPerpOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'filler'
          isMut: true
          isSigner: false
        },
        {
          name: 'fillerStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'orderId'
          type: {
            option: 'u32'
          }
        },
        {
          name: 'makerOrderId'
          type: {
            option: 'u32'
          }
        }
      ]
    },
    {
      name: 'revertFill'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'filler'
          isMut: true
          isSigner: false
        },
        {
          name: 'fillerStats'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'fillSpotOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'filler'
          isMut: true
          isSigner: false
        },
        {
          name: 'fillerStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'orderId'
          type: {
            option: 'u32'
          }
        },
        {
          name: 'fulfillmentType'
          type: {
            option: {
              defined: 'SpotFulfillmentType'
            }
          }
        },
        {
          name: 'makerOrderId'
          type: {
            option: 'u32'
          }
        }
      ]
    },
    {
      name: 'triggerOrder'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'filler'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'orderId'
          type: 'u32'
        }
      ]
    },
    {
      name: 'forceCancelOrders'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'filler'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'updateUserIdle'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'filler'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'updateUserOpenOrdersCount'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'filler'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'adminDisableUpdatePerpBidAskTwap'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'disable'
          type: 'bool'
        }
      ]
    },
    {
      name: 'settlePnl'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'spotMarketVault'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'settleFundingPayment'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'settleLp'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'settleExpiredMarket'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'liquidatePerp'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'liquidator'
          isMut: true
          isSigner: false
        },
        {
          name: 'liquidatorStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'marketIndex'
          type: 'u16'
        },
        {
          name: 'liquidatorMaxBaseAssetAmount'
          type: 'u64'
        },
        {
          name: 'limitPrice'
          type: {
            option: 'u64'
          }
        }
      ]
    },
    {
      name: 'liquidateSpot'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'liquidator'
          isMut: true
          isSigner: false
        },
        {
          name: 'liquidatorStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'assetMarketIndex'
          type: 'u16'
        },
        {
          name: 'liabilityMarketIndex'
          type: 'u16'
        },
        {
          name: 'liquidatorMaxLiabilityTransfer'
          type: 'u128'
        },
        {
          name: 'limitPrice'
          type: {
            option: 'u64'
          }
        }
      ]
    },
    {
      name: 'liquidateBorrowForPerpPnl'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'liquidator'
          isMut: true
          isSigner: false
        },
        {
          name: 'liquidatorStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'perpMarketIndex'
          type: 'u16'
        },
        {
          name: 'spotMarketIndex'
          type: 'u16'
        },
        {
          name: 'liquidatorMaxLiabilityTransfer'
          type: 'u128'
        },
        {
          name: 'limitPrice'
          type: {
            option: 'u64'
          }
        }
      ]
    },
    {
      name: 'liquidatePerpPnlForDeposit'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'liquidator'
          isMut: true
          isSigner: false
        },
        {
          name: 'liquidatorStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'perpMarketIndex'
          type: 'u16'
        },
        {
          name: 'spotMarketIndex'
          type: 'u16'
        },
        {
          name: 'liquidatorMaxPnlTransfer'
          type: 'u128'
        },
        {
          name: 'limitPrice'
          type: {
            option: 'u64'
          }
        }
      ]
    },
    {
      name: 'resolvePerpPnlDeficit'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'spotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'insuranceFundVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
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
          name: 'spotMarketIndex'
          type: 'u16'
        },
        {
          name: 'perpMarketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'resolvePerpBankruptcy'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'liquidator'
          isMut: true
          isSigner: false
        },
        {
          name: 'liquidatorStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'spotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'insuranceFundVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
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
          name: 'quoteSpotMarketIndex'
          type: 'u16'
        },
        {
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'resolveSpotBankruptcy'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'liquidator'
          isMut: true
          isSigner: false
        },
        {
          name: 'liquidatorStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'user'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'spotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'insuranceFundVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
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
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'settleRevenueToInsuranceFund'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'spotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'insuranceFundVault'
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
          name: 'spotMarketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'updateFundingRate'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'updatePerpBidAskTwap'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'keeperStats'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: []
    },
    {
      name: 'updateSpotMarketCumulativeInterest'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarketVault'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'updateAmms'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'marketIndexes'
          type: {
            array: ['u16', 5]
          }
        }
      ]
    },
    {
      name: 'updateSpotMarketExpiry'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'expiryTs'
          type: 'i64'
        }
      ]
    },
    {
      name: 'updateUserQuoteAssetInsuranceStake'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'insuranceFundStake'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'insuranceFundVault'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'initializeInsuranceFundStake'
      accounts: [
        {
          name: 'spotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'insuranceFundStake'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'payer'
          isMut: true
          isSigner: true
        },
        {
          name: 'rent'
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
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'addInsuranceFundStake'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'insuranceFundStake'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'spotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'insuranceFundVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'userTokenAccount'
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
          name: 'marketIndex'
          type: 'u16'
        },
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'requestRemoveInsuranceFundStake'
      accounts: [
        {
          name: 'spotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'insuranceFundStake'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'insuranceFundVault'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'marketIndex'
          type: 'u16'
        },
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'cancelRequestRemoveInsuranceFundStake'
      accounts: [
        {
          name: 'spotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'insuranceFundStake'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'insuranceFundVault'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'removeInsuranceFundStake'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'insuranceFundStake'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'insuranceFundVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'userTokenAccount'
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
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'transferProtocolIfShares'
      accounts: [
        {
          name: 'signer'
          isMut: false
          isSigner: true
        },
        {
          name: 'transferConfig'
          isMut: true
          isSigner: false
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'insuranceFundStake'
          isMut: true
          isSigner: false
        },
        {
          name: 'userStats'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: false
          isSigner: true
        },
        {
          name: 'insuranceFundVault'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'marketIndex'
          type: 'u16'
        },
        {
          name: 'shares'
          type: 'u128'
        }
      ]
    },
    {
      name: 'initialize'
      accounts: [
        {
          name: 'admin'
          isMut: true
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'quoteAssetMint'
          isMut: false
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'initializeSpotMarket'
      accounts: [
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'spotMarketMint'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'insuranceFundVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'admin'
          isMut: true
          isSigner: true
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
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
          name: 'optimalUtilization'
          type: 'u32'
        },
        {
          name: 'optimalBorrowRate'
          type: 'u32'
        },
        {
          name: 'maxBorrowRate'
          type: 'u32'
        },
        {
          name: 'oracleSource'
          type: {
            defined: 'OracleSource'
          }
        },
        {
          name: 'initialAssetWeight'
          type: 'u32'
        },
        {
          name: 'maintenanceAssetWeight'
          type: 'u32'
        },
        {
          name: 'initialLiabilityWeight'
          type: 'u32'
        },
        {
          name: 'maintenanceLiabilityWeight'
          type: 'u32'
        },
        {
          name: 'imfFactor'
          type: 'u32'
        },
        {
          name: 'liquidatorFee'
          type: 'u32'
        },
        {
          name: 'activeStatus'
          type: 'bool'
        },
        {
          name: 'name'
          type: {
            array: ['u8', 32]
          }
        }
      ]
    },
    {
      name: 'initializeSerumFulfillmentConfig'
      accounts: [
        {
          name: 'baseSpotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'quoteSpotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'serumProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'serumMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'serumOpenOrders'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'serumFulfillmentConfig'
          isMut: true
          isSigner: false
        },
        {
          name: 'admin'
          isMut: true
          isSigner: true
        },
        {
          name: 'rent'
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
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'updateSerumFulfillmentConfigStatus'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'serumFulfillmentConfig'
          isMut: true
          isSigner: false
        },
        {
          name: 'admin'
          isMut: true
          isSigner: true
        }
      ]
      args: [
        {
          name: 'status'
          type: {
            defined: 'SpotFulfillmentConfigStatus'
          }
        }
      ]
    },
    {
      name: 'initializePhoenixFulfillmentConfig'
      accounts: [
        {
          name: 'baseSpotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'quoteSpotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'phoenixProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'phoenixMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'phoenixFulfillmentConfig'
          isMut: true
          isSigner: false
        },
        {
          name: 'admin'
          isMut: true
          isSigner: true
        },
        {
          name: 'rent'
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
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'phoenixFulfillmentConfigStatus'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'phoenixFulfillmentConfig'
          isMut: true
          isSigner: false
        },
        {
          name: 'admin'
          isMut: true
          isSigner: true
        }
      ]
      args: [
        {
          name: 'status'
          type: {
            defined: 'SpotFulfillmentConfigStatus'
          }
        }
      ]
    },
    {
      name: 'updateSerumVault'
      accounts: [
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'admin'
          isMut: true
          isSigner: true
        },
        {
          name: 'srmVault'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'initializePerpMarket'
      accounts: [
        {
          name: 'admin'
          isMut: true
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'rent'
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
          name: 'marketIndex'
          type: 'u16'
        },
        {
          name: 'ammBaseAssetReserve'
          type: 'u128'
        },
        {
          name: 'ammQuoteAssetReserve'
          type: 'u128'
        },
        {
          name: 'ammPeriodicity'
          type: 'i64'
        },
        {
          name: 'ammPegMultiplier'
          type: 'u128'
        },
        {
          name: 'oracleSource'
          type: {
            defined: 'OracleSource'
          }
        },
        {
          name: 'marginRatioInitial'
          type: 'u32'
        },
        {
          name: 'marginRatioMaintenance'
          type: 'u32'
        },
        {
          name: 'liquidatorFee'
          type: 'u32'
        },
        {
          name: 'activeStatus'
          type: 'bool'
        },
        {
          name: 'name'
          type: {
            array: ['u8', 32]
          }
        }
      ]
    },
    {
      name: 'deleteInitializedPerpMarket'
      accounts: [
        {
          name: 'admin'
          isMut: true
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'marketIndex'
          type: 'u16'
        }
      ]
    },
    {
      name: 'moveAmmPrice'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'baseAssetReserve'
          type: 'u128'
        },
        {
          name: 'quoteAssetReserve'
          type: 'u128'
        },
        {
          name: 'sqrtK'
          type: 'u128'
        }
      ]
    },
    {
      name: 'recenterPerpMarketAmm'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'pegMultiplier'
          type: 'u128'
        },
        {
          name: 'sqrtK'
          type: 'u128'
        }
      ]
    },
    {
      name: 'updatePerpMarketExpiry'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'expiryTs'
          type: 'i64'
        }
      ]
    },
    {
      name: 'settleExpiredMarketPoolsToRevenuePool'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'depositIntoPerpMarketFeePool'
      accounts: [
        {
          name: 'state'
          isMut: true
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'sourceVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'quoteSpotMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'spotMarketVault'
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
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'depositIntoSpotMarketRevenuePool'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'authority'
          isMut: true
          isSigner: true
        },
        {
          name: 'spotMarketVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'userTokenAccount'
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
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'repegAmmCurve'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'admin'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'newPegCandidate'
          type: 'u128'
        }
      ]
    },
    {
      name: 'updatePerpMarketAmmOracleTwap'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'admin'
          isMut: false
          isSigner: true
        }
      ]
      args: []
    },
    {
      name: 'resetPerpMarketAmmOracleTwap'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'admin'
          isMut: false
          isSigner: true
        }
      ]
      args: []
    },
    {
      name: 'updateK'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'sqrtK'
          type: 'u128'
        }
      ]
    },
    {
      name: 'updatePerpMarketMarginRatio'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'marginRatioInitial'
          type: 'u32'
        },
        {
          name: 'marginRatioMaintenance'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updatePerpMarketMaxImbalances'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'unrealizedMaxImbalance'
          type: 'u64'
        },
        {
          name: 'maxRevenueWithdrawPerPeriod'
          type: 'u64'
        },
        {
          name: 'quoteMaxInsurance'
          type: 'u64'
        }
      ]
    },
    {
      name: 'updatePerpMarketLiquidationFee'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'liquidatorFee'
          type: 'u32'
        },
        {
          name: 'ifLiquidationFee'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updateInsuranceFundUnstakingPeriod'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'insuranceFundUnstakingPeriod'
          type: 'i64'
        }
      ]
    },
    {
      name: 'updateSpotMarketLiquidationFee'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'liquidatorFee'
          type: 'u32'
        },
        {
          name: 'ifLiquidationFee'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updateWithdrawGuardThreshold'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'withdrawGuardThreshold'
          type: 'u64'
        }
      ]
    },
    {
      name: 'updateSpotMarketIfFactor'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'spotMarketIndex'
          type: 'u16'
        },
        {
          name: 'userIfFactor'
          type: 'u32'
        },
        {
          name: 'totalIfFactor'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updateSpotMarketRevenueSettlePeriod'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'revenueSettlePeriod'
          type: 'i64'
        }
      ]
    },
    {
      name: 'updateSpotMarketStatus'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'status'
          type: {
            defined: 'MarketStatus'
          }
        }
      ]
    },
    {
      name: 'updateSpotMarketPausedOperations'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'pausedOperations'
          type: 'u8'
        }
      ]
    },
    {
      name: 'updateSpotMarketAssetTier'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'assetTier'
          type: {
            defined: 'AssetTier'
          }
        }
      ]
    },
    {
      name: 'updateSpotMarketMarginWeights'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'initialAssetWeight'
          type: 'u32'
        },
        {
          name: 'maintenanceAssetWeight'
          type: 'u32'
        },
        {
          name: 'initialLiabilityWeight'
          type: 'u32'
        },
        {
          name: 'maintenanceLiabilityWeight'
          type: 'u32'
        },
        {
          name: 'imfFactor'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updateSpotMarketBorrowRate'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'optimalUtilization'
          type: 'u32'
        },
        {
          name: 'optimalBorrowRate'
          type: 'u32'
        },
        {
          name: 'maxBorrowRate'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updateSpotMarketMaxTokenDeposits'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'maxTokenDeposits'
          type: 'u64'
        }
      ]
    },
    {
      name: 'updateSpotMarketScaleInitialAssetWeightStart'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'scaleInitialAssetWeightStart'
          type: 'u64'
        }
      ]
    },
    {
      name: 'updateSpotMarketOracle'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'oracle'
          type: 'publicKey'
        },
        {
          name: 'oracleSource'
          type: {
            defined: 'OracleSource'
          }
        }
      ]
    },
    {
      name: 'updateSpotMarketStepSizeAndTickSize'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'stepSize'
          type: 'u64'
        },
        {
          name: 'tickSize'
          type: 'u64'
        }
      ]
    },
    {
      name: 'updateSpotMarketMinOrderSize'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'orderSize'
          type: 'u64'
        }
      ]
    },
    {
      name: 'updateSpotMarketOrdersEnabled'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'ordersEnabled'
          type: 'bool'
        }
      ]
    },
    {
      name: 'updateSpotMarketName'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'name'
          type: {
            array: ['u8', 32]
          }
        }
      ]
    },
    {
      name: 'updatePerpMarketStatus'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'status'
          type: {
            defined: 'MarketStatus'
          }
        }
      ]
    },
    {
      name: 'updatePerpMarketPausedOperations'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'pausedOperations'
          type: 'u8'
        }
      ]
    },
    {
      name: 'updatePerpMarketContractTier'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'contractTier'
          type: {
            defined: 'ContractTier'
          }
        }
      ]
    },
    {
      name: 'updatePerpMarketImfFactor'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'imfFactor'
          type: 'u32'
        },
        {
          name: 'unrealizedPnlImfFactor'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updatePerpMarketUnrealizedAssetWeight'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'unrealizedInitialAssetWeight'
          type: 'u32'
        },
        {
          name: 'unrealizedMaintenanceAssetWeight'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updatePerpMarketConcentrationCoef'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'concentrationScale'
          type: 'u128'
        }
      ]
    },
    {
      name: 'updatePerpMarketCurveUpdateIntensity'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'curveUpdateIntensity'
          type: 'u8'
        }
      ]
    },
    {
      name: 'updatePerpMarketTargetBaseAssetAmountPerLp'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'targetBaseAssetAmountPerLp'
          type: 'i32'
        }
      ]
    },
    {
      name: 'updatePerpMarketPerLpBase'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'perLpBase'
          type: 'i8'
        }
      ]
    },
    {
      name: 'updateLpCooldownTime'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'lpCooldownTime'
          type: 'u64'
        }
      ]
    },
    {
      name: 'updatePerpFeeStructure'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'feeStructure'
          type: {
            defined: 'FeeStructure'
          }
        }
      ]
    },
    {
      name: 'updateSpotFeeStructure'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'feeStructure'
          type: {
            defined: 'FeeStructure'
          }
        }
      ]
    },
    {
      name: 'updateInitialPctToLiquidate'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'initialPctToLiquidate'
          type: 'u16'
        }
      ]
    },
    {
      name: 'updateLiquidationDuration'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'liquidationDuration'
          type: 'u8'
        }
      ]
    },
    {
      name: 'updateLiquidationMarginBufferRatio'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'liquidationMarginBufferRatio'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updateOracleGuardRails'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'oracleGuardRails'
          type: {
            defined: 'OracleGuardRails'
          }
        }
      ]
    },
    {
      name: 'updateStateSettlementDuration'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'settlementDuration'
          type: 'u16'
        }
      ]
    },
    {
      name: 'updateStateMaxNumberOfSubAccounts'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'maxNumberOfSubAccounts'
          type: 'u16'
        }
      ]
    },
    {
      name: 'updateStateMaxInitializeUserFee'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'maxInitializeUserFee'
          type: 'u16'
        }
      ]
    },
    {
      name: 'updatePerpMarketOracle'
      accounts: [
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        },
        {
          name: 'oracle'
          isMut: false
          isSigner: false
        },
        {
          name: 'admin'
          isMut: false
          isSigner: true
        }
      ]
      args: [
        {
          name: 'oracle'
          type: 'publicKey'
        },
        {
          name: 'oracleSource'
          type: {
            defined: 'OracleSource'
          }
        }
      ]
    },
    {
      name: 'updatePerpMarketBaseSpread'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'baseSpread'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updateAmmJitIntensity'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'ammJitIntensity'
          type: 'u8'
        }
      ]
    },
    {
      name: 'updatePerpMarketMaxSpread'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'maxSpread'
          type: 'u32'
        }
      ]
    },
    {
      name: 'updatePerpMarketStepSizeAndTickSize'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'stepSize'
          type: 'u64'
        },
        {
          name: 'tickSize'
          type: 'u64'
        }
      ]
    },
    {
      name: 'updatePerpMarketName'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'name'
          type: {
            array: ['u8', 32]
          }
        }
      ]
    },
    {
      name: 'updatePerpMarketMinOrderSize'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'orderSize'
          type: 'u64'
        }
      ]
    },
    {
      name: 'updatePerpMarketMaxSlippageRatio'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'maxSlippageRatio'
          type: 'u16'
        }
      ]
    },
    {
      name: 'updatePerpMarketMaxFillReserveFraction'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'maxFillReserveFraction'
          type: 'u16'
        }
      ]
    },
    {
      name: 'updatePerpMarketMaxOpenInterest'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'maxOpenInterest'
          type: 'u128'
        }
      ]
    },
    {
      name: 'updatePerpMarketFeeAdjustment'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'perpMarket'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'feeAdjustment'
          type: 'i16'
        }
      ]
    },
    {
      name: 'updateAdmin'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'admin'
          type: 'publicKey'
        }
      ]
    },
    {
      name: 'updateWhitelistMint'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'whitelistMint'
          type: 'publicKey'
        }
      ]
    },
    {
      name: 'updateDiscountMint'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'discountMint'
          type: 'publicKey'
        }
      ]
    },
    {
      name: 'updateExchangeStatus'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'exchangeStatus'
          type: 'u8'
        }
      ]
    },
    {
      name: 'updatePerpAuctionDuration'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'minPerpAuctionDuration'
          type: 'u8'
        }
      ]
    },
    {
      name: 'updateSpotAuctionDuration'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: true
          isSigner: false
        }
      ]
      args: [
        {
          name: 'defaultSpotAuctionDuration'
          type: 'u8'
        }
      ]
    },
    {
      name: 'adminRemoveInsuranceFundStake'
      accounts: [
        {
          name: 'admin'
          isMut: false
          isSigner: true
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'spotMarket'
          isMut: false
          isSigner: false
        },
        {
          name: 'insuranceFundVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'driftSigner'
          isMut: false
          isSigner: false
        },
        {
          name: 'adminTokenAccount'
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
          name: 'marketIndex'
          type: 'u16'
        },
        {
          name: 'amount'
          type: 'u64'
        }
      ]
    },
    {
      name: 'initializeProtocolIfSharesTransferConfig'
      accounts: [
        {
          name: 'admin'
          isMut: true
          isSigner: true
        },
        {
          name: 'protocolIfSharesTransferConfig'
          isMut: true
          isSigner: false
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'updateProtocolIfSharesTransferConfig'
      accounts: [
        {
          name: 'admin'
          isMut: true
          isSigner: true
        },
        {
          name: 'protocolIfSharesTransferConfig'
          isMut: true
          isSigner: false
        },
        {
          name: 'state'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'whitelistedSigners'
          type: {
            option: {
              array: ['publicKey', 4]
            }
          }
        },
        {
          name: 'maxTransferPerEpoch'
          type: {
            option: 'u128'
          }
        }
      ]
    }
  ]
  accounts: [
    {
      name: 'phoenixV1FulfillmentConfig'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'pubkey'
            type: 'publicKey'
          },
          {
            name: 'phoenixProgramId'
            type: 'publicKey'
          },
          {
            name: 'phoenixLogAuthority'
            type: 'publicKey'
          },
          {
            name: 'phoenixMarket'
            type: 'publicKey'
          },
          {
            name: 'phoenixBaseVault'
            type: 'publicKey'
          },
          {
            name: 'phoenixQuoteVault'
            type: 'publicKey'
          },
          {
            name: 'marketIndex'
            type: 'u16'
          },
          {
            name: 'fulfillmentType'
            type: {
              defined: 'SpotFulfillmentType'
            }
          },
          {
            name: 'status'
            type: {
              defined: 'SpotFulfillmentConfigStatus'
            }
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 4]
            }
          }
        ]
      }
    },
    {
      name: 'serumV3FulfillmentConfig'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'pubkey'
            type: 'publicKey'
          },
          {
            name: 'serumProgramId'
            type: 'publicKey'
          },
          {
            name: 'serumMarket'
            type: 'publicKey'
          },
          {
            name: 'serumRequestQueue'
            type: 'publicKey'
          },
          {
            name: 'serumEventQueue'
            type: 'publicKey'
          },
          {
            name: 'serumBids'
            type: 'publicKey'
          },
          {
            name: 'serumAsks'
            type: 'publicKey'
          },
          {
            name: 'serumBaseVault'
            type: 'publicKey'
          },
          {
            name: 'serumQuoteVault'
            type: 'publicKey'
          },
          {
            name: 'serumOpenOrders'
            type: 'publicKey'
          },
          {
            name: 'serumSignerNonce'
            type: 'u64'
          },
          {
            name: 'marketIndex'
            type: 'u16'
          },
          {
            name: 'fulfillmentType'
            type: {
              defined: 'SpotFulfillmentType'
            }
          },
          {
            name: 'status'
            type: {
              defined: 'SpotFulfillmentConfigStatus'
            }
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 4]
            }
          }
        ]
      }
    },
    {
      name: 'insuranceFundStake'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            type: 'publicKey'
          },
          {
            name: 'ifShares'
            type: 'u128'
          },
          {
            name: 'lastWithdrawRequestShares'
            type: 'u128'
          },
          {
            name: 'ifBase'
            type: 'u128'
          },
          {
            name: 'lastValidTs'
            type: 'i64'
          },
          {
            name: 'lastWithdrawRequestValue'
            type: 'u64'
          },
          {
            name: 'lastWithdrawRequestTs'
            type: 'i64'
          },
          {
            name: 'costBasis'
            type: 'i64'
          },
          {
            name: 'marketIndex'
            type: 'u16'
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 14]
            }
          }
        ]
      }
    },
    {
      name: 'protocolIfSharesTransferConfig'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'whitelistedSigners'
            type: {
              array: ['publicKey', 4]
            }
          },
          {
            name: 'maxTransferPerEpoch'
            type: 'u128'
          },
          {
            name: 'currentEpochTransfer'
            type: 'u128'
          },
          {
            name: 'nextEpochTs'
            type: 'i64'
          },
          {
            name: 'padding'
            type: {
              array: ['u128', 8]
            }
          }
        ]
      }
    },
    {
      name: 'perpMarket'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'pubkey'
            docs: ["The perp market's address. It is a pda of the market index"]
            type: 'publicKey'
          },
          {
            name: 'amm'
            docs: ['The automated market maker']
            type: {
              defined: 'AMM'
            }
          },
          {
            name: 'pnlPool'
            docs: [
              "The market's pnl pool. When users settle negative pnl, the balance increases.",
              'When users settle positive pnl, the balance decreases. Can not go negative.'
            ]
            type: {
              defined: 'PoolBalance'
            }
          },
          {
            name: 'name'
            docs: ['Encoded display name for the perp market e.g. SOL-PERP']
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'insuranceClaim'
            docs: ["The perp market's claim on the insurance fund"]
            type: {
              defined: 'InsuranceClaim'
            }
          },
          {
            name: 'unrealizedPnlMaxImbalance'
            docs: [
              'The max pnl imbalance before positive pnl asset weight is discounted',
              "pnl imbalance is the difference between long and short pnl. When it's greater than 0,",
              'the amm has negative pnl and the initial asset weight for positive pnl is discounted',
              'precision = QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'expiryTs'
            docs: [
              'The ts when the market will be expired. Only set if market is in reduce only mode'
            ]
            type: 'i64'
          },
          {
            name: 'expiryPrice'
            docs: [
              'The price at which positions will be settled. Only set if market is expired',
              'precision = PRICE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'nextFillRecordId'
            docs: [
              'Every trade has a fill record id. This is the next id to be used'
            ]
            type: 'u64'
          },
          {
            name: 'nextFundingRateRecordId'
            docs: [
              'Every funding rate update has a record id. This is the next id to be used'
            ]
            type: 'u64'
          },
          {
            name: 'nextCurveRecordId'
            docs: [
              'Every amm k updated has a record id. This is the next id to be used'
            ]
            type: 'u64'
          },
          {
            name: 'imfFactor'
            docs: [
              'The initial margin fraction factor. Used to increase margin ratio for large positions',
              'precision: MARGIN_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'unrealizedPnlImfFactor'
            docs: [
              'The imf factor for unrealized pnl. Used to discount asset weight for large positive pnl',
              'precision: MARGIN_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'liquidatorFee'
            docs: [
              'The fee the liquidator is paid for taking over perp position',
              'precision: LIQUIDATOR_FEE_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'ifLiquidationFee'
            docs: [
              'The fee the insurance fund receives from liquidation',
              'precision: LIQUIDATOR_FEE_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'marginRatioInitial'
            docs: [
              'The margin ratio which determines how much collateral is required to open a position',
              'e.g. margin ratio of .1 means a user must have $100 of total collateral to open a $1000 position',
              'precision: MARGIN_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'marginRatioMaintenance'
            docs: [
              'The margin ratio which determines when a user will be liquidated',
              'e.g. margin ratio of .05 means a user must have $50 of total collateral to maintain a $1000 position',
              'else they will be liquidated',
              'precision: MARGIN_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'unrealizedPnlInitialAssetWeight'
            docs: [
              'The initial asset weight for positive pnl. Negative pnl always has an asset weight of 1',
              'precision: SPOT_WEIGHT_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'unrealizedPnlMaintenanceAssetWeight'
            docs: [
              'The maintenance asset weight for positive pnl. Negative pnl always has an asset weight of 1',
              'precision: SPOT_WEIGHT_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'numberOfUsersWithBase'
            docs: ['number of users in a position (base)']
            type: 'u32'
          },
          {
            name: 'numberOfUsers'
            docs: ['number of users in a position (pnl) or pnl (quote)']
            type: 'u32'
          },
          {
            name: 'marketIndex'
            type: 'u16'
          },
          {
            name: 'status'
            docs: [
              'Whether a market is active, reduce only, expired, etc',
              'Affects whether users can open/close positions'
            ]
            type: {
              defined: 'MarketStatus'
            }
          },
          {
            name: 'contractType'
            docs: ['Currently only Perpetual markets are supported']
            type: {
              defined: 'ContractType'
            }
          },
          {
            name: 'contractTier'
            docs: [
              'The contract tier determines how much insurance a market can receive, with more speculative markets receiving less insurance',
              'It also influences the order perp markets can be liquidated, with less speculative markets being liquidated first'
            ]
            type: {
              defined: 'ContractTier'
            }
          },
          {
            name: 'pausedOperations'
            type: 'u8'
          },
          {
            name: 'quoteSpotMarketIndex'
            docs: ['The spot market that pnl is settled in']
            type: 'u16'
          },
          {
            name: 'feeAdjustment'
            docs: [
              'Between -100 and 100, represents what % to increase/decrease the fee by',
              'E.g. if this is -50 and the fee is 5bps, the new fee will be 2.5bps',
              'if this is 50 and the fee is 5bps, the new fee will be 7.5bps'
            ]
            type: 'i16'
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 46]
            }
          }
        ]
      }
    },
    {
      name: 'spotMarket'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'pubkey'
            docs: [
              'The address of the spot market. It is a pda of the market index'
            ]
            type: 'publicKey'
          },
          {
            name: 'oracle'
            docs: ['The oracle used to price the markets deposits/borrows']
            type: 'publicKey'
          },
          {
            name: 'mint'
            docs: ['The token mint of the market']
            type: 'publicKey'
          },
          {
            name: 'vault'
            docs: [
              "The vault used to store the market's deposits",
              'The amount in the vault should be equal to or greater than deposits - borrows'
            ]
            type: 'publicKey'
          },
          {
            name: 'name'
            docs: ['The encoded display name for the market e.g. SOL']
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'historicalOracleData'
            type: {
              defined: 'HistoricalOracleData'
            }
          },
          {
            name: 'historicalIndexData'
            type: {
              defined: 'HistoricalIndexData'
            }
          },
          {
            name: 'revenuePool'
            docs: [
              'Revenue the protocol has collected in this markets token',
              'e.g. for SOL-PERP, funds can be settled in usdc and will flow into the USDC revenue pool'
            ]
            type: {
              defined: 'PoolBalance'
            }
          },
          {
            name: 'spotFeePool'
            docs: [
              'The fees collected from swaps between this market and the quote market',
              'Is settled to the quote markets revenue pool'
            ]
            type: {
              defined: 'PoolBalance'
            }
          },
          {
            name: 'insuranceFund'
            docs: [
              'Details on the insurance fund covering bankruptcies in this markets token',
              'Covers bankruptcies for borrows with this markets token and perps settling in this markets token'
            ]
            type: {
              defined: 'InsuranceFund'
            }
          },
          {
            name: 'totalSpotFee'
            docs: [
              'The total spot fees collected for this market',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'depositBalance'
            docs: [
              'The sum of the scaled balances for deposits across users and pool balances',
              'To convert to the deposit token amount, multiply by the cumulative deposit interest',
              'precision: SPOT_BALANCE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'borrowBalance'
            docs: [
              'The sum of the scaled balances for borrows across users and pool balances',
              'To convert to the borrow token amount, multiply by the cumulative borrow interest',
              'precision: SPOT_BALANCE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'cumulativeDepositInterest'
            docs: [
              'The cumulative interest earned by depositors',
              'Used to calculate the deposit token amount from the deposit balance',
              'precision: SPOT_CUMULATIVE_INTEREST_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'cumulativeBorrowInterest'
            docs: [
              'The cumulative interest earned by borrowers',
              'Used to calculate the borrow token amount from the borrow balance',
              'precision: SPOT_CUMULATIVE_INTEREST_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'totalSocialLoss'
            docs: [
              "The total socialized loss from borrows, in the mint's token",
              'precision: token mint precision'
            ]
            type: 'u128'
          },
          {
            name: 'totalQuoteSocialLoss'
            docs: [
              "The total socialized loss from borrows, in the quote market's token",
              'preicision: QUOTE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'withdrawGuardThreshold'
            docs: [
              'no withdraw limits/guards when deposits below this threshold',
              'precision: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'maxTokenDeposits'
            docs: [
              'The max amount of token deposits in this market',
              '0 if there is no limit',
              'precision: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'depositTokenTwap'
            docs: [
              '24hr average of deposit token amount',
              'precision: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'borrowTokenTwap'
            docs: [
              '24hr average of borrow token amount',
              'precision: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'utilizationTwap'
            docs: [
              '24hr average of utilization',
              'which is borrow amount over token amount',
              'precision: SPOT_UTILIZATION_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'lastInterestTs'
            docs: [
              'Last time the cumulative deposit and borrow interest was updated'
            ]
            type: 'u64'
          },
          {
            name: 'lastTwapTs'
            docs: [
              'Last time the deposit/borrow/utilization averages were updated'
            ]
            type: 'u64'
          },
          {
            name: 'expiryTs'
            docs: [
              'The time the market is set to expire. Only set if market is in reduce only mode'
            ]
            type: 'i64'
          },
          {
            name: 'orderStepSize'
            docs: [
              'Spot orders must be a multiple of the step size',
              'precision: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'orderTickSize'
            docs: [
              'Spot orders must be a multiple of the tick size',
              'precision: PRICE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'minOrderSize'
            docs: ['The minimum order size', 'precision: token mint precision']
            type: 'u64'
          },
          {
            name: 'maxPositionSize'
            docs: [
              'The maximum spot position size',
              'if the limit is 0, there is no limit',
              'precision: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'nextFillRecordId'
            docs: [
              'Every spot trade has a fill record id. This is the next id to use'
            ]
            type: 'u64'
          },
          {
            name: 'nextDepositRecordId'
            docs: [
              'Every deposit has a deposit record id. This is the next id to use'
            ]
            type: 'u64'
          },
          {
            name: 'initialAssetWeight'
            docs: [
              'The initial asset weight used to calculate a deposits contribution to a users initial total collateral',
              'e.g. if the asset weight is .8, $100 of deposits contributes $80 to the users initial total collateral',
              'precision: SPOT_WEIGHT_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'maintenanceAssetWeight'
            docs: [
              'The maintenance asset weight used to calculate a deposits contribution to a users maintenance total collateral',
              'e.g. if the asset weight is .9, $100 of deposits contributes $90 to the users maintenance total collateral',
              'precision: SPOT_WEIGHT_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'initialLiabilityWeight'
            docs: [
              'The initial liability weight used to calculate a borrows contribution to a users initial margin requirement',
              'e.g. if the liability weight is .9, $100 of borrows contributes $90 to the users initial margin requirement',
              'precision: SPOT_WEIGHT_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'maintenanceLiabilityWeight'
            docs: [
              'The maintenance liability weight used to calculate a borrows contribution to a users maintenance margin requirement',
              'e.g. if the liability weight is .8, $100 of borrows contributes $80 to the users maintenance margin requirement',
              'precision: SPOT_WEIGHT_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'imfFactor'
            docs: [
              'The initial margin fraction factor. Used to increase liability weight/decrease asset weight for large positions',
              'precision: MARGIN_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'liquidatorFee'
            docs: [
              'The fee the liquidator is paid for taking over borrow/deposit',
              'precision: LIQUIDATOR_FEE_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'ifLiquidationFee'
            docs: [
              'The fee the insurance fund receives from liquidation',
              'precision: LIQUIDATOR_FEE_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'optimalUtilization'
            docs: [
              'The optimal utilization rate for this market.',
              'Used to determine the markets borrow rate',
              'precision: SPOT_UTILIZATION_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'optimalBorrowRate'
            docs: [
              'The borrow rate for this market when the market has optimal utilization',
              'precision: SPOT_RATE_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'maxBorrowRate'
            docs: [
              'The borrow rate for this market when the market has 1000 utilization',
              'precision: SPOT_RATE_PRECISION'
            ]
            type: 'u32'
          },
          {
            name: 'decimals'
            docs: [
              "The market's token mint's decimals. To from decimals to a precision, 10^decimals"
            ]
            type: 'u32'
          },
          {
            name: 'marketIndex'
            type: 'u16'
          },
          {
            name: 'ordersEnabled'
            docs: ['Whether or not spot trading is enabled']
            type: 'bool'
          },
          {
            name: 'oracleSource'
            type: {
              defined: 'OracleSource'
            }
          },
          {
            name: 'status'
            type: {
              defined: 'MarketStatus'
            }
          },
          {
            name: 'assetTier'
            docs: [
              'The asset tier affects how a deposit can be used as collateral and the priority for a borrow being liquidated'
            ]
            type: {
              defined: 'AssetTier'
            }
          },
          {
            name: 'pausedOperations'
            type: 'u8'
          },
          {
            name: 'padding1'
            type: {
              array: ['u8', 5]
            }
          },
          {
            name: 'flashLoanAmount'
            docs: [
              'For swaps, the amount of token loaned out in the begin_swap ix',
              'precision: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'flashLoanInitialTokenAmount'
            docs: [
              'For swaps, the amount in the users token account in the begin_swap ix',
              'Used to calculate how much of the token left the system in end_swap ix',
              'precision: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'totalSwapFee'
            docs: [
              'The total fees received from swaps',
              'precision: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'scaleInitialAssetWeightStart'
            docs: [
              'When to begin scaling down the initial asset weight',
              'disabled when 0',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 48]
            }
          }
        ]
      }
    },
    {
      name: 'state'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'admin'
            type: 'publicKey'
          },
          {
            name: 'whitelistMint'
            type: 'publicKey'
          },
          {
            name: 'discountMint'
            type: 'publicKey'
          },
          {
            name: 'signer'
            type: 'publicKey'
          },
          {
            name: 'srmVault'
            type: 'publicKey'
          },
          {
            name: 'perpFeeStructure'
            type: {
              defined: 'FeeStructure'
            }
          },
          {
            name: 'spotFeeStructure'
            type: {
              defined: 'FeeStructure'
            }
          },
          {
            name: 'oracleGuardRails'
            type: {
              defined: 'OracleGuardRails'
            }
          },
          {
            name: 'numberOfAuthorities'
            type: 'u64'
          },
          {
            name: 'numberOfSubAccounts'
            type: 'u64'
          },
          {
            name: 'lpCooldownTime'
            type: 'u64'
          },
          {
            name: 'liquidationMarginBufferRatio'
            type: 'u32'
          },
          {
            name: 'settlementDuration'
            type: 'u16'
          },
          {
            name: 'numberOfMarkets'
            type: 'u16'
          },
          {
            name: 'numberOfSpotMarkets'
            type: 'u16'
          },
          {
            name: 'signerNonce'
            type: 'u8'
          },
          {
            name: 'minPerpAuctionDuration'
            type: 'u8'
          },
          {
            name: 'defaultMarketOrderTimeInForce'
            type: 'u8'
          },
          {
            name: 'defaultSpotAuctionDuration'
            type: 'u8'
          },
          {
            name: 'exchangeStatus'
            type: 'u8'
          },
          {
            name: 'liquidationDuration'
            type: 'u8'
          },
          {
            name: 'initialPctToLiquidate'
            type: 'u16'
          },
          {
            name: 'maxNumberOfSubAccounts'
            type: 'u16'
          },
          {
            name: 'maxInitializeUserFee'
            type: 'u16'
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 10]
            }
          }
        ]
      }
    },
    {
      name: 'user'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            docs: ['The owner/authority of the account']
            type: 'publicKey'
          },
          {
            name: 'delegate'
            docs: [
              "An addresses that can control the account on the authority's behalf. Has limited power, cant withdraw"
            ]
            type: 'publicKey'
          },
          {
            name: 'name'
            docs: ['Encoded display name e.g. "toly"']
            type: {
              array: ['u8', 32]
            }
          },
          {
            name: 'spotPositions'
            docs: ["The user's spot positions"]
            type: {
              array: [
                {
                  defined: 'SpotPosition'
                },
                8
              ]
            }
          },
          {
            name: 'perpPositions'
            docs: ["The user's perp positions"]
            type: {
              array: [
                {
                  defined: 'PerpPosition'
                },
                8
              ]
            }
          },
          {
            name: 'orders'
            docs: ["The user's orders"]
            type: {
              array: [
                {
                  defined: 'Order'
                },
                32
              ]
            }
          },
          {
            name: 'lastAddPerpLpSharesTs'
            docs: ['The last time the user added perp lp positions']
            type: 'i64'
          },
          {
            name: 'totalDeposits'
            docs: [
              'The total values of deposits the user has made',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'totalWithdraws'
            docs: [
              'The total values of withdrawals the user has made',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'totalSocialLoss'
            docs: [
              'The total socialized loss the users has incurred upon the protocol',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'settledPerpPnl'
            docs: [
              'Fees (taker fees, maker rebate, referrer reward, filler reward) and pnl for perps',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'cumulativeSpotFees'
            docs: [
              'Fees (taker fees, maker rebate, filler reward) for spot',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'cumulativePerpFunding'
            docs: [
              'Cumulative funding paid/received for perps',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'liquidationMarginFreed'
            docs: [
              'The amount of margin freed during liquidation. Used to force the liquidation to occur over a period of time',
              'Defaults to zero when not being liquidated',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'lastActiveSlot'
            docs: [
              'The last slot a user was active. Used to determine if a user is idle'
            ]
            type: 'u64'
          },
          {
            name: 'nextOrderId'
            docs: [
              'Every user order has an order id. This is the next order id to be used'
            ]
            type: 'u32'
          },
          {
            name: 'maxMarginRatio'
            docs: ['Custom max initial margin ratio for the user']
            type: 'u32'
          },
          {
            name: 'nextLiquidationId'
            docs: ['The next liquidation id to be used for user']
            type: 'u16'
          },
          {
            name: 'subAccountId'
            docs: ['The sub account id for this user']
            type: 'u16'
          },
          {
            name: 'status'
            docs: ['Whether the user is active, being liquidated or bankrupt']
            type: 'u8'
          },
          {
            name: 'isMarginTradingEnabled'
            docs: ['Whether the user has enabled margin trading']
            type: 'bool'
          },
          {
            name: 'idle'
            docs: [
              "User is idle if they haven't interacted with the protocol in 1 week and they have no orders, perp positions or borrows",
              'Off-chain keeper bots can ignore users that are idle'
            ]
            type: 'bool'
          },
          {
            name: 'openOrders'
            docs: ['number of open orders']
            type: 'u8'
          },
          {
            name: 'hasOpenOrder'
            docs: ['Whether or not user has open order']
            type: 'bool'
          },
          {
            name: 'openAuctions'
            docs: ['number of open orders with auction']
            type: 'u8'
          },
          {
            name: 'hasOpenAuction'
            docs: ['Whether or not user has open order with auction']
            type: 'bool'
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 21]
            }
          }
        ]
      }
    },
    {
      name: 'userStats'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            docs: ['The authority for all of a users sub accounts']
            type: 'publicKey'
          },
          {
            name: 'referrer'
            docs: ['The address that referred this user']
            type: 'publicKey'
          },
          {
            name: 'fees'
            docs: ['Stats on the fees paid by the user']
            type: {
              defined: 'UserFees'
            }
          },
          {
            name: 'nextEpochTs'
            docs: [
              'The timestamp of the next epoch',
              'Epoch is used to limit referrer rewards earned in single epoch'
            ]
            type: 'i64'
          },
          {
            name: 'makerVolume30d'
            docs: [
              'Rolling 30day maker volume for user',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'takerVolume30d'
            docs: [
              'Rolling 30day taker volume for user',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'fillerVolume30d'
            docs: [
              'Rolling 30day filler volume for user',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'lastMakerVolume30dTs'
            docs: ['last time the maker volume was updated']
            type: 'i64'
          },
          {
            name: 'lastTakerVolume30dTs'
            docs: ['last time the taker volume was updated']
            type: 'i64'
          },
          {
            name: 'lastFillerVolume30dTs'
            docs: ['last time the filler volume was updated']
            type: 'i64'
          },
          {
            name: 'ifStakedQuoteAssetAmount'
            docs: ['The amount of tokens staked in the quote spot markets if']
            type: 'u64'
          },
          {
            name: 'numberOfSubAccounts'
            docs: ['The current number of sub accounts']
            type: 'u16'
          },
          {
            name: 'numberOfSubAccountsCreated'
            docs: [
              'The number of sub accounts created. Can be greater than the number of sub accounts if user',
              'has deleted sub accounts'
            ]
            type: 'u16'
          },
          {
            name: 'isReferrer'
            docs: [
              'Whether the user is a referrer. Sub account 0 can not be deleted if user is a referrer'
            ]
            type: 'bool'
          },
          {
            name: 'disableUpdatePerpBidAskTwap'
            type: 'bool'
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 50]
            }
          }
        ]
      }
    },
    {
      name: 'referrerName'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'authority'
            type: 'publicKey'
          },
          {
            name: 'user'
            type: 'publicKey'
          },
          {
            name: 'userStats'
            type: 'publicKey'
          },
          {
            name: 'name'
            type: {
              array: ['u8', 32]
            }
          }
        ]
      }
    }
  ]
  types: [
    {
      name: 'LiquidatePerpRecord'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'marketIndex'
            type: 'u16'
          },
          {
            name: 'oraclePrice'
            type: 'i64'
          },
          {
            name: 'baseAssetAmount'
            type: 'i64'
          },
          {
            name: 'quoteAssetAmount'
            type: 'i64'
          },
          {
            name: 'lpShares'
            docs: ['precision: AMM_RESERVE_PRECISION']
            type: 'u64'
          },
          {
            name: 'fillRecordId'
            type: 'u64'
          },
          {
            name: 'userOrderId'
            type: 'u32'
          },
          {
            name: 'liquidatorOrderId'
            type: 'u32'
          },
          {
            name: 'liquidatorFee'
            docs: ['precision: QUOTE_PRECISION']
            type: 'u64'
          },
          {
            name: 'ifFee'
            docs: ['precision: QUOTE_PRECISION']
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'LiquidateSpotRecord'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'assetMarketIndex'
            type: 'u16'
          },
          {
            name: 'assetPrice'
            type: 'i64'
          },
          {
            name: 'assetTransfer'
            type: 'u128'
          },
          {
            name: 'liabilityMarketIndex'
            type: 'u16'
          },
          {
            name: 'liabilityPrice'
            type: 'i64'
          },
          {
            name: 'liabilityTransfer'
            docs: ['precision: token mint precision']
            type: 'u128'
          },
          {
            name: 'ifFee'
            docs: ['precision: token mint precision']
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'LiquidateBorrowForPerpPnlRecord'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'perpMarketIndex'
            type: 'u16'
          },
          {
            name: 'marketOraclePrice'
            type: 'i64'
          },
          {
            name: 'pnlTransfer'
            type: 'u128'
          },
          {
            name: 'liabilityMarketIndex'
            type: 'u16'
          },
          {
            name: 'liabilityPrice'
            type: 'i64'
          },
          {
            name: 'liabilityTransfer'
            type: 'u128'
          }
        ]
      }
    },
    {
      name: 'LiquidatePerpPnlForDepositRecord'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'perpMarketIndex'
            type: 'u16'
          },
          {
            name: 'marketOraclePrice'
            type: 'i64'
          },
          {
            name: 'pnlTransfer'
            type: 'u128'
          },
          {
            name: 'assetMarketIndex'
            type: 'u16'
          },
          {
            name: 'assetPrice'
            type: 'i64'
          },
          {
            name: 'assetTransfer'
            type: 'u128'
          }
        ]
      }
    },
    {
      name: 'PerpBankruptcyRecord'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'marketIndex'
            type: 'u16'
          },
          {
            name: 'pnl'
            type: 'i128'
          },
          {
            name: 'ifPayment'
            type: 'u128'
          },
          {
            name: 'clawbackUser'
            type: {
              option: 'publicKey'
            }
          },
          {
            name: 'clawbackUserPayment'
            type: {
              option: 'u128'
            }
          },
          {
            name: 'cumulativeFundingRateDelta'
            type: 'i128'
          }
        ]
      }
    },
    {
      name: 'SpotBankruptcyRecord'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'marketIndex'
            type: 'u16'
          },
          {
            name: 'borrowAmount'
            type: 'u128'
          },
          {
            name: 'ifPayment'
            type: 'u128'
          },
          {
            name: 'cumulativeDepositInterestDelta'
            type: 'u128'
          }
        ]
      }
    },
    {
      name: 'MarketIdentifier'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'marketType'
            type: {
              defined: 'MarketType'
            }
          },
          {
            name: 'marketIndex'
            type: 'u16'
          }
        ]
      }
    },
    {
      name: 'HistoricalOracleData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'lastOraclePrice'
            docs: ['precision: PRICE_PRECISION']
            type: 'i64'
          },
          {
            name: 'lastOracleConf'
            docs: ['precision: PRICE_PRECISION']
            type: 'u64'
          },
          {
            name: 'lastOracleDelay'
            docs: ['number of slots since last update']
            type: 'i64'
          },
          {
            name: 'lastOraclePriceTwap'
            docs: ['precision: PRICE_PRECISION']
            type: 'i64'
          },
          {
            name: 'lastOraclePriceTwap5min'
            docs: ['precision: PRICE_PRECISION']
            type: 'i64'
          },
          {
            name: 'lastOraclePriceTwapTs'
            docs: ['unix_timestamp of last snapshot']
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'HistoricalIndexData'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'lastIndexBidPrice'
            docs: ['precision: PRICE_PRECISION']
            type: 'u64'
          },
          {
            name: 'lastIndexAskPrice'
            docs: ['precision: PRICE_PRECISION']
            type: 'u64'
          },
          {
            name: 'lastIndexPriceTwap'
            docs: ['precision: PRICE_PRECISION']
            type: 'u64'
          },
          {
            name: 'lastIndexPriceTwap5min'
            docs: ['precision: PRICE_PRECISION']
            type: 'u64'
          },
          {
            name: 'lastIndexPriceTwapTs'
            docs: ['unix_timestamp of last snapshot']
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'OrderParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'orderType'
            type: {
              defined: 'OrderType'
            }
          },
          {
            name: 'marketType'
            type: {
              defined: 'MarketType'
            }
          },
          {
            name: 'direction'
            type: {
              defined: 'PositionDirection'
            }
          },
          {
            name: 'userOrderId'
            type: 'u8'
          },
          {
            name: 'baseAssetAmount'
            type: 'u64'
          },
          {
            name: 'price'
            type: 'u64'
          },
          {
            name: 'marketIndex'
            type: 'u16'
          },
          {
            name: 'reduceOnly'
            type: 'bool'
          },
          {
            name: 'postOnly'
            type: {
              defined: 'PostOnlyParam'
            }
          },
          {
            name: 'immediateOrCancel'
            type: 'bool'
          },
          {
            name: 'maxTs'
            type: {
              option: 'i64'
            }
          },
          {
            name: 'triggerPrice'
            type: {
              option: 'u64'
            }
          },
          {
            name: 'triggerCondition'
            type: {
              defined: 'OrderTriggerCondition'
            }
          },
          {
            name: 'oraclePriceOffset'
            type: {
              option: 'i32'
            }
          },
          {
            name: 'auctionDuration'
            type: {
              option: 'u8'
            }
          },
          {
            name: 'auctionStartPrice'
            type: {
              option: 'i64'
            }
          },
          {
            name: 'auctionEndPrice'
            type: {
              option: 'i64'
            }
          }
        ]
      }
    },
    {
      name: 'ModifyOrderParams'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'direction'
            type: {
              option: {
                defined: 'PositionDirection'
              }
            }
          },
          {
            name: 'baseAssetAmount'
            type: {
              option: 'u64'
            }
          },
          {
            name: 'price'
            type: {
              option: 'u64'
            }
          },
          {
            name: 'reduceOnly'
            type: {
              option: 'bool'
            }
          },
          {
            name: 'postOnly'
            type: {
              option: {
                defined: 'PostOnlyParam'
              }
            }
          },
          {
            name: 'immediateOrCancel'
            type: {
              option: 'bool'
            }
          },
          {
            name: 'maxTs'
            type: {
              option: 'i64'
            }
          },
          {
            name: 'triggerPrice'
            type: {
              option: 'u64'
            }
          },
          {
            name: 'triggerCondition'
            type: {
              option: {
                defined: 'OrderTriggerCondition'
              }
            }
          },
          {
            name: 'oraclePriceOffset'
            type: {
              option: 'i32'
            }
          },
          {
            name: 'auctionDuration'
            type: {
              option: 'u8'
            }
          },
          {
            name: 'auctionStartPrice'
            type: {
              option: 'i64'
            }
          },
          {
            name: 'auctionEndPrice'
            type: {
              option: 'i64'
            }
          },
          {
            name: 'policy'
            type: {
              option: {
                defined: 'ModifyOrderPolicy'
              }
            }
          }
        ]
      }
    },
    {
      name: 'InsuranceClaim'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'revenueWithdrawSinceLastSettle'
            docs: [
              'The amount of revenue last settled',
              'Positive if funds left the perp market,',
              'negative if funds were pulled into the perp market',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'maxRevenueWithdrawPerPeriod'
            docs: [
              'The max amount of revenue that can be withdrawn per period',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'quoteMaxInsurance'
            docs: [
              'The max amount of insurance that perp market can use to resolve bankruptcy and pnl deficits',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'quoteSettledInsurance'
            docs: [
              'The amount of insurance that has been used to resolve bankruptcy and pnl deficits',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'lastRevenueWithdrawTs'
            docs: ['The last time revenue was settled in/out of market']
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'PoolBalance'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'scaledBalance'
            docs: [
              "To get the pool's token amount, you must multiply the scaled balance by the market's cumulative",
              'deposit interest',
              'precision: SPOT_BALANCE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'marketIndex'
            docs: ['The spot market the pool is for']
            type: 'u16'
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 6]
            }
          }
        ]
      }
    },
    {
      name: 'AMM'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'oracle'
            docs: ['oracle price data public key']
            type: 'publicKey'
          },
          {
            name: 'historicalOracleData'
            docs: ['stores historically witnessed oracle data']
            type: {
              defined: 'HistoricalOracleData'
            }
          },
          {
            name: 'baseAssetAmountPerLp'
            docs: [
              'accumulated base asset amount since inception per lp share',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'quoteAssetAmountPerLp'
            docs: [
              'accumulated quote asset amount since inception per lp share',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'feePool'
            docs: [
              'partition of fees from perp market trading moved from pnl settlements'
            ]
            type: {
              defined: 'PoolBalance'
            }
          },
          {
            name: 'baseAssetReserve'
            docs: [
              '`x` reserves for constant product mm formula (x * y = k)',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'quoteAssetReserve'
            docs: [
              '`y` reserves for constant product mm formula (x * y = k)',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'concentrationCoef'
            docs: [
              'determines how close the min/max base asset reserve sit vs base reserves',
              'allow for decreasing slippage without increasing liquidity and v.v.',
              'precision: PERCENTAGE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'minBaseAssetReserve'
            docs: [
              'minimum base_asset_reserve allowed before AMM is unavailable',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'maxBaseAssetReserve'
            docs: [
              'maximum base_asset_reserve allowed before AMM is unavailable',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'sqrtK'
            docs: [
              '`sqrt(k)` in constant product mm formula (x * y = k). stored to avoid drift caused by integer math issues',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'pegMultiplier'
            docs: [
              'normalizing numerical factor for y, its use offers lowest slippage in cp-curve when market is balanced',
              'precision: PEG_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'terminalQuoteAssetReserve'
            docs: [
              'y when market is balanced. stored to save computation',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'baseAssetAmountLong'
            docs: [
              'always non-negative. tracks number of total longs in market (regardless of counterparty)',
              'precision: BASE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'baseAssetAmountShort'
            docs: [
              'always non-positive. tracks number of total shorts in market (regardless of counterparty)',
              'precision: BASE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'baseAssetAmountWithAmm'
            docs: [
              'tracks net position (longs-shorts) in market with AMM as counterparty',
              'precision: BASE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'baseAssetAmountWithUnsettledLp'
            docs: [
              'tracks net position (longs-shorts) in market with LPs as counterparty',
              'precision: BASE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'maxOpenInterest'
            docs: [
              'max allowed open interest, blocks trades that breach this value',
              'precision: BASE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'quoteAssetAmount'
            docs: [
              "sum of all user's perp quote_asset_amount in market",
              'precision: QUOTE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'quoteEntryAmountLong'
            docs: [
              "sum of all long user's quote_entry_amount in market",
              'precision: QUOTE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'quoteEntryAmountShort'
            docs: [
              "sum of all short user's quote_entry_amount in market",
              'precision: QUOTE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'quoteBreakEvenAmountLong'
            docs: [
              "sum of all long user's quote_break_even_amount in market",
              'precision: QUOTE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'quoteBreakEvenAmountShort'
            docs: [
              "sum of all short user's quote_break_even_amount in market",
              'precision: QUOTE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'userLpShares'
            docs: [
              'total user lp shares of sqrt_k (protocol owned liquidity = sqrt_k - last_funding_rate)',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'lastFundingRate'
            docs: [
              'last funding rate in this perp market (unit is quote per base)',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'lastFundingRateLong'
            docs: [
              'last funding rate for longs in this perp market (unit is quote per base)',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'lastFundingRateShort'
            docs: [
              'last funding rate for shorts in this perp market (unit is quote per base)',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'last24hAvgFundingRate'
            docs: [
              'estimate of last 24h of funding rate perp market (unit is quote per base)',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'totalFee'
            docs: [
              'total fees collected by this perp market',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'totalMmFee'
            docs: [
              "total fees collected by the vAMM's bid/ask spread",
              'precision: QUOTE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'totalExchangeFee'
            docs: [
              'total fees collected by exchange fee schedule',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'totalFeeMinusDistributions'
            docs: [
              'total fees minus any recognized upnl and pool withdraws',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i128'
          },
          {
            name: 'totalFeeWithdrawn'
            docs: [
              'sum of all fees from fee pool withdrawn to revenue pool',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'totalLiquidationFee'
            docs: [
              'all fees collected by market for liquidations',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'cumulativeFundingRateLong'
            docs: [
              'accumulated funding rate for longs since inception in market'
            ]
            type: 'i128'
          },
          {
            name: 'cumulativeFundingRateShort'
            docs: [
              'accumulated funding rate for shorts since inception in market'
            ]
            type: 'i128'
          },
          {
            name: 'totalSocialLoss'
            docs: [
              'accumulated social loss paid by users since inception in market'
            ]
            type: 'u128'
          },
          {
            name: 'askBaseAssetReserve'
            docs: [
              'transformed base_asset_reserve for users going long',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'askQuoteAssetReserve'
            docs: [
              'transformed quote_asset_reserve for users going long',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'bidBaseAssetReserve'
            docs: [
              'transformed base_asset_reserve for users going short',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'bidQuoteAssetReserve'
            docs: [
              'transformed quote_asset_reserve for users going short',
              'precision: AMM_RESERVE_PRECISION'
            ]
            type: 'u128'
          },
          {
            name: 'lastOracleNormalisedPrice'
            docs: [
              'the last seen oracle price partially shrunk toward the amm reserve price',
              'precision: PRICE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'lastOracleReservePriceSpreadPct'
            docs: [
              'the gap between the oracle price and the reserve price = y * peg_multiplier / x'
            ]
            type: 'i64'
          },
          {
            name: 'lastBidPriceTwap'
            docs: [
              'average estimate of bid price over funding_period',
              'precision: PRICE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'lastAskPriceTwap'
            docs: [
              'average estimate of ask price over funding_period',
              'precision: PRICE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'lastMarkPriceTwap'
            docs: [
              'average estimate of (bid+ask)/2 price over funding_period',
              'precision: PRICE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'lastMarkPriceTwap5min'
            docs: ['average estimate of (bid+ask)/2 price over FIVE_MINUTES']
            type: 'u64'
          },
          {
            name: 'lastUpdateSlot'
            docs: ['the last blockchain slot the amm was updated']
            type: 'u64'
          },
          {
            name: 'lastOracleConfPct'
            docs: [
              'the pct size of the oracle confidence interval',
              'precision: PERCENTAGE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'netRevenueSinceLastFunding'
            docs: [
              'the total_fee_minus_distribution change since the last funding update',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'lastFundingRateTs'
            docs: ['the last funding rate update unix_timestamp']
            type: 'i64'
          },
          {
            name: 'fundingPeriod'
            docs: ['the peridocity of the funding rate updates']
            type: 'i64'
          },
          {
            name: 'orderStepSize'
            docs: [
              'the base step size (increment) of orders',
              'precision: BASE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'orderTickSize'
            docs: [
              'the price tick size of orders',
              'precision: PRICE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'minOrderSize'
            docs: [
              'the minimum base size of an order',
              'precision: BASE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'maxPositionSize'
            docs: [
              'the max base size a single user can have',
              'precision: BASE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'volume24h'
            docs: ['estimated total of volume in market', 'QUOTE_PRECISION']
            type: 'u64'
          },
          {
            name: 'longIntensityVolume'
            docs: ['the volume intensity of long fills against AMM']
            type: 'u64'
          },
          {
            name: 'shortIntensityVolume'
            docs: ['the volume intensity of short fills against AMM']
            type: 'u64'
          },
          {
            name: 'lastTradeTs'
            docs: [
              'the blockchain unix timestamp at the time of the last trade'
            ]
            type: 'i64'
          },
          {
            name: 'markStd'
            docs: [
              'estimate of standard deviation of the fill (mark) prices',
              'precision: PRICE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'oracleStd'
            docs: [
              'estimate of standard deviation of the oracle price at each update',
              'precision: PRICE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'lastMarkPriceTwapTs'
            docs: ['the last unix_timestamp the mark twap was updated']
            type: 'i64'
          },
          {
            name: 'baseSpread'
            docs: [
              'the minimum spread the AMM can quote. also used as step size for some spread logic increases.'
            ]
            type: 'u32'
          },
          {
            name: 'maxSpread'
            docs: ['the maximum spread the AMM can quote']
            type: 'u32'
          },
          {
            name: 'longSpread'
            docs: ['the spread for asks vs the reserve price']
            type: 'u32'
          },
          {
            name: 'shortSpread'
            docs: ['the spread for bids vs the reserve price']
            type: 'u32'
          },
          {
            name: 'longIntensityCount'
            docs: ['the count intensity of long fills against AMM']
            type: 'u32'
          },
          {
            name: 'shortIntensityCount'
            docs: ['the count intensity of short fills against AMM']
            type: 'u32'
          },
          {
            name: 'maxFillReserveFraction'
            docs: [
              'the fraction of total available liquidity a single fill on the AMM can consume'
            ]
            type: 'u16'
          },
          {
            name: 'maxSlippageRatio'
            docs: ['the maximum slippage a single fill on the AMM can push']
            type: 'u16'
          },
          {
            name: 'curveUpdateIntensity'
            docs: [
              'the update intensity of AMM formulaic updates (adjusting k). 0-100'
            ]
            type: 'u8'
          },
          {
            name: 'ammJitIntensity'
            docs: [
              'the jit intensity of AMM. larger intensity means larger participation in jit. 0 means no jit participation.',
              '(0, 100] is intensity for protocol-owned AMM. (100, 200] is intensity for user LP-owned AMM.'
            ]
            type: 'u8'
          },
          {
            name: 'oracleSource'
            docs: [
              'the oracle provider information. used to decode/scale the oracle public key'
            ]
            type: {
              defined: 'OracleSource'
            }
          },
          {
            name: 'lastOracleValid'
            docs: [
              'tracks whether the oracle was considered valid at the last AMM update'
            ]
            type: 'bool'
          },
          {
            name: 'targetBaseAssetAmountPerLp'
            docs: [
              'the target value for `base_asset_amount_per_lp`, used during AMM JIT with LP split',
              'precision: BASE_PRECISION'
            ]
            type: 'i32'
          },
          {
            name: 'perLpBase'
            docs: [
              'expo for unit of per_lp, base 10 (if per_lp_base=X, then per_lp unit is 10^X)'
            ]
            type: 'i8'
          },
          {
            name: 'padding1'
            type: 'u8'
          },
          {
            name: 'padding2'
            type: 'u16'
          },
          {
            name: 'totalFeeEarnedPerLp'
            type: 'u64'
          },
          {
            name: 'netUnsettledFundingPnl'
            type: 'i64'
          },
          {
            name: 'quoteAssetAmountWithUnsettledLp'
            type: 'i64'
          },
          {
            name: 'referencePriceOffset'
            type: 'i32'
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 12]
            }
          }
        ]
      }
    },
    {
      name: 'InsuranceFund'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'vault'
            type: 'publicKey'
          },
          {
            name: 'totalShares'
            type: 'u128'
          },
          {
            name: 'userShares'
            type: 'u128'
          },
          {
            name: 'sharesBase'
            type: 'u128'
          },
          {
            name: 'unstakingPeriod'
            type: 'i64'
          },
          {
            name: 'lastRevenueSettleTs'
            type: 'i64'
          },
          {
            name: 'revenueSettlePeriod'
            type: 'i64'
          },
          {
            name: 'totalFactor'
            type: 'u32'
          },
          {
            name: 'userFactor'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'OracleGuardRails'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'priceDivergence'
            type: {
              defined: 'PriceDivergenceGuardRails'
            }
          },
          {
            name: 'validity'
            type: {
              defined: 'ValidityGuardRails'
            }
          }
        ]
      }
    },
    {
      name: 'PriceDivergenceGuardRails'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'markOraclePercentDivergence'
            type: 'u64'
          },
          {
            name: 'oracleTwap5minPercentDivergence'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'ValidityGuardRails'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'slotsBeforeStaleForAmm'
            type: 'i64'
          },
          {
            name: 'slotsBeforeStaleForMargin'
            type: 'i64'
          },
          {
            name: 'confidenceIntervalMaxSize'
            type: 'u64'
          },
          {
            name: 'tooVolatileRatio'
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'FeeStructure'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'feeTiers'
            type: {
              array: [
                {
                  defined: 'FeeTier'
                },
                10
              ]
            }
          },
          {
            name: 'fillerRewardStructure'
            type: {
              defined: 'OrderFillerRewardStructure'
            }
          },
          {
            name: 'referrerRewardEpochUpperBound'
            type: 'u64'
          },
          {
            name: 'flatFillerFee'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'FeeTier'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'feeNumerator'
            type: 'u32'
          },
          {
            name: 'feeDenominator'
            type: 'u32'
          },
          {
            name: 'makerRebateNumerator'
            type: 'u32'
          },
          {
            name: 'makerRebateDenominator'
            type: 'u32'
          },
          {
            name: 'referrerRewardNumerator'
            type: 'u32'
          },
          {
            name: 'referrerRewardDenominator'
            type: 'u32'
          },
          {
            name: 'refereeFeeNumerator'
            type: 'u32'
          },
          {
            name: 'refereeFeeDenominator'
            type: 'u32'
          }
        ]
      }
    },
    {
      name: 'OrderFillerRewardStructure'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'rewardNumerator'
            type: 'u32'
          },
          {
            name: 'rewardDenominator'
            type: 'u32'
          },
          {
            name: 'timeBasedRewardLowerBound'
            type: 'u128'
          }
        ]
      }
    },
    {
      name: 'UserFees'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'totalFeePaid'
            docs: ['Total taker fee paid', 'precision: QUOTE_PRECISION']
            type: 'u64'
          },
          {
            name: 'totalFeeRebate'
            docs: ['Total maker fee rebate', 'precision: QUOTE_PRECISION']
            type: 'u64'
          },
          {
            name: 'totalTokenDiscount'
            docs: [
              'Total discount from holding token',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'totalRefereeDiscount'
            docs: [
              'Total discount from being referred',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'totalReferrerReward'
            docs: ['Total reward to referrer', 'precision: QUOTE_PRECISION']
            type: 'u64'
          },
          {
            name: 'currentEpochReferrerReward'
            docs: [
              'Total reward to referrer this epoch',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'SpotPosition'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'scaledBalance'
            docs: [
              'The scaled balance of the position. To get the token amount, multiply by the cumulative deposit/borrow',
              'interest of corresponding market.',
              'precision: SPOT_BALANCE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'openBids'
            docs: [
              'How many spot bids the user has open',
              'precision: token mint precision'
            ]
            type: 'i64'
          },
          {
            name: 'openAsks'
            docs: [
              'How many spot asks the user has open',
              'precision: token mint precision'
            ]
            type: 'i64'
          },
          {
            name: 'cumulativeDeposits'
            docs: [
              'The cumulative deposits/borrows a user has made into a market',
              'precision: token mint precision'
            ]
            type: 'i64'
          },
          {
            name: 'marketIndex'
            docs: ['The market index of the corresponding spot market']
            type: 'u16'
          },
          {
            name: 'balanceType'
            docs: ['Whether the position is deposit or borrow']
            type: {
              defined: 'SpotBalanceType'
            }
          },
          {
            name: 'openOrders'
            docs: ['Number of open orders']
            type: 'u8'
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 4]
            }
          }
        ]
      }
    },
    {
      name: 'PerpPosition'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'lastCumulativeFundingRate'
            docs: [
              "The perp market's last cumulative funding rate. Used to calculate the funding payment owed to user",
              'precision: FUNDING_RATE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'baseAssetAmount'
            docs: [
              'the size of the users perp position',
              'precision: BASE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'quoteAssetAmount'
            docs: [
              'Used to calculate the users pnl. Upon entry, is equal to base_asset_amount * avg entry price - fees',
              'Updated when the user open/closes position or settles pnl. Includes fees/funding',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'quoteBreakEvenAmount'
            docs: [
              'The amount of quote the user would need to exit their position at to break even',
              'Updated when the user open/closes position or settles pnl. Includes fees/funding',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'quoteEntryAmount'
            docs: [
              'The amount quote the user entered the position with. Equal to base asset amount * avg entry price',
              'Updated when the user open/closes position. Excludes fees/funding',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'openBids'
            docs: [
              'The amount of open bids the user has in this perp market',
              'precision: BASE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'openAsks'
            docs: [
              'The amount of open asks the user has in this perp market',
              'precision: BASE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'settledPnl'
            docs: [
              'The amount of pnl settled in this market since opening the position',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'lpShares'
            docs: [
              'The number of lp (liquidity provider) shares the user has in this perp market',
              'LP shares allow users to provide liquidity via the AMM',
              'precision: BASE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'lastBaseAssetAmountPerLp'
            docs: [
              'The last base asset amount per lp the amm had',
              'Used to settle the users lp position',
              'precision: BASE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'lastQuoteAssetAmountPerLp'
            docs: [
              'The last quote asset amount per lp the amm had',
              'Used to settle the users lp position',
              'precision: QUOTE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'remainderBaseAssetAmount'
            docs: [
              'Settling LP position can lead to a small amount of base asset being left over smaller than step size',
              'This records that remainder so it can be settled later on',
              'precision: BASE_PRECISION'
            ]
            type: 'i32'
          },
          {
            name: 'marketIndex'
            docs: ['The market index for the perp market']
            type: 'u16'
          },
          {
            name: 'openOrders'
            docs: ['The number of open orders']
            type: 'u8'
          },
          {
            name: 'perLpBase'
            type: 'i8'
          }
        ]
      }
    },
    {
      name: 'Order'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'slot'
            docs: ['The slot the order was placed']
            type: 'u64'
          },
          {
            name: 'price'
            docs: [
              'The limit price for the order (can be 0 for market orders)',
              "For orders with an auction, this price isn't used until the auction is complete",
              'precision: PRICE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'baseAssetAmount'
            docs: [
              'The size of the order',
              'precision for perps: BASE_PRECISION',
              'precision for spot: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'baseAssetAmountFilled'
            docs: [
              'The amount of the order filled',
              'precision for perps: BASE_PRECISION',
              'precision for spot: token mint precision'
            ]
            type: 'u64'
          },
          {
            name: 'quoteAssetAmountFilled'
            docs: [
              'The amount of quote filled for the order',
              'precision: QUOTE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'triggerPrice'
            docs: [
              'At what price the order will be triggered. Only relevant for trigger orders',
              'precision: PRICE_PRECISION'
            ]
            type: 'u64'
          },
          {
            name: 'auctionStartPrice'
            docs: [
              'The start price for the auction. Only relevant for market/oracle orders',
              'precision: PRICE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'auctionEndPrice'
            docs: [
              'The end price for the auction. Only relevant for market/oracle orders',
              'precision: PRICE_PRECISION'
            ]
            type: 'i64'
          },
          {
            name: 'maxTs'
            docs: ['The time when the order will expire']
            type: 'i64'
          },
          {
            name: 'oraclePriceOffset'
            docs: [
              'If set, the order limit price is the oracle price + this offset',
              'precision: PRICE_PRECISION'
            ]
            type: 'i32'
          },
          {
            name: 'orderId'
            docs: [
              'The id for the order. Each users has their own order id space'
            ]
            type: 'u32'
          },
          {
            name: 'marketIndex'
            docs: ['The perp/spot market index']
            type: 'u16'
          },
          {
            name: 'status'
            docs: ['Whether the order is open or unused']
            type: {
              defined: 'OrderStatus'
            }
          },
          {
            name: 'orderType'
            docs: ['The type of order']
            type: {
              defined: 'OrderType'
            }
          },
          {
            name: 'marketType'
            docs: ['Whether market is spot or perp']
            type: {
              defined: 'MarketType'
            }
          },
          {
            name: 'userOrderId'
            docs: [
              'User generated order id. Can make it easier to place/cancel orders'
            ]
            type: 'u8'
          },
          {
            name: 'existingPositionDirection'
            docs: ['What the users position was when the order was placed']
            type: {
              defined: 'PositionDirection'
            }
          },
          {
            name: 'direction'
            docs: [
              'Whether the user is going long or short. LONG = bid, SHORT = ask'
            ]
            type: {
              defined: 'PositionDirection'
            }
          },
          {
            name: 'reduceOnly'
            docs: ['Whether the order is allowed to only reduce position size']
            type: 'bool'
          },
          {
            name: 'postOnly'
            docs: ['Whether the order must be a maker']
            type: 'bool'
          },
          {
            name: 'immediateOrCancel'
            docs: [
              'Whether the order must be canceled the same slot it is placed'
            ]
            type: 'bool'
          },
          {
            name: 'triggerCondition'
            docs: [
              'Whether the order is triggered above or below the trigger price. Only relevant for trigger orders'
            ]
            type: {
              defined: 'OrderTriggerCondition'
            }
          },
          {
            name: 'auctionDuration'
            docs: ['How many slots the auction lasts']
            type: 'u8'
          },
          {
            name: 'padding'
            type: {
              array: ['u8', 3]
            }
          }
        ]
      }
    },
    {
      name: 'SwapDirection'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Add'
          },
          {
            name: 'Remove'
          }
        ]
      }
    },
    {
      name: 'ModifyOrderId'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'UserOrderId'
            fields: ['u8']
          },
          {
            name: 'OrderId'
            fields: ['u32']
          }
        ]
      }
    },
    {
      name: 'PositionDirection'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Long'
          },
          {
            name: 'Short'
          }
        ]
      }
    },
    {
      name: 'SpotFulfillmentType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'SerumV3'
          },
          {
            name: 'Match'
          },
          {
            name: 'PhoenixV1'
          }
        ]
      }
    },
    {
      name: 'SwapReduceOnly'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'In'
          },
          {
            name: 'Out'
          }
        ]
      }
    },
    {
      name: 'TwapPeriod'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'FundingPeriod'
          },
          {
            name: 'FiveMin'
          }
        ]
      }
    },
    {
      name: 'LiquidationMultiplierType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Discount'
          },
          {
            name: 'Premium'
          }
        ]
      }
    },
    {
      name: 'MarginRequirementType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Initial'
          },
          {
            name: 'Fill'
          },
          {
            name: 'Maintenance'
          }
        ]
      }
    },
    {
      name: 'OracleValidity'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Invalid'
          },
          {
            name: 'TooVolatile'
          },
          {
            name: 'TooUncertain'
          },
          {
            name: 'StaleForMargin'
          },
          {
            name: 'InsufficientDataPoints'
          },
          {
            name: 'StaleForAMM'
          },
          {
            name: 'Valid'
          }
        ]
      }
    },
    {
      name: 'DriftAction'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'UpdateFunding'
          },
          {
            name: 'SettlePnl'
          },
          {
            name: 'TriggerOrder'
          },
          {
            name: 'FillOrderMatch'
          },
          {
            name: 'FillOrderAmm'
          },
          {
            name: 'Liquidate'
          },
          {
            name: 'MarginCalc'
          },
          {
            name: 'UpdateTwap'
          },
          {
            name: 'UpdateAMMCurve'
          },
          {
            name: 'OracleOrderPrice'
          }
        ]
      }
    },
    {
      name: 'PositionUpdateType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Open'
          },
          {
            name: 'Increase'
          },
          {
            name: 'Reduce'
          },
          {
            name: 'Close'
          },
          {
            name: 'Flip'
          }
        ]
      }
    },
    {
      name: 'DepositExplanation'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'None'
          },
          {
            name: 'Transfer'
          },
          {
            name: 'Borrow'
          },
          {
            name: 'RepayBorrow'
          }
        ]
      }
    },
    {
      name: 'DepositDirection'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Deposit'
          },
          {
            name: 'Withdraw'
          }
        ]
      }
    },
    {
      name: 'OrderAction'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Place'
          },
          {
            name: 'Cancel'
          },
          {
            name: 'Fill'
          },
          {
            name: 'Trigger'
          },
          {
            name: 'Expire'
          }
        ]
      }
    },
    {
      name: 'OrderActionExplanation'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'None'
          },
          {
            name: 'InsufficientFreeCollateral'
          },
          {
            name: 'OraclePriceBreachedLimitPrice'
          },
          {
            name: 'MarketOrderFilledToLimitPrice'
          },
          {
            name: 'OrderExpired'
          },
          {
            name: 'Liquidation'
          },
          {
            name: 'OrderFilledWithAMM'
          },
          {
            name: 'OrderFilledWithAMMJit'
          },
          {
            name: 'OrderFilledWithMatch'
          },
          {
            name: 'OrderFilledWithMatchJit'
          },
          {
            name: 'MarketExpired'
          },
          {
            name: 'RiskingIncreasingOrder'
          },
          {
            name: 'ReduceOnlyOrderIncreasedPosition'
          },
          {
            name: 'OrderFillWithSerum'
          },
          {
            name: 'NoBorrowLiquidity'
          },
          {
            name: 'OrderFillWithPhoenix'
          },
          {
            name: 'OrderFilledWithAMMJitLPSplit'
          },
          {
            name: 'OrderFilledWithLPJit'
          },
          {
            name: 'DeriskLp'
          }
        ]
      }
    },
    {
      name: 'LPAction'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'AddLiquidity'
          },
          {
            name: 'RemoveLiquidity'
          },
          {
            name: 'SettleLiquidity'
          },
          {
            name: 'RemoveLiquidityDerisk'
          }
        ]
      }
    },
    {
      name: 'LiquidationType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'LiquidatePerp'
          },
          {
            name: 'LiquidateSpot'
          },
          {
            name: 'LiquidateBorrowForPerpPnl'
          },
          {
            name: 'LiquidatePerpPnlForDeposit'
          },
          {
            name: 'PerpBankruptcy'
          },
          {
            name: 'SpotBankruptcy'
          }
        ]
      }
    },
    {
      name: 'SettlePnlExplanation'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'None'
          },
          {
            name: 'ExpiredPosition'
          }
        ]
      }
    },
    {
      name: 'StakeAction'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Stake'
          },
          {
            name: 'UnstakeRequest'
          },
          {
            name: 'UnstakeCancelRequest'
          },
          {
            name: 'Unstake'
          },
          {
            name: 'UnstakeTransfer'
          },
          {
            name: 'StakeTransfer'
          }
        ]
      }
    },
    {
      name: 'FillMode'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Fill'
          },
          {
            name: 'PlaceAndMake'
          },
          {
            name: 'PlaceAndTake'
          }
        ]
      }
    },
    {
      name: 'PerpFulfillmentMethod'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'AMM'
            fields: [
              {
                option: 'u64'
              }
            ]
          },
          {
            name: 'Match'
            fields: ['publicKey', 'u16']
          }
        ]
      }
    },
    {
      name: 'SpotFulfillmentMethod'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'ExternalMarket'
          },
          {
            name: 'Match'
          }
        ]
      }
    },
    {
      name: 'MarginCalculationMode'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Standard'
            fields: [
              {
                name: 'track_open_orders_fraction'
                type: 'bool'
              }
            ]
          },
          {
            name: 'Liquidation'
            fields: [
              {
                name: 'market_to_track_margin_requirement'
                type: {
                  option: {
                    defined: 'MarketIdentifier'
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      name: 'OracleSource'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Pyth'
          },
          {
            name: 'Switchboard'
          },
          {
            name: 'QuoteAsset'
          },
          {
            name: 'Pyth1K'
          },
          {
            name: 'Pyth1M'
          },
          {
            name: 'PythStableCoin'
          }
        ]
      }
    },
    {
      name: 'PostOnlyParam'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'None'
          },
          {
            name: 'MustPostOnly'
          },
          {
            name: 'TryPostOnly'
          },
          {
            name: 'Slide'
          }
        ]
      }
    },
    {
      name: 'ModifyOrderPolicy'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'TryModify'
          },
          {
            name: 'MustModify'
          }
        ]
      }
    },
    {
      name: 'PerpOperation'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'UpdateFunding'
          },
          {
            name: 'AmmFill'
          },
          {
            name: 'Fill'
          },
          {
            name: 'SettlePnl'
          },
          {
            name: 'SettlePnlWithPosition'
          },
          {
            name: 'Liquidation'
          }
        ]
      }
    },
    {
      name: 'SpotOperation'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'UpdateCumulativeInterest'
          },
          {
            name: 'Fill'
          },
          {
            name: 'Withdraw'
          },
          {
            name: 'Liquidation'
          }
        ]
      }
    },
    {
      name: 'MarketStatus'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Initialized'
          },
          {
            name: 'Active'
          },
          {
            name: 'FundingPaused'
          },
          {
            name: 'AmmPaused'
          },
          {
            name: 'FillPaused'
          },
          {
            name: 'WithdrawPaused'
          },
          {
            name: 'ReduceOnly'
          },
          {
            name: 'Settlement'
          },
          {
            name: 'Delisted'
          }
        ]
      }
    },
    {
      name: 'ContractType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Perpetual'
          },
          {
            name: 'Future'
          }
        ]
      }
    },
    {
      name: 'ContractTier'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'A'
          },
          {
            name: 'B'
          },
          {
            name: 'C'
          },
          {
            name: 'Speculative'
          },
          {
            name: 'Isolated'
          }
        ]
      }
    },
    {
      name: 'AMMLiquiditySplit'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'ProtocolOwned'
          },
          {
            name: 'LPOwned'
          },
          {
            name: 'Shared'
          }
        ]
      }
    },
    {
      name: 'SpotBalanceType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Deposit'
          },
          {
            name: 'Borrow'
          }
        ]
      }
    },
    {
      name: 'SpotFulfillmentConfigStatus'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Enabled'
          },
          {
            name: 'Disabled'
          }
        ]
      }
    },
    {
      name: 'AssetTier'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Collateral'
          },
          {
            name: 'Protected'
          },
          {
            name: 'Cross'
          },
          {
            name: 'Isolated'
          },
          {
            name: 'Unlisted'
          }
        ]
      }
    },
    {
      name: 'ExchangeStatus'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'DepositPaused'
          },
          {
            name: 'WithdrawPaused'
          },
          {
            name: 'AmmPaused'
          },
          {
            name: 'FillPaused'
          },
          {
            name: 'LiqPaused'
          },
          {
            name: 'FundingPaused'
          },
          {
            name: 'SettlePnlPaused'
          }
        ]
      }
    },
    {
      name: 'UserStatus'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'BeingLiquidated'
          },
          {
            name: 'Bankrupt'
          },
          {
            name: 'ReduceOnly'
          },
          {
            name: 'AdvancedLp'
          }
        ]
      }
    },
    {
      name: 'AssetType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Base'
          },
          {
            name: 'Quote'
          }
        ]
      }
    },
    {
      name: 'OrderStatus'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Init'
          },
          {
            name: 'Open'
          },
          {
            name: 'Filled'
          },
          {
            name: 'Canceled'
          }
        ]
      }
    },
    {
      name: 'OrderType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Market'
          },
          {
            name: 'Limit'
          },
          {
            name: 'TriggerMarket'
          },
          {
            name: 'TriggerLimit'
          },
          {
            name: 'Oracle'
          }
        ]
      }
    },
    {
      name: 'OrderTriggerCondition'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Above'
          },
          {
            name: 'Below'
          },
          {
            name: 'TriggeredAbove'
          },
          {
            name: 'TriggeredBelow'
          }
        ]
      }
    },
    {
      name: 'MarketType'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Spot'
          },
          {
            name: 'Perp'
          }
        ]
      }
    }
  ]
  events: [
    {
      name: 'NewUserRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'userAuthority'
          type: 'publicKey'
          index: false
        },
        {
          name: 'user'
          type: 'publicKey'
          index: false
        },
        {
          name: 'subAccountId'
          type: 'u16'
          index: false
        },
        {
          name: 'name'
          type: {
            array: ['u8', 32]
          }
          index: false
        },
        {
          name: 'referrer'
          type: 'publicKey'
          index: false
        }
      ]
    },
    {
      name: 'DepositRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'userAuthority'
          type: 'publicKey'
          index: false
        },
        {
          name: 'user'
          type: 'publicKey'
          index: false
        },
        {
          name: 'direction'
          type: {
            defined: 'DepositDirection'
          }
          index: false
        },
        {
          name: 'depositRecordId'
          type: 'u64'
          index: false
        },
        {
          name: 'amount'
          type: 'u64'
          index: false
        },
        {
          name: 'marketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'oraclePrice'
          type: 'i64'
          index: false
        },
        {
          name: 'marketDepositBalance'
          type: 'u128'
          index: false
        },
        {
          name: 'marketWithdrawBalance'
          type: 'u128'
          index: false
        },
        {
          name: 'marketCumulativeDepositInterest'
          type: 'u128'
          index: false
        },
        {
          name: 'marketCumulativeBorrowInterest'
          type: 'u128'
          index: false
        },
        {
          name: 'totalDepositsAfter'
          type: 'u64'
          index: false
        },
        {
          name: 'totalWithdrawsAfter'
          type: 'u64'
          index: false
        },
        {
          name: 'explanation'
          type: {
            defined: 'DepositExplanation'
          }
          index: false
        },
        {
          name: 'transferUser'
          type: {
            option: 'publicKey'
          }
          index: false
        }
      ]
    },
    {
      name: 'SpotInterestRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'marketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'depositBalance'
          type: 'u128'
          index: false
        },
        {
          name: 'cumulativeDepositInterest'
          type: 'u128'
          index: false
        },
        {
          name: 'borrowBalance'
          type: 'u128'
          index: false
        },
        {
          name: 'cumulativeBorrowInterest'
          type: 'u128'
          index: false
        },
        {
          name: 'optimalUtilization'
          type: 'u32'
          index: false
        },
        {
          name: 'optimalBorrowRate'
          type: 'u32'
          index: false
        },
        {
          name: 'maxBorrowRate'
          type: 'u32'
          index: false
        }
      ]
    },
    {
      name: 'FundingPaymentRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'userAuthority'
          type: 'publicKey'
          index: false
        },
        {
          name: 'user'
          type: 'publicKey'
          index: false
        },
        {
          name: 'marketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'fundingPayment'
          type: 'i64'
          index: false
        },
        {
          name: 'baseAssetAmount'
          type: 'i64'
          index: false
        },
        {
          name: 'userLastCumulativeFunding'
          type: 'i64'
          index: false
        },
        {
          name: 'ammCumulativeFundingLong'
          type: 'i128'
          index: false
        },
        {
          name: 'ammCumulativeFundingShort'
          type: 'i128'
          index: false
        }
      ]
    },
    {
      name: 'FundingRateRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'recordId'
          type: 'u64'
          index: false
        },
        {
          name: 'marketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'fundingRate'
          type: 'i64'
          index: false
        },
        {
          name: 'fundingRateLong'
          type: 'i128'
          index: false
        },
        {
          name: 'fundingRateShort'
          type: 'i128'
          index: false
        },
        {
          name: 'cumulativeFundingRateLong'
          type: 'i128'
          index: false
        },
        {
          name: 'cumulativeFundingRateShort'
          type: 'i128'
          index: false
        },
        {
          name: 'oraclePriceTwap'
          type: 'i64'
          index: false
        },
        {
          name: 'markPriceTwap'
          type: 'u64'
          index: false
        },
        {
          name: 'periodRevenue'
          type: 'i64'
          index: false
        },
        {
          name: 'baseAssetAmountWithAmm'
          type: 'i128'
          index: false
        },
        {
          name: 'baseAssetAmountWithUnsettledLp'
          type: 'i128'
          index: false
        }
      ]
    },
    {
      name: 'CurveRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'recordId'
          type: 'u64'
          index: false
        },
        {
          name: 'pegMultiplierBefore'
          type: 'u128'
          index: false
        },
        {
          name: 'baseAssetReserveBefore'
          type: 'u128'
          index: false
        },
        {
          name: 'quoteAssetReserveBefore'
          type: 'u128'
          index: false
        },
        {
          name: 'sqrtKBefore'
          type: 'u128'
          index: false
        },
        {
          name: 'pegMultiplierAfter'
          type: 'u128'
          index: false
        },
        {
          name: 'baseAssetReserveAfter'
          type: 'u128'
          index: false
        },
        {
          name: 'quoteAssetReserveAfter'
          type: 'u128'
          index: false
        },
        {
          name: 'sqrtKAfter'
          type: 'u128'
          index: false
        },
        {
          name: 'baseAssetAmountLong'
          type: 'u128'
          index: false
        },
        {
          name: 'baseAssetAmountShort'
          type: 'u128'
          index: false
        },
        {
          name: 'baseAssetAmountWithAmm'
          type: 'i128'
          index: false
        },
        {
          name: 'totalFee'
          type: 'i128'
          index: false
        },
        {
          name: 'totalFeeMinusDistributions'
          type: 'i128'
          index: false
        },
        {
          name: 'adjustmentCost'
          type: 'i128'
          index: false
        },
        {
          name: 'oraclePrice'
          type: 'i64'
          index: false
        },
        {
          name: 'fillRecord'
          type: 'u128'
          index: false
        },
        {
          name: 'numberOfUsers'
          type: 'u32'
          index: false
        },
        {
          name: 'marketIndex'
          type: 'u16'
          index: false
        }
      ]
    },
    {
      name: 'OrderRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'user'
          type: 'publicKey'
          index: false
        },
        {
          name: 'order'
          type: {
            defined: 'Order'
          }
          index: false
        }
      ]
    },
    {
      name: 'OrderActionRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'action'
          type: {
            defined: 'OrderAction'
          }
          index: false
        },
        {
          name: 'actionExplanation'
          type: {
            defined: 'OrderActionExplanation'
          }
          index: false
        },
        {
          name: 'marketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'marketType'
          type: {
            defined: 'MarketType'
          }
          index: false
        },
        {
          name: 'filler'
          type: {
            option: 'publicKey'
          }
          index: false
        },
        {
          name: 'fillerReward'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'fillRecordId'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'baseAssetAmountFilled'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'quoteAssetAmountFilled'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'takerFee'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'makerFee'
          type: {
            option: 'i64'
          }
          index: false
        },
        {
          name: 'referrerReward'
          type: {
            option: 'u32'
          }
          index: false
        },
        {
          name: 'quoteAssetAmountSurplus'
          type: {
            option: 'i64'
          }
          index: false
        },
        {
          name: 'spotFulfillmentMethodFee'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'taker'
          type: {
            option: 'publicKey'
          }
          index: false
        },
        {
          name: 'takerOrderId'
          type: {
            option: 'u32'
          }
          index: false
        },
        {
          name: 'takerOrderDirection'
          type: {
            option: {
              defined: 'PositionDirection'
            }
          }
          index: false
        },
        {
          name: 'takerOrderBaseAssetAmount'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'takerOrderCumulativeBaseAssetAmountFilled'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'takerOrderCumulativeQuoteAssetAmountFilled'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'maker'
          type: {
            option: 'publicKey'
          }
          index: false
        },
        {
          name: 'makerOrderId'
          type: {
            option: 'u32'
          }
          index: false
        },
        {
          name: 'makerOrderDirection'
          type: {
            option: {
              defined: 'PositionDirection'
            }
          }
          index: false
        },
        {
          name: 'makerOrderBaseAssetAmount'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'makerOrderCumulativeBaseAssetAmountFilled'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'makerOrderCumulativeQuoteAssetAmountFilled'
          type: {
            option: 'u64'
          }
          index: false
        },
        {
          name: 'oraclePrice'
          type: 'i64'
          index: false
        }
      ]
    },
    {
      name: 'LPRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'user'
          type: 'publicKey'
          index: false
        },
        {
          name: 'action'
          type: {
            defined: 'LPAction'
          }
          index: false
        },
        {
          name: 'nShares'
          type: 'u64'
          index: false
        },
        {
          name: 'marketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'deltaBaseAssetAmount'
          type: 'i64'
          index: false
        },
        {
          name: 'deltaQuoteAssetAmount'
          type: 'i64'
          index: false
        },
        {
          name: 'pnl'
          type: 'i64'
          index: false
        }
      ]
    },
    {
      name: 'LiquidationRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'liquidationType'
          type: {
            defined: 'LiquidationType'
          }
          index: false
        },
        {
          name: 'user'
          type: 'publicKey'
          index: false
        },
        {
          name: 'liquidator'
          type: 'publicKey'
          index: false
        },
        {
          name: 'marginRequirement'
          type: 'u128'
          index: false
        },
        {
          name: 'totalCollateral'
          type: 'i128'
          index: false
        },
        {
          name: 'marginFreed'
          type: 'u64'
          index: false
        },
        {
          name: 'liquidationId'
          type: 'u16'
          index: false
        },
        {
          name: 'bankrupt'
          type: 'bool'
          index: false
        },
        {
          name: 'canceledOrderIds'
          type: {
            vec: 'u32'
          }
          index: false
        },
        {
          name: 'liquidatePerp'
          type: {
            defined: 'LiquidatePerpRecord'
          }
          index: false
        },
        {
          name: 'liquidateSpot'
          type: {
            defined: 'LiquidateSpotRecord'
          }
          index: false
        },
        {
          name: 'liquidateBorrowForPerpPnl'
          type: {
            defined: 'LiquidateBorrowForPerpPnlRecord'
          }
          index: false
        },
        {
          name: 'liquidatePerpPnlForDeposit'
          type: {
            defined: 'LiquidatePerpPnlForDepositRecord'
          }
          index: false
        },
        {
          name: 'perpBankruptcy'
          type: {
            defined: 'PerpBankruptcyRecord'
          }
          index: false
        },
        {
          name: 'spotBankruptcy'
          type: {
            defined: 'SpotBankruptcyRecord'
          }
          index: false
        }
      ]
    },
    {
      name: 'SettlePnlRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'user'
          type: 'publicKey'
          index: false
        },
        {
          name: 'marketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'pnl'
          type: 'i128'
          index: false
        },
        {
          name: 'baseAssetAmount'
          type: 'i64'
          index: false
        },
        {
          name: 'quoteAssetAmountAfter'
          type: 'i64'
          index: false
        },
        {
          name: 'quoteEntryAmount'
          type: 'i64'
          index: false
        },
        {
          name: 'settlePrice'
          type: 'i64'
          index: false
        },
        {
          name: 'explanation'
          type: {
            defined: 'SettlePnlExplanation'
          }
          index: false
        }
      ]
    },
    {
      name: 'InsuranceFundRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'spotMarketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'perpMarketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'userIfFactor'
          type: 'u32'
          index: false
        },
        {
          name: 'totalIfFactor'
          type: 'u32'
          index: false
        },
        {
          name: 'vaultAmountBefore'
          type: 'u64'
          index: false
        },
        {
          name: 'insuranceVaultAmountBefore'
          type: 'u64'
          index: false
        },
        {
          name: 'totalIfSharesBefore'
          type: 'u128'
          index: false
        },
        {
          name: 'totalIfSharesAfter'
          type: 'u128'
          index: false
        },
        {
          name: 'amount'
          type: 'i64'
          index: false
        }
      ]
    },
    {
      name: 'InsuranceFundStakeRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'userAuthority'
          type: 'publicKey'
          index: false
        },
        {
          name: 'action'
          type: {
            defined: 'StakeAction'
          }
          index: false
        },
        {
          name: 'amount'
          type: 'u64'
          index: false
        },
        {
          name: 'marketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'insuranceVaultAmountBefore'
          type: 'u64'
          index: false
        },
        {
          name: 'ifSharesBefore'
          type: 'u128'
          index: false
        },
        {
          name: 'userIfSharesBefore'
          type: 'u128'
          index: false
        },
        {
          name: 'totalIfSharesBefore'
          type: 'u128'
          index: false
        },
        {
          name: 'ifSharesAfter'
          type: 'u128'
          index: false
        },
        {
          name: 'userIfSharesAfter'
          type: 'u128'
          index: false
        },
        {
          name: 'totalIfSharesAfter'
          type: 'u128'
          index: false
        }
      ]
    },
    {
      name: 'SwapRecord'
      fields: [
        {
          name: 'ts'
          type: 'i64'
          index: false
        },
        {
          name: 'user'
          type: 'publicKey'
          index: false
        },
        {
          name: 'amountOut'
          type: 'u64'
          index: false
        },
        {
          name: 'amountIn'
          type: 'u64'
          index: false
        },
        {
          name: 'outMarketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'inMarketIndex'
          type: 'u16'
          index: false
        },
        {
          name: 'outOraclePrice'
          type: 'i64'
          index: false
        },
        {
          name: 'inOraclePrice'
          type: 'i64'
          index: false
        },
        {
          name: 'fee'
          type: 'u64'
          index: false
        }
      ]
    }
  ]
  errors: [
    {
      code: 6000
      name: 'InvalidSpotMarketAuthority'
      msg: 'Invalid Spot Market Authority'
    },
    {
      code: 6001
      name: 'InvalidInsuranceFundAuthority'
      msg: 'Clearing house not insurance fund authority'
    },
    {
      code: 6002
      name: 'InsufficientDeposit'
      msg: 'Insufficient deposit'
    },
    {
      code: 6003
      name: 'InsufficientCollateral'
      msg: 'Insufficient collateral'
    },
    {
      code: 6004
      name: 'SufficientCollateral'
      msg: 'Sufficient collateral'
    },
    {
      code: 6005
      name: 'MaxNumberOfPositions'
      msg: 'Max number of positions taken'
    },
    {
      code: 6006
      name: 'AdminControlsPricesDisabled'
      msg: 'Admin Controls Prices Disabled'
    },
    {
      code: 6007
      name: 'MarketDelisted'
      msg: 'Market Delisted'
    },
    {
      code: 6008
      name: 'MarketIndexAlreadyInitialized'
      msg: 'Market Index Already Initialized'
    },
    {
      code: 6009
      name: 'UserAccountAndUserPositionsAccountMismatch'
      msg: 'User Account And User Positions Account Mismatch'
    },
    {
      code: 6010
      name: 'UserHasNoPositionInMarket'
      msg: 'User Has No Position In Market'
    },
    {
      code: 6011
      name: 'InvalidInitialPeg'
      msg: 'Invalid Initial Peg'
    },
    {
      code: 6012
      name: 'InvalidRepegRedundant'
      msg: 'AMM repeg already configured with amt given'
    },
    {
      code: 6013
      name: 'InvalidRepegDirection'
      msg: 'AMM repeg incorrect repeg direction'
    },
    {
      code: 6014
      name: 'InvalidRepegProfitability'
      msg: 'AMM repeg out of bounds pnl'
    },
    {
      code: 6015
      name: 'SlippageOutsideLimit'
      msg: 'Slippage Outside Limit Price'
    },
    {
      code: 6016
      name: 'OrderSizeTooSmall'
      msg: 'Order Size Too Small'
    },
    {
      code: 6017
      name: 'InvalidUpdateK'
      msg: 'Price change too large when updating K'
    },
    {
      code: 6018
      name: 'AdminWithdrawTooLarge'
      msg: 'Admin tried to withdraw amount larger than fees collected'
    },
    {
      code: 6019
      name: 'MathError'
      msg: 'Math Error'
    },
    {
      code: 6020
      name: 'BnConversionError'
      msg: 'Conversion to u128/u64 failed with an overflow or underflow'
    },
    {
      code: 6021
      name: 'ClockUnavailable'
      msg: 'Clock unavailable'
    },
    {
      code: 6022
      name: 'UnableToLoadOracle'
      msg: 'Unable To Load Oracles'
    },
    {
      code: 6023
      name: 'PriceBandsBreached'
      msg: 'Price Bands Breached'
    },
    {
      code: 6024
      name: 'ExchangePaused'
      msg: 'Exchange is paused'
    },
    {
      code: 6025
      name: 'InvalidWhitelistToken'
      msg: 'Invalid whitelist token'
    },
    {
      code: 6026
      name: 'WhitelistTokenNotFound'
      msg: 'Whitelist token not found'
    },
    {
      code: 6027
      name: 'InvalidDiscountToken'
      msg: 'Invalid discount token'
    },
    {
      code: 6028
      name: 'DiscountTokenNotFound'
      msg: 'Discount token not found'
    },
    {
      code: 6029
      name: 'ReferrerNotFound'
      msg: 'Referrer not found'
    },
    {
      code: 6030
      name: 'ReferrerStatsNotFound'
      msg: 'ReferrerNotFound'
    },
    {
      code: 6031
      name: 'ReferrerMustBeWritable'
      msg: 'ReferrerMustBeWritable'
    },
    {
      code: 6032
      name: 'ReferrerStatsMustBeWritable'
      msg: 'ReferrerMustBeWritable'
    },
    {
      code: 6033
      name: 'ReferrerAndReferrerStatsAuthorityUnequal'
      msg: 'ReferrerAndReferrerStatsAuthorityUnequal'
    },
    {
      code: 6034
      name: 'InvalidReferrer'
      msg: 'InvalidReferrer'
    },
    {
      code: 6035
      name: 'InvalidOracle'
      msg: 'InvalidOracle'
    },
    {
      code: 6036
      name: 'OracleNotFound'
      msg: 'OracleNotFound'
    },
    {
      code: 6037
      name: 'LiquidationsBlockedByOracle'
      msg: 'Liquidations Blocked By Oracle'
    },
    {
      code: 6038
      name: 'MaxDeposit'
      msg: 'Can not deposit more than max deposit'
    },
    {
      code: 6039
      name: 'CantDeleteUserWithCollateral'
      msg: 'Can not delete user that still has collateral'
    },
    {
      code: 6040
      name: 'InvalidFundingProfitability'
      msg: 'AMM funding out of bounds pnl'
    },
    {
      code: 6041
      name: 'CastingFailure'
      msg: 'Casting Failure'
    },
    {
      code: 6042
      name: 'InvalidOrder'
      msg: 'InvalidOrder'
    },
    {
      code: 6043
      name: 'InvalidOrderMaxTs'
      msg: 'InvalidOrderMaxTs'
    },
    {
      code: 6044
      name: 'InvalidOrderMarketType'
      msg: 'InvalidOrderMarketType'
    },
    {
      code: 6045
      name: 'InvalidOrderForInitialMarginReq'
      msg: 'InvalidOrderForInitialMarginReq'
    },
    {
      code: 6046
      name: 'InvalidOrderNotRiskReducing'
      msg: 'InvalidOrderNotRiskReducing'
    },
    {
      code: 6047
      name: 'InvalidOrderSizeTooSmall'
      msg: 'InvalidOrderSizeTooSmall'
    },
    {
      code: 6048
      name: 'InvalidOrderNotStepSizeMultiple'
      msg: 'InvalidOrderNotStepSizeMultiple'
    },
    {
      code: 6049
      name: 'InvalidOrderBaseQuoteAsset'
      msg: 'InvalidOrderBaseQuoteAsset'
    },
    {
      code: 6050
      name: 'InvalidOrderIOC'
      msg: 'InvalidOrderIOC'
    },
    {
      code: 6051
      name: 'InvalidOrderPostOnly'
      msg: 'InvalidOrderPostOnly'
    },
    {
      code: 6052
      name: 'InvalidOrderIOCPostOnly'
      msg: 'InvalidOrderIOCPostOnly'
    },
    {
      code: 6053
      name: 'InvalidOrderTrigger'
      msg: 'InvalidOrderTrigger'
    },
    {
      code: 6054
      name: 'InvalidOrderAuction'
      msg: 'InvalidOrderAuction'
    },
    {
      code: 6055
      name: 'InvalidOrderOracleOffset'
      msg: 'InvalidOrderOracleOffset'
    },
    {
      code: 6056
      name: 'InvalidOrderMinOrderSize'
      msg: 'InvalidOrderMinOrderSize'
    },
    {
      code: 6057
      name: 'PlacePostOnlyLimitFailure'
      msg: 'Failed to Place Post-Only Limit Order'
    },
    {
      code: 6058
      name: 'UserHasNoOrder'
      msg: 'User has no order'
    },
    {
      code: 6059
      name: 'OrderAmountTooSmall'
      msg: 'Order Amount Too Small'
    },
    {
      code: 6060
      name: 'MaxNumberOfOrders'
      msg: 'Max number of orders taken'
    },
    {
      code: 6061
      name: 'OrderDoesNotExist'
      msg: 'Order does not exist'
    },
    {
      code: 6062
      name: 'OrderNotOpen'
      msg: 'Order not open'
    },
    {
      code: 6063
      name: 'FillOrderDidNotUpdateState'
      msg: 'FillOrderDidNotUpdateState'
    },
    {
      code: 6064
      name: 'ReduceOnlyOrderIncreasedRisk'
      msg: 'Reduce only order increased risk'
    },
    {
      code: 6065
      name: 'UnableToLoadAccountLoader'
      msg: 'Unable to load AccountLoader'
    },
    {
      code: 6066
      name: 'TradeSizeTooLarge'
      msg: 'Trade Size Too Large'
    },
    {
      code: 6067
      name: 'UserCantReferThemselves'
      msg: 'User cant refer themselves'
    },
    {
      code: 6068
      name: 'DidNotReceiveExpectedReferrer'
      msg: 'Did not receive expected referrer'
    },
    {
      code: 6069
      name: 'CouldNotDeserializeReferrer'
      msg: 'Could not deserialize referrer'
    },
    {
      code: 6070
      name: 'CouldNotDeserializeReferrerStats'
      msg: 'Could not deserialize referrer stats'
    },
    {
      code: 6071
      name: 'UserOrderIdAlreadyInUse'
      msg: 'User Order Id Already In Use'
    },
    {
      code: 6072
      name: 'NoPositionsLiquidatable'
      msg: 'No positions liquidatable'
    },
    {
      code: 6073
      name: 'InvalidMarginRatio'
      msg: 'Invalid Margin Ratio'
    },
    {
      code: 6074
      name: 'CantCancelPostOnlyOrder'
      msg: 'Cant Cancel Post Only Order'
    },
    {
      code: 6075
      name: 'InvalidOracleOffset'
      msg: 'InvalidOracleOffset'
    },
    {
      code: 6076
      name: 'CantExpireOrders'
      msg: 'CantExpireOrders'
    },
    {
      code: 6077
      name: 'CouldNotLoadMarketData'
      msg: 'CouldNotLoadMarketData'
    },
    {
      code: 6078
      name: 'PerpMarketNotFound'
      msg: 'PerpMarketNotFound'
    },
    {
      code: 6079
      name: 'InvalidMarketAccount'
      msg: 'InvalidMarketAccount'
    },
    {
      code: 6080
      name: 'UnableToLoadPerpMarketAccount'
      msg: 'UnableToLoadMarketAccount'
    },
    {
      code: 6081
      name: 'MarketWrongMutability'
      msg: 'MarketWrongMutability'
    },
    {
      code: 6082
      name: 'UnableToCastUnixTime'
      msg: 'UnableToCastUnixTime'
    },
    {
      code: 6083
      name: 'CouldNotFindSpotPosition'
      msg: 'CouldNotFindSpotPosition'
    },
    {
      code: 6084
      name: 'NoSpotPositionAvailable'
      msg: 'NoSpotPositionAvailable'
    },
    {
      code: 6085
      name: 'InvalidSpotMarketInitialization'
      msg: 'InvalidSpotMarketInitialization'
    },
    {
      code: 6086
      name: 'CouldNotLoadSpotMarketData'
      msg: 'CouldNotLoadSpotMarketData'
    },
    {
      code: 6087
      name: 'SpotMarketNotFound'
      msg: 'SpotMarketNotFound'
    },
    {
      code: 6088
      name: 'InvalidSpotMarketAccount'
      msg: 'InvalidSpotMarketAccount'
    },
    {
      code: 6089
      name: 'UnableToLoadSpotMarketAccount'
      msg: 'UnableToLoadSpotMarketAccount'
    },
    {
      code: 6090
      name: 'SpotMarketWrongMutability'
      msg: 'SpotMarketWrongMutability'
    },
    {
      code: 6091
      name: 'SpotMarketInterestNotUpToDate'
      msg: 'SpotInterestNotUpToDate'
    },
    {
      code: 6092
      name: 'SpotMarketInsufficientDeposits'
      msg: 'SpotMarketInsufficientDeposits'
    },
    {
      code: 6093
      name: 'UserMustSettleTheirOwnPositiveUnsettledPNL'
      msg: 'UserMustSettleTheirOwnPositiveUnsettledPNL'
    },
    {
      code: 6094
      name: 'CantUpdatePoolBalanceType'
      msg: 'CantUpdatePoolBalanceType'
    },
    {
      code: 6095
      name: 'InsufficientCollateralForSettlingPNL'
      msg: 'InsufficientCollateralForSettlingPNL'
    },
    {
      code: 6096
      name: 'AMMNotUpdatedInSameSlot'
      msg: 'AMMNotUpdatedInSameSlot'
    },
    {
      code: 6097
      name: 'AuctionNotComplete'
      msg: 'AuctionNotComplete'
    },
    {
      code: 6098
      name: 'MakerNotFound'
      msg: 'MakerNotFound'
    },
    {
      code: 6099
      name: 'MakerStatsNotFound'
      msg: 'MakerNotFound'
    },
    {
      code: 6100
      name: 'MakerMustBeWritable'
      msg: 'MakerMustBeWritable'
    },
    {
      code: 6101
      name: 'MakerStatsMustBeWritable'
      msg: 'MakerMustBeWritable'
    },
    {
      code: 6102
      name: 'MakerOrderNotFound'
      msg: 'MakerOrderNotFound'
    },
    {
      code: 6103
      name: 'CouldNotDeserializeMaker'
      msg: 'CouldNotDeserializeMaker'
    },
    {
      code: 6104
      name: 'CouldNotDeserializeMakerStats'
      msg: 'CouldNotDeserializeMaker'
    },
    {
      code: 6105
      name: 'AuctionPriceDoesNotSatisfyMaker'
      msg: 'AuctionPriceDoesNotSatisfyMaker'
    },
    {
      code: 6106
      name: 'MakerCantFulfillOwnOrder'
      msg: 'MakerCantFulfillOwnOrder'
    },
    {
      code: 6107
      name: 'MakerOrderMustBePostOnly'
      msg: 'MakerOrderMustBePostOnly'
    },
    {
      code: 6108
      name: 'CantMatchTwoPostOnlys'
      msg: 'CantMatchTwoPostOnlys'
    },
    {
      code: 6109
      name: 'OrderBreachesOraclePriceLimits'
      msg: 'OrderBreachesOraclePriceLimits'
    },
    {
      code: 6110
      name: 'OrderMustBeTriggeredFirst'
      msg: 'OrderMustBeTriggeredFirst'
    },
    {
      code: 6111
      name: 'OrderNotTriggerable'
      msg: 'OrderNotTriggerable'
    },
    {
      code: 6112
      name: 'OrderDidNotSatisfyTriggerCondition'
      msg: 'OrderDidNotSatisfyTriggerCondition'
    },
    {
      code: 6113
      name: 'PositionAlreadyBeingLiquidated'
      msg: 'PositionAlreadyBeingLiquidated'
    },
    {
      code: 6114
      name: 'PositionDoesntHaveOpenPositionOrOrders'
      msg: 'PositionDoesntHaveOpenPositionOrOrders'
    },
    {
      code: 6115
      name: 'AllOrdersAreAlreadyLiquidations'
      msg: 'AllOrdersAreAlreadyLiquidations'
    },
    {
      code: 6116
      name: 'CantCancelLiquidationOrder'
      msg: 'CantCancelLiquidationOrder'
    },
    {
      code: 6117
      name: 'UserIsBeingLiquidated'
      msg: 'UserIsBeingLiquidated'
    },
    {
      code: 6118
      name: 'LiquidationsOngoing'
      msg: 'LiquidationsOngoing'
    },
    {
      code: 6119
      name: 'WrongSpotBalanceType'
      msg: 'WrongSpotBalanceType'
    },
    {
      code: 6120
      name: 'UserCantLiquidateThemself'
      msg: 'UserCantLiquidateThemself'
    },
    {
      code: 6121
      name: 'InvalidPerpPositionToLiquidate'
      msg: 'InvalidPerpPositionToLiquidate'
    },
    {
      code: 6122
      name: 'InvalidBaseAssetAmountForLiquidatePerp'
      msg: 'InvalidBaseAssetAmountForLiquidatePerp'
    },
    {
      code: 6123
      name: 'InvalidPositionLastFundingRate'
      msg: 'InvalidPositionLastFundingRate'
    },
    {
      code: 6124
      name: 'InvalidPositionDelta'
      msg: 'InvalidPositionDelta'
    },
    {
      code: 6125
      name: 'UserBankrupt'
      msg: 'UserBankrupt'
    },
    {
      code: 6126
      name: 'UserNotBankrupt'
      msg: 'UserNotBankrupt'
    },
    {
      code: 6127
      name: 'UserHasInvalidBorrow'
      msg: 'UserHasInvalidBorrow'
    },
    {
      code: 6128
      name: 'DailyWithdrawLimit'
      msg: 'DailyWithdrawLimit'
    },
    {
      code: 6129
      name: 'DefaultError'
      msg: 'DefaultError'
    },
    {
      code: 6130
      name: 'InsufficientLPTokens'
      msg: 'Insufficient LP tokens'
    },
    {
      code: 6131
      name: 'CantLPWithPerpPosition'
      msg: 'Cant LP with a market position'
    },
    {
      code: 6132
      name: 'UnableToBurnLPTokens'
      msg: 'Unable to burn LP tokens'
    },
    {
      code: 6133
      name: 'TryingToRemoveLiquidityTooFast'
      msg: 'Trying to remove liqudity too fast after adding it'
    },
    {
      code: 6134
      name: 'InvalidSpotMarketVault'
      msg: 'Invalid Spot Market Vault'
    },
    {
      code: 6135
      name: 'InvalidSpotMarketState'
      msg: 'Invalid Spot Market State'
    },
    {
      code: 6136
      name: 'InvalidSerumProgram'
      msg: 'InvalidSerumProgram'
    },
    {
      code: 6137
      name: 'InvalidSerumMarket'
      msg: 'InvalidSerumMarket'
    },
    {
      code: 6138
      name: 'InvalidSerumBids'
      msg: 'InvalidSerumBids'
    },
    {
      code: 6139
      name: 'InvalidSerumAsks'
      msg: 'InvalidSerumAsks'
    },
    {
      code: 6140
      name: 'InvalidSerumOpenOrders'
      msg: 'InvalidSerumOpenOrders'
    },
    {
      code: 6141
      name: 'FailedSerumCPI'
      msg: 'FailedSerumCPI'
    },
    {
      code: 6142
      name: 'FailedToFillOnExternalMarket'
      msg: 'FailedToFillOnExternalMarket'
    },
    {
      code: 6143
      name: 'InvalidFulfillmentConfig'
      msg: 'InvalidFulfillmentConfig'
    },
    {
      code: 6144
      name: 'InvalidFeeStructure'
      msg: 'InvalidFeeStructure'
    },
    {
      code: 6145
      name: 'InsufficientIFShares'
      msg: 'Insufficient IF shares'
    },
    {
      code: 6146
      name: 'MarketActionPaused'
      msg: 'the Market has paused this action'
    },
    {
      code: 6147
      name: 'MarketPlaceOrderPaused'
      msg: 'the Market status doesnt allow placing orders'
    },
    {
      code: 6148
      name: 'MarketFillOrderPaused'
      msg: 'the Market status doesnt allow filling orders'
    },
    {
      code: 6149
      name: 'MarketWithdrawPaused'
      msg: 'the Market status doesnt allow withdraws'
    },
    {
      code: 6150
      name: 'ProtectedAssetTierViolation'
      msg: 'Action violates the Protected Asset Tier rules'
    },
    {
      code: 6151
      name: 'IsolatedAssetTierViolation'
      msg: 'Action violates the Isolated Asset Tier rules'
    },
    {
      code: 6152
      name: 'UserCantBeDeleted'
      msg: 'User Cant Be Deleted'
    },
    {
      code: 6153
      name: 'ReduceOnlyWithdrawIncreasedRisk'
      msg: 'Reduce Only Withdraw Increased Risk'
    },
    {
      code: 6154
      name: 'MaxOpenInterest'
      msg: 'Max Open Interest'
    },
    {
      code: 6155
      name: 'CantResolvePerpBankruptcy'
      msg: 'Cant Resolve Perp Bankruptcy'
    },
    {
      code: 6156
      name: 'LiquidationDoesntSatisfyLimitPrice'
      msg: 'Liquidation Doesnt Satisfy Limit Price'
    },
    {
      code: 6157
      name: 'MarginTradingDisabled'
      msg: 'Margin Trading Disabled'
    },
    {
      code: 6158
      name: 'InvalidMarketStatusToSettlePnl'
      msg: 'Invalid Market Status to Settle Perp Pnl'
    },
    {
      code: 6159
      name: 'PerpMarketNotInSettlement'
      msg: 'PerpMarketNotInSettlement'
    },
    {
      code: 6160
      name: 'PerpMarketNotInReduceOnly'
      msg: 'PerpMarketNotInReduceOnly'
    },
    {
      code: 6161
      name: 'PerpMarketSettlementBufferNotReached'
      msg: 'PerpMarketSettlementBufferNotReached'
    },
    {
      code: 6162
      name: 'PerpMarketSettlementUserHasOpenOrders'
      msg: 'PerpMarketSettlementUserHasOpenOrders'
    },
    {
      code: 6163
      name: 'PerpMarketSettlementUserHasActiveLP'
      msg: 'PerpMarketSettlementUserHasActiveLP'
    },
    {
      code: 6164
      name: 'UnableToSettleExpiredUserPosition'
      msg: 'UnableToSettleExpiredUserPosition'
    },
    {
      code: 6165
      name: 'UnequalMarketIndexForSpotTransfer'
      msg: 'UnequalMarketIndexForSpotTransfer'
    },
    {
      code: 6166
      name: 'InvalidPerpPositionDetected'
      msg: 'InvalidPerpPositionDetected'
    },
    {
      code: 6167
      name: 'InvalidSpotPositionDetected'
      msg: 'InvalidSpotPositionDetected'
    },
    {
      code: 6168
      name: 'InvalidAmmDetected'
      msg: 'InvalidAmmDetected'
    },
    {
      code: 6169
      name: 'InvalidAmmForFillDetected'
      msg: 'InvalidAmmForFillDetected'
    },
    {
      code: 6170
      name: 'InvalidAmmLimitPriceOverride'
      msg: 'InvalidAmmLimitPriceOverride'
    },
    {
      code: 6171
      name: 'InvalidOrderFillPrice'
      msg: 'InvalidOrderFillPrice'
    },
    {
      code: 6172
      name: 'SpotMarketBalanceInvariantViolated'
      msg: 'SpotMarketBalanceInvariantViolated'
    },
    {
      code: 6173
      name: 'SpotMarketVaultInvariantViolated'
      msg: 'SpotMarketVaultInvariantViolated'
    },
    {
      code: 6174
      name: 'InvalidPDA'
      msg: 'InvalidPDA'
    },
    {
      code: 6175
      name: 'InvalidPDASigner'
      msg: 'InvalidPDASigner'
    },
    {
      code: 6176
      name: 'RevenueSettingsCannotSettleToIF'
      msg: 'RevenueSettingsCannotSettleToIF'
    },
    {
      code: 6177
      name: 'NoRevenueToSettleToIF'
      msg: 'NoRevenueToSettleToIF'
    },
    {
      code: 6178
      name: 'NoAmmPerpPnlDeficit'
      msg: 'NoAmmPerpPnlDeficit'
    },
    {
      code: 6179
      name: 'SufficientPerpPnlPool'
      msg: 'SufficientPerpPnlPool'
    },
    {
      code: 6180
      name: 'InsufficientPerpPnlPool'
      msg: 'InsufficientPerpPnlPool'
    },
    {
      code: 6181
      name: 'PerpPnlDeficitBelowThreshold'
      msg: 'PerpPnlDeficitBelowThreshold'
    },
    {
      code: 6182
      name: 'MaxRevenueWithdrawPerPeriodReached'
      msg: 'MaxRevenueWithdrawPerPeriodReached'
    },
    {
      code: 6183
      name: 'MaxIFWithdrawReached'
      msg: 'InvalidSpotPositionDetected'
    },
    {
      code: 6184
      name: 'NoIFWithdrawAvailable'
      msg: 'NoIFWithdrawAvailable'
    },
    {
      code: 6185
      name: 'InvalidIFUnstake'
      msg: 'InvalidIFUnstake'
    },
    {
      code: 6186
      name: 'InvalidIFUnstakeSize'
      msg: 'InvalidIFUnstakeSize'
    },
    {
      code: 6187
      name: 'InvalidIFUnstakeCancel'
      msg: 'InvalidIFUnstakeCancel'
    },
    {
      code: 6188
      name: 'InvalidIFForNewStakes'
      msg: 'InvalidIFForNewStakes'
    },
    {
      code: 6189
      name: 'InvalidIFRebase'
      msg: 'InvalidIFRebase'
    },
    {
      code: 6190
      name: 'InvalidInsuranceUnstakeSize'
      msg: 'InvalidInsuranceUnstakeSize'
    },
    {
      code: 6191
      name: 'InvalidOrderLimitPrice'
      msg: 'InvalidOrderLimitPrice'
    },
    {
      code: 6192
      name: 'InvalidIFDetected'
      msg: 'InvalidIFDetected'
    },
    {
      code: 6193
      name: 'InvalidAmmMaxSpreadDetected'
      msg: 'InvalidAmmMaxSpreadDetected'
    },
    {
      code: 6194
      name: 'InvalidConcentrationCoef'
      msg: 'InvalidConcentrationCoef'
    },
    {
      code: 6195
      name: 'InvalidSrmVault'
      msg: 'InvalidSrmVault'
    },
    {
      code: 6196
      name: 'InvalidVaultOwner'
      msg: 'InvalidVaultOwner'
    },
    {
      code: 6197
      name: 'InvalidMarketStatusForFills'
      msg: 'InvalidMarketStatusForFills'
    },
    {
      code: 6198
      name: 'IFWithdrawRequestInProgress'
      msg: 'IFWithdrawRequestInProgress'
    },
    {
      code: 6199
      name: 'NoIFWithdrawRequestInProgress'
      msg: 'NoIFWithdrawRequestInProgress'
    },
    {
      code: 6200
      name: 'IFWithdrawRequestTooSmall'
      msg: 'IFWithdrawRequestTooSmall'
    },
    {
      code: 6201
      name: 'IncorrectSpotMarketAccountPassed'
      msg: 'IncorrectSpotMarketAccountPassed'
    },
    {
      code: 6202
      name: 'BlockchainClockInconsistency'
      msg: 'BlockchainClockInconsistency'
    },
    {
      code: 6203
      name: 'InvalidIFSharesDetected'
      msg: 'InvalidIFSharesDetected'
    },
    {
      code: 6204
      name: 'NewLPSizeTooSmall'
      msg: 'NewLPSizeTooSmall'
    },
    {
      code: 6205
      name: 'MarketStatusInvalidForNewLP'
      msg: 'MarketStatusInvalidForNewLP'
    },
    {
      code: 6206
      name: 'InvalidMarkTwapUpdateDetected'
      msg: 'InvalidMarkTwapUpdateDetected'
    },
    {
      code: 6207
      name: 'MarketSettlementAttemptOnActiveMarket'
      msg: 'MarketSettlementAttemptOnActiveMarket'
    },
    {
      code: 6208
      name: 'MarketSettlementRequiresSettledLP'
      msg: 'MarketSettlementRequiresSettledLP'
    },
    {
      code: 6209
      name: 'MarketSettlementAttemptTooEarly'
      msg: 'MarketSettlementAttemptTooEarly'
    },
    {
      code: 6210
      name: 'MarketSettlementTargetPriceInvalid'
      msg: 'MarketSettlementTargetPriceInvalid'
    },
    {
      code: 6211
      name: 'UnsupportedSpotMarket'
      msg: 'UnsupportedSpotMarket'
    },
    {
      code: 6212
      name: 'SpotOrdersDisabled'
      msg: 'SpotOrdersDisabled'
    },
    {
      code: 6213
      name: 'MarketBeingInitialized'
      msg: 'Market Being Initialized'
    },
    {
      code: 6214
      name: 'InvalidUserSubAccountId'
      msg: 'Invalid Sub Account Id'
    },
    {
      code: 6215
      name: 'InvalidTriggerOrderCondition'
      msg: 'Invalid Trigger Order Condition'
    },
    {
      code: 6216
      name: 'InvalidSpotPosition'
      msg: 'Invalid Spot Position'
    },
    {
      code: 6217
      name: 'CantTransferBetweenSameUserAccount'
      msg: 'Cant transfer between same user account'
    },
    {
      code: 6218
      name: 'InvalidPerpPosition'
      msg: 'Invalid Perp Position'
    },
    {
      code: 6219
      name: 'UnableToGetLimitPrice'
      msg: 'Unable To Get Limit Price'
    },
    {
      code: 6220
      name: 'InvalidLiquidation'
      msg: 'Invalid Liquidation'
    },
    {
      code: 6221
      name: 'SpotFulfillmentConfigDisabled'
      msg: 'Spot Fulfillment Config Disabled'
    },
    {
      code: 6222
      name: 'InvalidMaker'
      msg: 'Invalid Maker'
    },
    {
      code: 6223
      name: 'FailedUnwrap'
      msg: 'Failed Unwrap'
    },
    {
      code: 6224
      name: 'MaxNumberOfUsers'
      msg: 'Max Number Of Users'
    },
    {
      code: 6225
      name: 'InvalidOracleForSettlePnl'
      msg: 'InvalidOracleForSettlePnl'
    },
    {
      code: 6226
      name: 'MarginOrdersOpen'
      msg: 'MarginOrdersOpen'
    },
    {
      code: 6227
      name: 'TierViolationLiquidatingPerpPnl'
      msg: 'TierViolationLiquidatingPerpPnl'
    },
    {
      code: 6228
      name: 'CouldNotLoadUserData'
      msg: 'CouldNotLoadUserData'
    },
    {
      code: 6229
      name: 'UserWrongMutability'
      msg: 'UserWrongMutability'
    },
    {
      code: 6230
      name: 'InvalidUserAccount'
      msg: 'InvalidUserAccount'
    },
    {
      code: 6231
      name: 'CouldNotLoadUserStatsData'
      msg: 'CouldNotLoadUserData'
    },
    {
      code: 6232
      name: 'UserStatsWrongMutability'
      msg: 'UserWrongMutability'
    },
    {
      code: 6233
      name: 'InvalidUserStatsAccount'
      msg: 'InvalidUserAccount'
    },
    {
      code: 6234
      name: 'UserNotFound'
      msg: 'UserNotFound'
    },
    {
      code: 6235
      name: 'UnableToLoadUserAccount'
      msg: 'UnableToLoadUserAccount'
    },
    {
      code: 6236
      name: 'UserStatsNotFound'
      msg: 'UserStatsNotFound'
    },
    {
      code: 6237
      name: 'UnableToLoadUserStatsAccount'
      msg: 'UnableToLoadUserStatsAccount'
    },
    {
      code: 6238
      name: 'UserNotInactive'
      msg: 'User Not Inactive'
    },
    {
      code: 6239
      name: 'RevertFill'
      msg: 'RevertFill'
    },
    {
      code: 6240
      name: 'InvalidMarketAccountforDeletion'
      msg: 'Invalid MarketAccount for Deletion'
    },
    {
      code: 6241
      name: 'InvalidSpotFulfillmentParams'
      msg: 'Invalid Spot Fulfillment Params'
    },
    {
      code: 6242
      name: 'FailedToGetMint'
      msg: 'Failed to Get Mint'
    },
    {
      code: 6243
      name: 'FailedPhoenixCPI'
      msg: 'FailedPhoenixCPI'
    },
    {
      code: 6244
      name: 'FailedToDeserializePhoenixMarket'
      msg: 'FailedToDeserializePhoenixMarket'
    },
    {
      code: 6245
      name: 'InvalidPricePrecision'
      msg: 'InvalidPricePrecision'
    },
    {
      code: 6246
      name: 'InvalidPhoenixProgram'
      msg: 'InvalidPhoenixProgram'
    },
    {
      code: 6247
      name: 'InvalidPhoenixMarket'
      msg: 'InvalidPhoenixMarket'
    },
    {
      code: 6248
      name: 'InvalidSwap'
      msg: 'InvalidSwap'
    },
    {
      code: 6249
      name: 'SwapLimitPriceBreached'
      msg: 'SwapLimitPriceBreached'
    },
    {
      code: 6250
      name: 'SpotMarketReduceOnly'
      msg: 'SpotMarketReduceOnly'
    },
    {
      code: 6251
      name: 'FundingWasNotUpdated'
      msg: 'FundingWasNotUpdated'
    },
    {
      code: 6252
      name: 'ImpossibleFill'
      msg: 'ImpossibleFill'
    },
    {
      code: 6253
      name: 'CantUpdatePerpBidAskTwap'
      msg: 'CantUpdatePerpBidAskTwap'
    },
    {
      code: 6254
      name: 'UserReduceOnly'
      msg: 'UserReduceOnly'
    },
    {
      code: 6255
      name: 'InvalidMarginCalculation'
      msg: 'InvalidMarginCalculation'
    },
    {
      code: 6256
      name: 'CantPayUserInitFee'
      msg: 'CantPayUserInitFee'
    },
    {
      code: 6257
      name: 'CantReclaimRent'
      msg: 'CantReclaimRent'
    }
  ]
}

export const IDL: Drift = {
  version: '2.66.0',
  name: 'drift',
  instructions: [
    {
      name: 'initializeUser',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rent',
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
          name: 'subAccountId',
          type: 'u16',
        },
        {
          name: 'name',
          type: {
            array: ['u8', 32],
          },
        },
      ],
    },
    {
      name: 'initializeUserStats',
      accounts: [
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initializeReferrerName',
      accounts: [
        {
          name: 'referrerName',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rent',
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
          name: 'name',
          type: {
            array: ['u8', 32],
          },
        },
      ],
    },
    {
      name: 'deposit',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'spotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenAccount',
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
          name: 'marketIndex',
          type: 'u16',
        },
        {
          name: 'amount',
          type: 'u64',
        },
        {
          name: 'reduceOnly',
          type: 'bool',
        },
      ],
    },
    {
      name: 'withdraw',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'spotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userTokenAccount',
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
          name: 'marketIndex',
          type: 'u16',
        },
        {
          name: 'amount',
          type: 'u64',
        },
        {
          name: 'reduceOnly',
          type: 'bool',
        },
      ],
    },
    {
      name: 'transferDeposit',
      accounts: [
        {
          name: 'fromUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'toUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarketVault',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marketIndex',
          type: 'u16',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'placePerpOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OrderParams',
          },
        },
      ],
    },
    {
      name: 'cancelOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'orderId',
          type: {
            option: 'u32',
          },
        },
      ],
    },
    {
      name: 'cancelOrderByUserId',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'userOrderId',
          type: 'u8',
        },
      ],
    },
    {
      name: 'cancelOrders',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'marketType',
          type: {
            option: {
              defined: 'MarketType',
            },
          },
        },
        {
          name: 'marketIndex',
          type: {
            option: 'u16',
          },
        },
        {
          name: 'direction',
          type: {
            option: {
              defined: 'PositionDirection',
            },
          },
        },
      ],
    },
    {
      name: 'cancelOrdersByIds',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'orderIds',
          type: {
            vec: 'u32',
          },
        },
      ],
    },
    {
      name: 'modifyOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'orderId',
          type: {
            option: 'u32',
          },
        },
        {
          name: 'modifyOrderParams',
          type: {
            defined: 'ModifyOrderParams',
          },
        },
      ],
    },
    {
      name: 'modifyOrderByUserId',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'userOrderId',
          type: 'u8',
        },
        {
          name: 'modifyOrderParams',
          type: {
            defined: 'ModifyOrderParams',
          },
        },
      ],
    },
    {
      name: 'placeAndTakePerpOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OrderParams',
          },
        },
        {
          name: 'makerOrderId',
          type: {
            option: 'u32',
          },
        },
      ],
    },
    {
      name: 'placeAndMakePerpOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'taker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'takerStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OrderParams',
          },
        },
        {
          name: 'takerOrderId',
          type: 'u32',
        },
      ],
    },
    {
      name: 'placeSpotOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OrderParams',
          },
        },
      ],
    },
    {
      name: 'placeAndTakeSpotOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OrderParams',
          },
        },
        {
          name: 'fulfillmentType',
          type: {
            option: {
              defined: 'SpotFulfillmentType',
            },
          },
        },
        {
          name: 'makerOrderId',
          type: {
            option: 'u32',
          },
        },
      ],
    },
    {
      name: 'placeAndMakeSpotOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'taker',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'takerStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            defined: 'OrderParams',
          },
        },
        {
          name: 'takerOrderId',
          type: 'u32',
        },
        {
          name: 'fulfillmentType',
          type: {
            option: {
              defined: 'SpotFulfillmentType',
            },
          },
        },
      ],
    },
    {
      name: 'placeOrders',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'params',
          type: {
            vec: {
              defined: 'OrderParams',
            },
          },
        },
      ],
    },
    {
      name: 'beginSwap',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'outSpotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'inSpotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'outTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'inTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'instructions',
          isMut: false,
          isSigner: false,
          docs: ['Instructions Sysvar for instruction introspection'],
        },
      ],
      args: [
        {
          name: 'inMarketIndex',
          type: 'u16',
        },
        {
          name: 'outMarketIndex',
          type: 'u16',
        },
        {
          name: 'amountIn',
          type: 'u64',
        },
      ],
    },
    {
      name: 'endSwap',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'outSpotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'inSpotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'outTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'inTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'instructions',
          isMut: false,
          isSigner: false,
          docs: ['Instructions Sysvar for instruction introspection'],
        },
      ],
      args: [
        {
          name: 'inMarketIndex',
          type: 'u16',
        },
        {
          name: 'outMarketIndex',
          type: 'u16',
        },
        {
          name: 'limitPrice',
          type: {
            option: 'u64',
          },
        },
        {
          name: 'reduceOnly',
          type: {
            option: {
              defined: 'SwapReduceOnly',
            },
          },
        },
      ],
    },
    {
      name: 'addPerpLpShares',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'nShares',
          type: 'u64',
        },
        {
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'removePerpLpShares',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'sharesToBurn',
          type: 'u64',
        },
        {
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'removePerpLpSharesInExpiringMarket',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'sharesToBurn',
          type: 'u64',
        },
        {
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'updateUserName',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'subAccountId',
          type: 'u16',
        },
        {
          name: 'name',
          type: {
            array: ['u8', 32],
          },
        },
      ],
    },
    {
      name: 'updateUserCustomMarginRatio',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'subAccountId',
          type: 'u16',
        },
        {
          name: 'marginRatio',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updateUserMarginTradingEnabled',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'subAccountId',
          type: 'u16',
        },
        {
          name: 'marginTradingEnabled',
          type: 'bool',
        },
      ],
    },
    {
      name: 'updateUserDelegate',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'subAccountId',
          type: 'u16',
        },
        {
          name: 'delegate',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'updateUserReduceOnly',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'subAccountId',
          type: 'u16',
        },
        {
          name: 'reduceOnly',
          type: 'bool',
        },
      ],
    },
    {
      name: 'updateUserAdvancedLp',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'subAccountId',
          type: 'u16',
        },
        {
          name: 'advancedLp',
          type: 'bool',
        },
      ],
    },
    {
      name: 'deleteUser',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'reclaimRent',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
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
      name: 'fillPerpOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'filler',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'fillerStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'orderId',
          type: {
            option: 'u32',
          },
        },
        {
          name: 'makerOrderId',
          type: {
            option: 'u32',
          },
        },
      ],
    },
    {
      name: 'revertFill',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'filler',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'fillerStats',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'fillSpotOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'filler',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'fillerStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'orderId',
          type: {
            option: 'u32',
          },
        },
        {
          name: 'fulfillmentType',
          type: {
            option: {
              defined: 'SpotFulfillmentType',
            },
          },
        },
        {
          name: 'makerOrderId',
          type: {
            option: 'u32',
          },
        },
      ],
    },
    {
      name: 'triggerOrder',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'filler',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'orderId',
          type: 'u32',
        },
      ],
    },
    {
      name: 'forceCancelOrders',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'filler',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'updateUserIdle',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'filler',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'updateUserOpenOrdersCount',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'filler',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'adminDisableUpdatePerpBidAskTwap',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'disable',
          type: 'bool',
        },
      ],
    },
    {
      name: 'settlePnl',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'spotMarketVault',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'settleFundingPayment',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'settleLp',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'settleExpiredMarket',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'liquidatePerp',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'liquidator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidatorStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marketIndex',
          type: 'u16',
        },
        {
          name: 'liquidatorMaxBaseAssetAmount',
          type: 'u64',
        },
        {
          name: 'limitPrice',
          type: {
            option: 'u64',
          },
        },
      ],
    },
    {
      name: 'liquidateSpot',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'liquidator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidatorStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'assetMarketIndex',
          type: 'u16',
        },
        {
          name: 'liabilityMarketIndex',
          type: 'u16',
        },
        {
          name: 'liquidatorMaxLiabilityTransfer',
          type: 'u128',
        },
        {
          name: 'limitPrice',
          type: {
            option: 'u64',
          },
        },
      ],
    },
    {
      name: 'liquidateBorrowForPerpPnl',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'liquidator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidatorStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'perpMarketIndex',
          type: 'u16',
        },
        {
          name: 'spotMarketIndex',
          type: 'u16',
        },
        {
          name: 'liquidatorMaxLiabilityTransfer',
          type: 'u128',
        },
        {
          name: 'limitPrice',
          type: {
            option: 'u64',
          },
        },
      ],
    },
    {
      name: 'liquidatePerpPnlForDeposit',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'liquidator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidatorStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'perpMarketIndex',
          type: 'u16',
        },
        {
          name: 'spotMarketIndex',
          type: 'u16',
        },
        {
          name: 'liquidatorMaxPnlTransfer',
          type: 'u128',
        },
        {
          name: 'limitPrice',
          type: {
            option: 'u64',
          },
        },
      ],
    },
    {
      name: 'resolvePerpPnlDeficit',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'spotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'insuranceFundVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
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
          name: 'spotMarketIndex',
          type: 'u16',
        },
        {
          name: 'perpMarketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'resolvePerpBankruptcy',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'liquidator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidatorStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'spotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'insuranceFundVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
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
          name: 'quoteSpotMarketIndex',
          type: 'u16',
        },
        {
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'resolveSpotBankruptcy',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'liquidator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidatorStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'spotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'insuranceFundVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
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
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'settleRevenueToInsuranceFund',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'spotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceFundVault',
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
          name: 'spotMarketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'updateFundingRate',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'updatePerpBidAskTwap',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'keeperStats',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'updateSpotMarketCumulativeInterest',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarketVault',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'updateAmms',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'marketIndexes',
          type: {
            array: ['u16', 5],
          },
        },
      ],
    },
    {
      name: 'updateSpotMarketExpiry',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'expiryTs',
          type: 'i64',
        },
      ],
    },
    {
      name: 'updateUserQuoteAssetInsuranceStake',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceFundStake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'insuranceFundVault',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initializeInsuranceFundStake',
      accounts: [
        {
          name: 'spotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceFundStake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rent',
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
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'addInsuranceFundStake',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceFundStake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'spotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'insuranceFundVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userTokenAccount',
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
          name: 'marketIndex',
          type: 'u16',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'requestRemoveInsuranceFundStake',
      accounts: [
        {
          name: 'spotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceFundStake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'insuranceFundVault',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marketIndex',
          type: 'u16',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'cancelRequestRemoveInsuranceFundStake',
      accounts: [
        {
          name: 'spotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceFundStake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'insuranceFundVault',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'removeInsuranceFundStake',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceFundStake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'insuranceFundVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userTokenAccount',
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
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'transferProtocolIfShares',
      accounts: [
        {
          name: 'signer',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'transferConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'insuranceFundStake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStats',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'insuranceFundVault',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marketIndex',
          type: 'u16',
        },
        {
          name: 'shares',
          type: 'u128',
        },
      ],
    },
    {
      name: 'initialize',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quoteAssetMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
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
      name: 'initializeSpotMarket',
      accounts: [
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'spotMarketMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'insuranceFundVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
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
          name: 'optimalUtilization',
          type: 'u32',
        },
        {
          name: 'optimalBorrowRate',
          type: 'u32',
        },
        {
          name: 'maxBorrowRate',
          type: 'u32',
        },
        {
          name: 'oracleSource',
          type: {
            defined: 'OracleSource',
          },
        },
        {
          name: 'initialAssetWeight',
          type: 'u32',
        },
        {
          name: 'maintenanceAssetWeight',
          type: 'u32',
        },
        {
          name: 'initialLiabilityWeight',
          type: 'u32',
        },
        {
          name: 'maintenanceLiabilityWeight',
          type: 'u32',
        },
        {
          name: 'imfFactor',
          type: 'u32',
        },
        {
          name: 'liquidatorFee',
          type: 'u32',
        },
        {
          name: 'activeStatus',
          type: 'bool',
        },
        {
          name: 'name',
          type: {
            array: ['u8', 32],
          },
        },
      ],
    },
    {
      name: 'initializeSerumFulfillmentConfig',
      accounts: [
        {
          name: 'baseSpotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'quoteSpotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'serumProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumOpenOrders',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumFulfillmentConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rent',
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
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'updateSerumFulfillmentConfigStatus',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'serumFulfillmentConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'status',
          type: {
            defined: 'SpotFulfillmentConfigStatus',
          },
        },
      ],
    },
    {
      name: 'initializePhoenixFulfillmentConfig',
      accounts: [
        {
          name: 'baseSpotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'quoteSpotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'phoenixProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'phoenixMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'phoenixFulfillmentConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rent',
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
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'phoenixFulfillmentConfigStatus',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'phoenixFulfillmentConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'status',
          type: {
            defined: 'SpotFulfillmentConfigStatus',
          },
        },
      ],
    },
    {
      name: 'updateSerumVault',
      accounts: [
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'srmVault',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initializePerpMarket',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
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
          name: 'marketIndex',
          type: 'u16',
        },
        {
          name: 'ammBaseAssetReserve',
          type: 'u128',
        },
        {
          name: 'ammQuoteAssetReserve',
          type: 'u128',
        },
        {
          name: 'ammPeriodicity',
          type: 'i64',
        },
        {
          name: 'ammPegMultiplier',
          type: 'u128',
        },
        {
          name: 'oracleSource',
          type: {
            defined: 'OracleSource',
          },
        },
        {
          name: 'marginRatioInitial',
          type: 'u32',
        },
        {
          name: 'marginRatioMaintenance',
          type: 'u32',
        },
        {
          name: 'liquidatorFee',
          type: 'u32',
        },
        {
          name: 'activeStatus',
          type: 'bool',
        },
        {
          name: 'name',
          type: {
            array: ['u8', 32],
          },
        },
      ],
    },
    {
      name: 'deleteInitializedPerpMarket',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marketIndex',
          type: 'u16',
        },
      ],
    },
    {
      name: 'moveAmmPrice',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseAssetReserve',
          type: 'u128',
        },
        {
          name: 'quoteAssetReserve',
          type: 'u128',
        },
        {
          name: 'sqrtK',
          type: 'u128',
        },
      ],
    },
    {
      name: 'recenterPerpMarketAmm',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'pegMultiplier',
          type: 'u128',
        },
        {
          name: 'sqrtK',
          type: 'u128',
        },
      ],
    },
    {
      name: 'updatePerpMarketExpiry',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'expiryTs',
          type: 'i64',
        },
      ],
    },
    {
      name: 'settleExpiredMarketPoolsToRevenuePool',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'depositIntoPerpMarketFeePool',
      accounts: [
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'sourceVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'quoteSpotMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'spotMarketVault',
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
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'depositIntoSpotMarketRevenuePool',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'spotMarketVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenAccount',
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
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'repegAmmCurve',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
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
          name: 'newPegCandidate',
          type: 'u128',
        },
      ],
    },
    {
      name: 'updatePerpMarketAmmOracleTwap',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'resetPerpMarketAmmOracleTwap',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'updateK',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'sqrtK',
          type: 'u128',
        },
      ],
    },
    {
      name: 'updatePerpMarketMarginRatio',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marginRatioInitial',
          type: 'u32',
        },
        {
          name: 'marginRatioMaintenance',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updatePerpMarketMaxImbalances',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'unrealizedMaxImbalance',
          type: 'u64',
        },
        {
          name: 'maxRevenueWithdrawPerPeriod',
          type: 'u64',
        },
        {
          name: 'quoteMaxInsurance',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updatePerpMarketLiquidationFee',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'liquidatorFee',
          type: 'u32',
        },
        {
          name: 'ifLiquidationFee',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updateInsuranceFundUnstakingPeriod',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'insuranceFundUnstakingPeriod',
          type: 'i64',
        },
      ],
    },
    {
      name: 'updateSpotMarketLiquidationFee',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'liquidatorFee',
          type: 'u32',
        },
        {
          name: 'ifLiquidationFee',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updateWithdrawGuardThreshold',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'withdrawGuardThreshold',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updateSpotMarketIfFactor',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'spotMarketIndex',
          type: 'u16',
        },
        {
          name: 'userIfFactor',
          type: 'u32',
        },
        {
          name: 'totalIfFactor',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updateSpotMarketRevenueSettlePeriod',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'revenueSettlePeriod',
          type: 'i64',
        },
      ],
    },
    {
      name: 'updateSpotMarketStatus',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'status',
          type: {
            defined: 'MarketStatus',
          },
        },
      ],
    },
    {
      name: 'updateSpotMarketPausedOperations',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'pausedOperations',
          type: 'u8',
        },
      ],
    },
    {
      name: 'updateSpotMarketAssetTier',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'assetTier',
          type: {
            defined: 'AssetTier',
          },
        },
      ],
    },
    {
      name: 'updateSpotMarketMarginWeights',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'initialAssetWeight',
          type: 'u32',
        },
        {
          name: 'maintenanceAssetWeight',
          type: 'u32',
        },
        {
          name: 'initialLiabilityWeight',
          type: 'u32',
        },
        {
          name: 'maintenanceLiabilityWeight',
          type: 'u32',
        },
        {
          name: 'imfFactor',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updateSpotMarketBorrowRate',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'optimalUtilization',
          type: 'u32',
        },
        {
          name: 'optimalBorrowRate',
          type: 'u32',
        },
        {
          name: 'maxBorrowRate',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updateSpotMarketMaxTokenDeposits',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'maxTokenDeposits',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updateSpotMarketScaleInitialAssetWeightStart',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'scaleInitialAssetWeightStart',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updateSpotMarketOracle',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'oracle',
          type: 'publicKey',
        },
        {
          name: 'oracleSource',
          type: {
            defined: 'OracleSource',
          },
        },
      ],
    },
    {
      name: 'updateSpotMarketStepSizeAndTickSize',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'stepSize',
          type: 'u64',
        },
        {
          name: 'tickSize',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updateSpotMarketMinOrderSize',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'orderSize',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updateSpotMarketOrdersEnabled',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'ordersEnabled',
          type: 'bool',
        },
      ],
    },
    {
      name: 'updateSpotMarketName',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'name',
          type: {
            array: ['u8', 32],
          },
        },
      ],
    },
    {
      name: 'updatePerpMarketStatus',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'status',
          type: {
            defined: 'MarketStatus',
          },
        },
      ],
    },
    {
      name: 'updatePerpMarketPausedOperations',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'pausedOperations',
          type: 'u8',
        },
      ],
    },
    {
      name: 'updatePerpMarketContractTier',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'contractTier',
          type: {
            defined: 'ContractTier',
          },
        },
      ],
    },
    {
      name: 'updatePerpMarketImfFactor',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'imfFactor',
          type: 'u32',
        },
        {
          name: 'unrealizedPnlImfFactor',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updatePerpMarketUnrealizedAssetWeight',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'unrealizedInitialAssetWeight',
          type: 'u32',
        },
        {
          name: 'unrealizedMaintenanceAssetWeight',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updatePerpMarketConcentrationCoef',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'concentrationScale',
          type: 'u128',
        },
      ],
    },
    {
      name: 'updatePerpMarketCurveUpdateIntensity',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'curveUpdateIntensity',
          type: 'u8',
        },
      ],
    },
    {
      name: 'updatePerpMarketTargetBaseAssetAmountPerLp',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'targetBaseAssetAmountPerLp',
          type: 'i32',
        },
      ],
    },
    {
      name: 'updatePerpMarketPerLpBase',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'perLpBase',
          type: 'i8',
        },
      ],
    },
    {
      name: 'updateLpCooldownTime',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'lpCooldownTime',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updatePerpFeeStructure',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'feeStructure',
          type: {
            defined: 'FeeStructure',
          },
        },
      ],
    },
    {
      name: 'updateSpotFeeStructure',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'feeStructure',
          type: {
            defined: 'FeeStructure',
          },
        },
      ],
    },
    {
      name: 'updateInitialPctToLiquidate',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'initialPctToLiquidate',
          type: 'u16',
        },
      ],
    },
    {
      name: 'updateLiquidationDuration',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'liquidationDuration',
          type: 'u8',
        },
      ],
    },
    {
      name: 'updateLiquidationMarginBufferRatio',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'liquidationMarginBufferRatio',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updateOracleGuardRails',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'oracleGuardRails',
          type: {
            defined: 'OracleGuardRails',
          },
        },
      ],
    },
    {
      name: 'updateStateSettlementDuration',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'settlementDuration',
          type: 'u16',
        },
      ],
    },
    {
      name: 'updateStateMaxNumberOfSubAccounts',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'maxNumberOfSubAccounts',
          type: 'u16',
        },
      ],
    },
    {
      name: 'updateStateMaxInitializeUserFee',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'maxInitializeUserFee',
          type: 'u16',
        },
      ],
    },
    {
      name: 'updatePerpMarketOracle',
      accounts: [
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'oracle',
          isMut: false,
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
          name: 'oracle',
          type: 'publicKey',
        },
        {
          name: 'oracleSource',
          type: {
            defined: 'OracleSource',
          },
        },
      ],
    },
    {
      name: 'updatePerpMarketBaseSpread',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseSpread',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updateAmmJitIntensity',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'ammJitIntensity',
          type: 'u8',
        },
      ],
    },
    {
      name: 'updatePerpMarketMaxSpread',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'maxSpread',
          type: 'u32',
        },
      ],
    },
    {
      name: 'updatePerpMarketStepSizeAndTickSize',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'stepSize',
          type: 'u64',
        },
        {
          name: 'tickSize',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updatePerpMarketName',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'name',
          type: {
            array: ['u8', 32],
          },
        },
      ],
    },
    {
      name: 'updatePerpMarketMinOrderSize',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'orderSize',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updatePerpMarketMaxSlippageRatio',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'maxSlippageRatio',
          type: 'u16',
        },
      ],
    },
    {
      name: 'updatePerpMarketMaxFillReserveFraction',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'maxFillReserveFraction',
          type: 'u16',
        },
      ],
    },
    {
      name: 'updatePerpMarketMaxOpenInterest',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'maxOpenInterest',
          type: 'u128',
        },
      ],
    },
    {
      name: 'updatePerpMarketFeeAdjustment',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'perpMarket',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'feeAdjustment',
          type: 'i16',
        },
      ],
    },
    {
      name: 'updateAdmin',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'admin',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'updateWhitelistMint',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'whitelistMint',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'updateDiscountMint',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'discountMint',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'updateExchangeStatus',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'exchangeStatus',
          type: 'u8',
        },
      ],
    },
    {
      name: 'updatePerpAuctionDuration',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'minPerpAuctionDuration',
          type: 'u8',
        },
      ],
    },
    {
      name: 'updateSpotAuctionDuration',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'defaultSpotAuctionDuration',
          type: 'u8',
        },
      ],
    },
    {
      name: 'adminRemoveInsuranceFundStake',
      accounts: [
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'spotMarket',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceFundVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'driftSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'adminTokenAccount',
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
          name: 'marketIndex',
          type: 'u16',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'initializeProtocolIfSharesTransferConfig',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'protocolIfSharesTransferConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'updateProtocolIfSharesTransferConfig',
      accounts: [
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'protocolIfSharesTransferConfig',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'state',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'whitelistedSigners',
          type: {
            option: {
              array: ['publicKey', 4],
            },
          },
        },
        {
          name: 'maxTransferPerEpoch',
          type: {
            option: 'u128',
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'phoenixV1FulfillmentConfig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pubkey',
            type: 'publicKey',
          },
          {
            name: 'phoenixProgramId',
            type: 'publicKey',
          },
          {
            name: 'phoenixLogAuthority',
            type: 'publicKey',
          },
          {
            name: 'phoenixMarket',
            type: 'publicKey',
          },
          {
            name: 'phoenixBaseVault',
            type: 'publicKey',
          },
          {
            name: 'phoenixQuoteVault',
            type: 'publicKey',
          },
          {
            name: 'marketIndex',
            type: 'u16',
          },
          {
            name: 'fulfillmentType',
            type: {
              defined: 'SpotFulfillmentType',
            },
          },
          {
            name: 'status',
            type: {
              defined: 'SpotFulfillmentConfigStatus',
            },
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 4],
            },
          },
        ],
      },
    },
    {
      name: 'serumV3FulfillmentConfig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pubkey',
            type: 'publicKey',
          },
          {
            name: 'serumProgramId',
            type: 'publicKey',
          },
          {
            name: 'serumMarket',
            type: 'publicKey',
          },
          {
            name: 'serumRequestQueue',
            type: 'publicKey',
          },
          {
            name: 'serumEventQueue',
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
            name: 'serumBaseVault',
            type: 'publicKey',
          },
          {
            name: 'serumQuoteVault',
            type: 'publicKey',
          },
          {
            name: 'serumOpenOrders',
            type: 'publicKey',
          },
          {
            name: 'serumSignerNonce',
            type: 'u64',
          },
          {
            name: 'marketIndex',
            type: 'u16',
          },
          {
            name: 'fulfillmentType',
            type: {
              defined: 'SpotFulfillmentType',
            },
          },
          {
            name: 'status',
            type: {
              defined: 'SpotFulfillmentConfigStatus',
            },
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 4],
            },
          },
        ],
      },
    },
    {
      name: 'insuranceFundStake',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'ifShares',
            type: 'u128',
          },
          {
            name: 'lastWithdrawRequestShares',
            type: 'u128',
          },
          {
            name: 'ifBase',
            type: 'u128',
          },
          {
            name: 'lastValidTs',
            type: 'i64',
          },
          {
            name: 'lastWithdrawRequestValue',
            type: 'u64',
          },
          {
            name: 'lastWithdrawRequestTs',
            type: 'i64',
          },
          {
            name: 'costBasis',
            type: 'i64',
          },
          {
            name: 'marketIndex',
            type: 'u16',
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 14],
            },
          },
        ],
      },
    },
    {
      name: 'protocolIfSharesTransferConfig',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'whitelistedSigners',
            type: {
              array: ['publicKey', 4],
            },
          },
          {
            name: 'maxTransferPerEpoch',
            type: 'u128',
          },
          {
            name: 'currentEpochTransfer',
            type: 'u128',
          },
          {
            name: 'nextEpochTs',
            type: 'i64',
          },
          {
            name: 'padding',
            type: {
              array: ['u128', 8],
            },
          },
        ],
      },
    },
    {
      name: 'perpMarket',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pubkey',
            docs: [
              "The perp market's address. It is a pda of the market index",
            ],
            type: 'publicKey',
          },
          {
            name: 'amm',
            docs: ['The automated market maker'],
            type: {
              defined: 'AMM',
            },
          },
          {
            name: 'pnlPool',
            docs: [
              "The market's pnl pool. When users settle negative pnl, the balance increases.",
              'When users settle positive pnl, the balance decreases. Can not go negative.',
            ],
            type: {
              defined: 'PoolBalance',
            },
          },
          {
            name: 'name',
            docs: ['Encoded display name for the perp market e.g. SOL-PERP'],
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'insuranceClaim',
            docs: ["The perp market's claim on the insurance fund"],
            type: {
              defined: 'InsuranceClaim',
            },
          },
          {
            name: 'unrealizedPnlMaxImbalance',
            docs: [
              'The max pnl imbalance before positive pnl asset weight is discounted',
              "pnl imbalance is the difference between long and short pnl. When it's greater than 0,",
              'the amm has negative pnl and the initial asset weight for positive pnl is discounted',
              'precision = QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'expiryTs',
            docs: [
              'The ts when the market will be expired. Only set if market is in reduce only mode',
            ],
            type: 'i64',
          },
          {
            name: 'expiryPrice',
            docs: [
              'The price at which positions will be settled. Only set if market is expired',
              'precision = PRICE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'nextFillRecordId',
            docs: [
              'Every trade has a fill record id. This is the next id to be used',
            ],
            type: 'u64',
          },
          {
            name: 'nextFundingRateRecordId',
            docs: [
              'Every funding rate update has a record id. This is the next id to be used',
            ],
            type: 'u64',
          },
          {
            name: 'nextCurveRecordId',
            docs: [
              'Every amm k updated has a record id. This is the next id to be used',
            ],
            type: 'u64',
          },
          {
            name: 'imfFactor',
            docs: [
              'The initial margin fraction factor. Used to increase margin ratio for large positions',
              'precision: MARGIN_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'unrealizedPnlImfFactor',
            docs: [
              'The imf factor for unrealized pnl. Used to discount asset weight for large positive pnl',
              'precision: MARGIN_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'liquidatorFee',
            docs: [
              'The fee the liquidator is paid for taking over perp position',
              'precision: LIQUIDATOR_FEE_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'ifLiquidationFee',
            docs: [
              'The fee the insurance fund receives from liquidation',
              'precision: LIQUIDATOR_FEE_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'marginRatioInitial',
            docs: [
              'The margin ratio which determines how much collateral is required to open a position',
              'e.g. margin ratio of .1 means a user must have $100 of total collateral to open a $1000 position',
              'precision: MARGIN_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'marginRatioMaintenance',
            docs: [
              'The margin ratio which determines when a user will be liquidated',
              'e.g. margin ratio of .05 means a user must have $50 of total collateral to maintain a $1000 position',
              'else they will be liquidated',
              'precision: MARGIN_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'unrealizedPnlInitialAssetWeight',
            docs: [
              'The initial asset weight for positive pnl. Negative pnl always has an asset weight of 1',
              'precision: SPOT_WEIGHT_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'unrealizedPnlMaintenanceAssetWeight',
            docs: [
              'The maintenance asset weight for positive pnl. Negative pnl always has an asset weight of 1',
              'precision: SPOT_WEIGHT_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'numberOfUsersWithBase',
            docs: ['number of users in a position (base)'],
            type: 'u32',
          },
          {
            name: 'numberOfUsers',
            docs: ['number of users in a position (pnl) or pnl (quote)'],
            type: 'u32',
          },
          {
            name: 'marketIndex',
            type: 'u16',
          },
          {
            name: 'status',
            docs: [
              'Whether a market is active, reduce only, expired, etc',
              'Affects whether users can open/close positions',
            ],
            type: {
              defined: 'MarketStatus',
            },
          },
          {
            name: 'contractType',
            docs: ['Currently only Perpetual markets are supported'],
            type: {
              defined: 'ContractType',
            },
          },
          {
            name: 'contractTier',
            docs: [
              'The contract tier determines how much insurance a market can receive, with more speculative markets receiving less insurance',
              'It also influences the order perp markets can be liquidated, with less speculative markets being liquidated first',
            ],
            type: {
              defined: 'ContractTier',
            },
          },
          {
            name: 'pausedOperations',
            type: 'u8',
          },
          {
            name: 'quoteSpotMarketIndex',
            docs: ['The spot market that pnl is settled in'],
            type: 'u16',
          },
          {
            name: 'feeAdjustment',
            docs: [
              'Between -100 and 100, represents what % to increase/decrease the fee by',
              'E.g. if this is -50 and the fee is 5bps, the new fee will be 2.5bps',
              'if this is 50 and the fee is 5bps, the new fee will be 7.5bps',
            ],
            type: 'i16',
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 46],
            },
          },
        ],
      },
    },
    {
      name: 'spotMarket',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pubkey',
            docs: [
              'The address of the spot market. It is a pda of the market index',
            ],
            type: 'publicKey',
          },
          {
            name: 'oracle',
            docs: ['The oracle used to price the markets deposits/borrows'],
            type: 'publicKey',
          },
          {
            name: 'mint',
            docs: ['The token mint of the market'],
            type: 'publicKey',
          },
          {
            name: 'vault',
            docs: [
              "The vault used to store the market's deposits",
              'The amount in the vault should be equal to or greater than deposits - borrows',
            ],
            type: 'publicKey',
          },
          {
            name: 'name',
            docs: ['The encoded display name for the market e.g. SOL'],
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'historicalOracleData',
            type: {
              defined: 'HistoricalOracleData',
            },
          },
          {
            name: 'historicalIndexData',
            type: {
              defined: 'HistoricalIndexData',
            },
          },
          {
            name: 'revenuePool',
            docs: [
              'Revenue the protocol has collected in this markets token',
              'e.g. for SOL-PERP, funds can be settled in usdc and will flow into the USDC revenue pool',
            ],
            type: {
              defined: 'PoolBalance',
            },
          },
          {
            name: 'spotFeePool',
            docs: [
              'The fees collected from swaps between this market and the quote market',
              'Is settled to the quote markets revenue pool',
            ],
            type: {
              defined: 'PoolBalance',
            },
          },
          {
            name: 'insuranceFund',
            docs: [
              'Details on the insurance fund covering bankruptcies in this markets token',
              'Covers bankruptcies for borrows with this markets token and perps settling in this markets token',
            ],
            type: {
              defined: 'InsuranceFund',
            },
          },
          {
            name: 'totalSpotFee',
            docs: [
              'The total spot fees collected for this market',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'depositBalance',
            docs: [
              'The sum of the scaled balances for deposits across users and pool balances',
              'To convert to the deposit token amount, multiply by the cumulative deposit interest',
              'precision: SPOT_BALANCE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'borrowBalance',
            docs: [
              'The sum of the scaled balances for borrows across users and pool balances',
              'To convert to the borrow token amount, multiply by the cumulative borrow interest',
              'precision: SPOT_BALANCE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'cumulativeDepositInterest',
            docs: [
              'The cumulative interest earned by depositors',
              'Used to calculate the deposit token amount from the deposit balance',
              'precision: SPOT_CUMULATIVE_INTEREST_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'cumulativeBorrowInterest',
            docs: [
              'The cumulative interest earned by borrowers',
              'Used to calculate the borrow token amount from the borrow balance',
              'precision: SPOT_CUMULATIVE_INTEREST_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'totalSocialLoss',
            docs: [
              "The total socialized loss from borrows, in the mint's token",
              'precision: token mint precision',
            ],
            type: 'u128',
          },
          {
            name: 'totalQuoteSocialLoss',
            docs: [
              "The total socialized loss from borrows, in the quote market's token",
              'preicision: QUOTE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'withdrawGuardThreshold',
            docs: [
              'no withdraw limits/guards when deposits below this threshold',
              'precision: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'maxTokenDeposits',
            docs: [
              'The max amount of token deposits in this market',
              '0 if there is no limit',
              'precision: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'depositTokenTwap',
            docs: [
              '24hr average of deposit token amount',
              'precision: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'borrowTokenTwap',
            docs: [
              '24hr average of borrow token amount',
              'precision: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'utilizationTwap',
            docs: [
              '24hr average of utilization',
              'which is borrow amount over token amount',
              'precision: SPOT_UTILIZATION_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'lastInterestTs',
            docs: [
              'Last time the cumulative deposit and borrow interest was updated',
            ],
            type: 'u64',
          },
          {
            name: 'lastTwapTs',
            docs: [
              'Last time the deposit/borrow/utilization averages were updated',
            ],
            type: 'u64',
          },
          {
            name: 'expiryTs',
            docs: [
              'The time the market is set to expire. Only set if market is in reduce only mode',
            ],
            type: 'i64',
          },
          {
            name: 'orderStepSize',
            docs: [
              'Spot orders must be a multiple of the step size',
              'precision: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'orderTickSize',
            docs: [
              'Spot orders must be a multiple of the tick size',
              'precision: PRICE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'minOrderSize',
            docs: ['The minimum order size', 'precision: token mint precision'],
            type: 'u64',
          },
          {
            name: 'maxPositionSize',
            docs: [
              'The maximum spot position size',
              'if the limit is 0, there is no limit',
              'precision: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'nextFillRecordId',
            docs: [
              'Every spot trade has a fill record id. This is the next id to use',
            ],
            type: 'u64',
          },
          {
            name: 'nextDepositRecordId',
            docs: [
              'Every deposit has a deposit record id. This is the next id to use',
            ],
            type: 'u64',
          },
          {
            name: 'initialAssetWeight',
            docs: [
              'The initial asset weight used to calculate a deposits contribution to a users initial total collateral',
              'e.g. if the asset weight is .8, $100 of deposits contributes $80 to the users initial total collateral',
              'precision: SPOT_WEIGHT_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'maintenanceAssetWeight',
            docs: [
              'The maintenance asset weight used to calculate a deposits contribution to a users maintenance total collateral',
              'e.g. if the asset weight is .9, $100 of deposits contributes $90 to the users maintenance total collateral',
              'precision: SPOT_WEIGHT_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'initialLiabilityWeight',
            docs: [
              'The initial liability weight used to calculate a borrows contribution to a users initial margin requirement',
              'e.g. if the liability weight is .9, $100 of borrows contributes $90 to the users initial margin requirement',
              'precision: SPOT_WEIGHT_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'maintenanceLiabilityWeight',
            docs: [
              'The maintenance liability weight used to calculate a borrows contribution to a users maintenance margin requirement',
              'e.g. if the liability weight is .8, $100 of borrows contributes $80 to the users maintenance margin requirement',
              'precision: SPOT_WEIGHT_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'imfFactor',
            docs: [
              'The initial margin fraction factor. Used to increase liability weight/decrease asset weight for large positions',
              'precision: MARGIN_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'liquidatorFee',
            docs: [
              'The fee the liquidator is paid for taking over borrow/deposit',
              'precision: LIQUIDATOR_FEE_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'ifLiquidationFee',
            docs: [
              'The fee the insurance fund receives from liquidation',
              'precision: LIQUIDATOR_FEE_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'optimalUtilization',
            docs: [
              'The optimal utilization rate for this market.',
              'Used to determine the markets borrow rate',
              'precision: SPOT_UTILIZATION_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'optimalBorrowRate',
            docs: [
              'The borrow rate for this market when the market has optimal utilization',
              'precision: SPOT_RATE_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'maxBorrowRate',
            docs: [
              'The borrow rate for this market when the market has 1000 utilization',
              'precision: SPOT_RATE_PRECISION',
            ],
            type: 'u32',
          },
          {
            name: 'decimals',
            docs: [
              "The market's token mint's decimals. To from decimals to a precision, 10^decimals",
            ],
            type: 'u32',
          },
          {
            name: 'marketIndex',
            type: 'u16',
          },
          {
            name: 'ordersEnabled',
            docs: ['Whether or not spot trading is enabled'],
            type: 'bool',
          },
          {
            name: 'oracleSource',
            type: {
              defined: 'OracleSource',
            },
          },
          {
            name: 'status',
            type: {
              defined: 'MarketStatus',
            },
          },
          {
            name: 'assetTier',
            docs: [
              'The asset tier affects how a deposit can be used as collateral and the priority for a borrow being liquidated',
            ],
            type: {
              defined: 'AssetTier',
            },
          },
          {
            name: 'pausedOperations',
            type: 'u8',
          },
          {
            name: 'padding1',
            type: {
              array: ['u8', 5],
            },
          },
          {
            name: 'flashLoanAmount',
            docs: [
              'For swaps, the amount of token loaned out in the begin_swap ix',
              'precision: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'flashLoanInitialTokenAmount',
            docs: [
              'For swaps, the amount in the users token account in the begin_swap ix',
              'Used to calculate how much of the token left the system in end_swap ix',
              'precision: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'totalSwapFee',
            docs: [
              'The total fees received from swaps',
              'precision: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'scaleInitialAssetWeightStart',
            docs: [
              'When to begin scaling down the initial asset weight',
              'disabled when 0',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 48],
            },
          },
        ],
      },
    },
    {
      name: 'state',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'admin',
            type: 'publicKey',
          },
          {
            name: 'whitelistMint',
            type: 'publicKey',
          },
          {
            name: 'discountMint',
            type: 'publicKey',
          },
          {
            name: 'signer',
            type: 'publicKey',
          },
          {
            name: 'srmVault',
            type: 'publicKey',
          },
          {
            name: 'perpFeeStructure',
            type: {
              defined: 'FeeStructure',
            },
          },
          {
            name: 'spotFeeStructure',
            type: {
              defined: 'FeeStructure',
            },
          },
          {
            name: 'oracleGuardRails',
            type: {
              defined: 'OracleGuardRails',
            },
          },
          {
            name: 'numberOfAuthorities',
            type: 'u64',
          },
          {
            name: 'numberOfSubAccounts',
            type: 'u64',
          },
          {
            name: 'lpCooldownTime',
            type: 'u64',
          },
          {
            name: 'liquidationMarginBufferRatio',
            type: 'u32',
          },
          {
            name: 'settlementDuration',
            type: 'u16',
          },
          {
            name: 'numberOfMarkets',
            type: 'u16',
          },
          {
            name: 'numberOfSpotMarkets',
            type: 'u16',
          },
          {
            name: 'signerNonce',
            type: 'u8',
          },
          {
            name: 'minPerpAuctionDuration',
            type: 'u8',
          },
          {
            name: 'defaultMarketOrderTimeInForce',
            type: 'u8',
          },
          {
            name: 'defaultSpotAuctionDuration',
            type: 'u8',
          },
          {
            name: 'exchangeStatus',
            type: 'u8',
          },
          {
            name: 'liquidationDuration',
            type: 'u8',
          },
          {
            name: 'initialPctToLiquidate',
            type: 'u16',
          },
          {
            name: 'maxNumberOfSubAccounts',
            type: 'u16',
          },
          {
            name: 'maxInitializeUserFee',
            type: 'u16',
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 10],
            },
          },
        ],
      },
    },
    {
      name: 'user',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            docs: ['The owner/authority of the account'],
            type: 'publicKey',
          },
          {
            name: 'delegate',
            docs: [
              "An addresses that can control the account on the authority's behalf. Has limited power, cant withdraw",
            ],
            type: 'publicKey',
          },
          {
            name: 'name',
            docs: ['Encoded display name e.g. "toly"'],
            type: {
              array: ['u8', 32],
            },
          },
          {
            name: 'spotPositions',
            docs: ["The user's spot positions"],
            type: {
              array: [
                {
                  defined: 'SpotPosition',
                },
                8,
              ],
            },
          },
          {
            name: 'perpPositions',
            docs: ["The user's perp positions"],
            type: {
              array: [
                {
                  defined: 'PerpPosition',
                },
                8,
              ],
            },
          },
          {
            name: 'orders',
            docs: ["The user's orders"],
            type: {
              array: [
                {
                  defined: 'Order',
                },
                32,
              ],
            },
          },
          {
            name: 'lastAddPerpLpSharesTs',
            docs: ['The last time the user added perp lp positions'],
            type: 'i64',
          },
          {
            name: 'totalDeposits',
            docs: [
              'The total values of deposits the user has made',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'totalWithdraws',
            docs: [
              'The total values of withdrawals the user has made',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'totalSocialLoss',
            docs: [
              'The total socialized loss the users has incurred upon the protocol',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'settledPerpPnl',
            docs: [
              'Fees (taker fees, maker rebate, referrer reward, filler reward) and pnl for perps',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'cumulativeSpotFees',
            docs: [
              'Fees (taker fees, maker rebate, filler reward) for spot',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'cumulativePerpFunding',
            docs: [
              'Cumulative funding paid/received for perps',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'liquidationMarginFreed',
            docs: [
              'The amount of margin freed during liquidation. Used to force the liquidation to occur over a period of time',
              'Defaults to zero when not being liquidated',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'lastActiveSlot',
            docs: [
              'The last slot a user was active. Used to determine if a user is idle',
            ],
            type: 'u64',
          },
          {
            name: 'nextOrderId',
            docs: [
              'Every user order has an order id. This is the next order id to be used',
            ],
            type: 'u32',
          },
          {
            name: 'maxMarginRatio',
            docs: ['Custom max initial margin ratio for the user'],
            type: 'u32',
          },
          {
            name: 'nextLiquidationId',
            docs: ['The next liquidation id to be used for user'],
            type: 'u16',
          },
          {
            name: 'subAccountId',
            docs: ['The sub account id for this user'],
            type: 'u16',
          },
          {
            name: 'status',
            docs: ['Whether the user is active, being liquidated or bankrupt'],
            type: 'u8',
          },
          {
            name: 'isMarginTradingEnabled',
            docs: ['Whether the user has enabled margin trading'],
            type: 'bool',
          },
          {
            name: 'idle',
            docs: [
              "User is idle if they haven't interacted with the protocol in 1 week and they have no orders, perp positions or borrows",
              'Off-chain keeper bots can ignore users that are idle',
            ],
            type: 'bool',
          },
          {
            name: 'openOrders',
            docs: ['number of open orders'],
            type: 'u8',
          },
          {
            name: 'hasOpenOrder',
            docs: ['Whether or not user has open order'],
            type: 'bool',
          },
          {
            name: 'openAuctions',
            docs: ['number of open orders with auction'],
            type: 'u8',
          },
          {
            name: 'hasOpenAuction',
            docs: ['Whether or not user has open order with auction'],
            type: 'bool',
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 21],
            },
          },
        ],
      },
    },
    {
      name: 'userStats',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            docs: ['The authority for all of a users sub accounts'],
            type: 'publicKey',
          },
          {
            name: 'referrer',
            docs: ['The address that referred this user'],
            type: 'publicKey',
          },
          {
            name: 'fees',
            docs: ['Stats on the fees paid by the user'],
            type: {
              defined: 'UserFees',
            },
          },
          {
            name: 'nextEpochTs',
            docs: [
              'The timestamp of the next epoch',
              'Epoch is used to limit referrer rewards earned in single epoch',
            ],
            type: 'i64',
          },
          {
            name: 'makerVolume30d',
            docs: [
              'Rolling 30day maker volume for user',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'takerVolume30d',
            docs: [
              'Rolling 30day taker volume for user',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'fillerVolume30d',
            docs: [
              'Rolling 30day filler volume for user',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'lastMakerVolume30dTs',
            docs: ['last time the maker volume was updated'],
            type: 'i64',
          },
          {
            name: 'lastTakerVolume30dTs',
            docs: ['last time the taker volume was updated'],
            type: 'i64',
          },
          {
            name: 'lastFillerVolume30dTs',
            docs: ['last time the filler volume was updated'],
            type: 'i64',
          },
          {
            name: 'ifStakedQuoteAssetAmount',
            docs: ['The amount of tokens staked in the quote spot markets if'],
            type: 'u64',
          },
          {
            name: 'numberOfSubAccounts',
            docs: ['The current number of sub accounts'],
            type: 'u16',
          },
          {
            name: 'numberOfSubAccountsCreated',
            docs: [
              'The number of sub accounts created. Can be greater than the number of sub accounts if user',
              'has deleted sub accounts',
            ],
            type: 'u16',
          },
          {
            name: 'isReferrer',
            docs: [
              'Whether the user is a referrer. Sub account 0 can not be deleted if user is a referrer',
            ],
            type: 'bool',
          },
          {
            name: 'disableUpdatePerpBidAskTwap',
            type: 'bool',
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 50],
            },
          },
        ],
      },
    },
    {
      name: 'referrerName',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'user',
            type: 'publicKey',
          },
          {
            name: 'userStats',
            type: 'publicKey',
          },
          {
            name: 'name',
            type: {
              array: ['u8', 32],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'LiquidatePerpRecord',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'marketIndex',
            type: 'u16',
          },
          {
            name: 'oraclePrice',
            type: 'i64',
          },
          {
            name: 'baseAssetAmount',
            type: 'i64',
          },
          {
            name: 'quoteAssetAmount',
            type: 'i64',
          },
          {
            name: 'lpShares',
            docs: ['precision: AMM_RESERVE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'fillRecordId',
            type: 'u64',
          },
          {
            name: 'userOrderId',
            type: 'u32',
          },
          {
            name: 'liquidatorOrderId',
            type: 'u32',
          },
          {
            name: 'liquidatorFee',
            docs: ['precision: QUOTE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'ifFee',
            docs: ['precision: QUOTE_PRECISION'],
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'LiquidateSpotRecord',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'assetMarketIndex',
            type: 'u16',
          },
          {
            name: 'assetPrice',
            type: 'i64',
          },
          {
            name: 'assetTransfer',
            type: 'u128',
          },
          {
            name: 'liabilityMarketIndex',
            type: 'u16',
          },
          {
            name: 'liabilityPrice',
            type: 'i64',
          },
          {
            name: 'liabilityTransfer',
            docs: ['precision: token mint precision'],
            type: 'u128',
          },
          {
            name: 'ifFee',
            docs: ['precision: token mint precision'],
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'LiquidateBorrowForPerpPnlRecord',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'perpMarketIndex',
            type: 'u16',
          },
          {
            name: 'marketOraclePrice',
            type: 'i64',
          },
          {
            name: 'pnlTransfer',
            type: 'u128',
          },
          {
            name: 'liabilityMarketIndex',
            type: 'u16',
          },
          {
            name: 'liabilityPrice',
            type: 'i64',
          },
          {
            name: 'liabilityTransfer',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'LiquidatePerpPnlForDepositRecord',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'perpMarketIndex',
            type: 'u16',
          },
          {
            name: 'marketOraclePrice',
            type: 'i64',
          },
          {
            name: 'pnlTransfer',
            type: 'u128',
          },
          {
            name: 'assetMarketIndex',
            type: 'u16',
          },
          {
            name: 'assetPrice',
            type: 'i64',
          },
          {
            name: 'assetTransfer',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'PerpBankruptcyRecord',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'marketIndex',
            type: 'u16',
          },
          {
            name: 'pnl',
            type: 'i128',
          },
          {
            name: 'ifPayment',
            type: 'u128',
          },
          {
            name: 'clawbackUser',
            type: {
              option: 'publicKey',
            },
          },
          {
            name: 'clawbackUserPayment',
            type: {
              option: 'u128',
            },
          },
          {
            name: 'cumulativeFundingRateDelta',
            type: 'i128',
          },
        ],
      },
    },
    {
      name: 'SpotBankruptcyRecord',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'marketIndex',
            type: 'u16',
          },
          {
            name: 'borrowAmount',
            type: 'u128',
          },
          {
            name: 'ifPayment',
            type: 'u128',
          },
          {
            name: 'cumulativeDepositInterestDelta',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'MarketIdentifier',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'marketType',
            type: {
              defined: 'MarketType',
            },
          },
          {
            name: 'marketIndex',
            type: 'u16',
          },
        ],
      },
    },
    {
      name: 'HistoricalOracleData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lastOraclePrice',
            docs: ['precision: PRICE_PRECISION'],
            type: 'i64',
          },
          {
            name: 'lastOracleConf',
            docs: ['precision: PRICE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'lastOracleDelay',
            docs: ['number of slots since last update'],
            type: 'i64',
          },
          {
            name: 'lastOraclePriceTwap',
            docs: ['precision: PRICE_PRECISION'],
            type: 'i64',
          },
          {
            name: 'lastOraclePriceTwap5min',
            docs: ['precision: PRICE_PRECISION'],
            type: 'i64',
          },
          {
            name: 'lastOraclePriceTwapTs',
            docs: ['unix_timestamp of last snapshot'],
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'HistoricalIndexData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lastIndexBidPrice',
            docs: ['precision: PRICE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'lastIndexAskPrice',
            docs: ['precision: PRICE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'lastIndexPriceTwap',
            docs: ['precision: PRICE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'lastIndexPriceTwap5min',
            docs: ['precision: PRICE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'lastIndexPriceTwapTs',
            docs: ['unix_timestamp of last snapshot'],
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'OrderParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'orderType',
            type: {
              defined: 'OrderType',
            },
          },
          {
            name: 'marketType',
            type: {
              defined: 'MarketType',
            },
          },
          {
            name: 'direction',
            type: {
              defined: 'PositionDirection',
            },
          },
          {
            name: 'userOrderId',
            type: 'u8',
          },
          {
            name: 'baseAssetAmount',
            type: 'u64',
          },
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'marketIndex',
            type: 'u16',
          },
          {
            name: 'reduceOnly',
            type: 'bool',
          },
          {
            name: 'postOnly',
            type: {
              defined: 'PostOnlyParam',
            },
          },
          {
            name: 'immediateOrCancel',
            type: 'bool',
          },
          {
            name: 'maxTs',
            type: {
              option: 'i64',
            },
          },
          {
            name: 'triggerPrice',
            type: {
              option: 'u64',
            },
          },
          {
            name: 'triggerCondition',
            type: {
              defined: 'OrderTriggerCondition',
            },
          },
          {
            name: 'oraclePriceOffset',
            type: {
              option: 'i32',
            },
          },
          {
            name: 'auctionDuration',
            type: {
              option: 'u8',
            },
          },
          {
            name: 'auctionStartPrice',
            type: {
              option: 'i64',
            },
          },
          {
            name: 'auctionEndPrice',
            type: {
              option: 'i64',
            },
          },
        ],
      },
    },
    {
      name: 'ModifyOrderParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'direction',
            type: {
              option: {
                defined: 'PositionDirection',
              },
            },
          },
          {
            name: 'baseAssetAmount',
            type: {
              option: 'u64',
            },
          },
          {
            name: 'price',
            type: {
              option: 'u64',
            },
          },
          {
            name: 'reduceOnly',
            type: {
              option: 'bool',
            },
          },
          {
            name: 'postOnly',
            type: {
              option: {
                defined: 'PostOnlyParam',
              },
            },
          },
          {
            name: 'immediateOrCancel',
            type: {
              option: 'bool',
            },
          },
          {
            name: 'maxTs',
            type: {
              option: 'i64',
            },
          },
          {
            name: 'triggerPrice',
            type: {
              option: 'u64',
            },
          },
          {
            name: 'triggerCondition',
            type: {
              option: {
                defined: 'OrderTriggerCondition',
              },
            },
          },
          {
            name: 'oraclePriceOffset',
            type: {
              option: 'i32',
            },
          },
          {
            name: 'auctionDuration',
            type: {
              option: 'u8',
            },
          },
          {
            name: 'auctionStartPrice',
            type: {
              option: 'i64',
            },
          },
          {
            name: 'auctionEndPrice',
            type: {
              option: 'i64',
            },
          },
          {
            name: 'policy',
            type: {
              option: {
                defined: 'ModifyOrderPolicy',
              },
            },
          },
        ],
      },
    },
    {
      name: 'InsuranceClaim',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'revenueWithdrawSinceLastSettle',
            docs: [
              'The amount of revenue last settled',
              'Positive if funds left the perp market,',
              'negative if funds were pulled into the perp market',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'maxRevenueWithdrawPerPeriod',
            docs: [
              'The max amount of revenue that can be withdrawn per period',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'quoteMaxInsurance',
            docs: [
              'The max amount of insurance that perp market can use to resolve bankruptcy and pnl deficits',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'quoteSettledInsurance',
            docs: [
              'The amount of insurance that has been used to resolve bankruptcy and pnl deficits',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'lastRevenueWithdrawTs',
            docs: ['The last time revenue was settled in/out of market'],
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'PoolBalance',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'scaledBalance',
            docs: [
              "To get the pool's token amount, you must multiply the scaled balance by the market's cumulative",
              'deposit interest',
              'precision: SPOT_BALANCE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'marketIndex',
            docs: ['The spot market the pool is for'],
            type: 'u16',
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 6],
            },
          },
        ],
      },
    },
    {
      name: 'AMM',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'oracle',
            docs: ['oracle price data public key'],
            type: 'publicKey',
          },
          {
            name: 'historicalOracleData',
            docs: ['stores historically witnessed oracle data'],
            type: {
              defined: 'HistoricalOracleData',
            },
          },
          {
            name: 'baseAssetAmountPerLp',
            docs: [
              'accumulated base asset amount since inception per lp share',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'quoteAssetAmountPerLp',
            docs: [
              'accumulated quote asset amount since inception per lp share',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'feePool',
            docs: [
              'partition of fees from perp market trading moved from pnl settlements',
            ],
            type: {
              defined: 'PoolBalance',
            },
          },
          {
            name: 'baseAssetReserve',
            docs: [
              '`x` reserves for constant product mm formula (x * y = k)',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'quoteAssetReserve',
            docs: [
              '`y` reserves for constant product mm formula (x * y = k)',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'concentrationCoef',
            docs: [
              'determines how close the min/max base asset reserve sit vs base reserves',
              'allow for decreasing slippage without increasing liquidity and v.v.',
              'precision: PERCENTAGE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'minBaseAssetReserve',
            docs: [
              'minimum base_asset_reserve allowed before AMM is unavailable',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'maxBaseAssetReserve',
            docs: [
              'maximum base_asset_reserve allowed before AMM is unavailable',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'sqrtK',
            docs: [
              '`sqrt(k)` in constant product mm formula (x * y = k). stored to avoid drift caused by integer math issues',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'pegMultiplier',
            docs: [
              'normalizing numerical factor for y, its use offers lowest slippage in cp-curve when market is balanced',
              'precision: PEG_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'terminalQuoteAssetReserve',
            docs: [
              'y when market is balanced. stored to save computation',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'baseAssetAmountLong',
            docs: [
              'always non-negative. tracks number of total longs in market (regardless of counterparty)',
              'precision: BASE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'baseAssetAmountShort',
            docs: [
              'always non-positive. tracks number of total shorts in market (regardless of counterparty)',
              'precision: BASE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'baseAssetAmountWithAmm',
            docs: [
              'tracks net position (longs-shorts) in market with AMM as counterparty',
              'precision: BASE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'baseAssetAmountWithUnsettledLp',
            docs: [
              'tracks net position (longs-shorts) in market with LPs as counterparty',
              'precision: BASE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'maxOpenInterest',
            docs: [
              'max allowed open interest, blocks trades that breach this value',
              'precision: BASE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'quoteAssetAmount',
            docs: [
              "sum of all user's perp quote_asset_amount in market",
              'precision: QUOTE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'quoteEntryAmountLong',
            docs: [
              "sum of all long user's quote_entry_amount in market",
              'precision: QUOTE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'quoteEntryAmountShort',
            docs: [
              "sum of all short user's quote_entry_amount in market",
              'precision: QUOTE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'quoteBreakEvenAmountLong',
            docs: [
              "sum of all long user's quote_break_even_amount in market",
              'precision: QUOTE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'quoteBreakEvenAmountShort',
            docs: [
              "sum of all short user's quote_break_even_amount in market",
              'precision: QUOTE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'userLpShares',
            docs: [
              'total user lp shares of sqrt_k (protocol owned liquidity = sqrt_k - last_funding_rate)',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'lastFundingRate',
            docs: [
              'last funding rate in this perp market (unit is quote per base)',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'lastFundingRateLong',
            docs: [
              'last funding rate for longs in this perp market (unit is quote per base)',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'lastFundingRateShort',
            docs: [
              'last funding rate for shorts in this perp market (unit is quote per base)',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'last24hAvgFundingRate',
            docs: [
              'estimate of last 24h of funding rate perp market (unit is quote per base)',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'totalFee',
            docs: [
              'total fees collected by this perp market',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'totalMmFee',
            docs: [
              "total fees collected by the vAMM's bid/ask spread",
              'precision: QUOTE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'totalExchangeFee',
            docs: [
              'total fees collected by exchange fee schedule',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'totalFeeMinusDistributions',
            docs: [
              'total fees minus any recognized upnl and pool withdraws',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i128',
          },
          {
            name: 'totalFeeWithdrawn',
            docs: [
              'sum of all fees from fee pool withdrawn to revenue pool',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'totalLiquidationFee',
            docs: [
              'all fees collected by market for liquidations',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'cumulativeFundingRateLong',
            docs: [
              'accumulated funding rate for longs since inception in market',
            ],
            type: 'i128',
          },
          {
            name: 'cumulativeFundingRateShort',
            docs: [
              'accumulated funding rate for shorts since inception in market',
            ],
            type: 'i128',
          },
          {
            name: 'totalSocialLoss',
            docs: [
              'accumulated social loss paid by users since inception in market',
            ],
            type: 'u128',
          },
          {
            name: 'askBaseAssetReserve',
            docs: [
              'transformed base_asset_reserve for users going long',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'askQuoteAssetReserve',
            docs: [
              'transformed quote_asset_reserve for users going long',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'bidBaseAssetReserve',
            docs: [
              'transformed base_asset_reserve for users going short',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'bidQuoteAssetReserve',
            docs: [
              'transformed quote_asset_reserve for users going short',
              'precision: AMM_RESERVE_PRECISION',
            ],
            type: 'u128',
          },
          {
            name: 'lastOracleNormalisedPrice',
            docs: [
              'the last seen oracle price partially shrunk toward the amm reserve price',
              'precision: PRICE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'lastOracleReservePriceSpreadPct',
            docs: [
              'the gap between the oracle price and the reserve price = y * peg_multiplier / x',
            ],
            type: 'i64',
          },
          {
            name: 'lastBidPriceTwap',
            docs: [
              'average estimate of bid price over funding_period',
              'precision: PRICE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'lastAskPriceTwap',
            docs: [
              'average estimate of ask price over funding_period',
              'precision: PRICE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'lastMarkPriceTwap',
            docs: [
              'average estimate of (bid+ask)/2 price over funding_period',
              'precision: PRICE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'lastMarkPriceTwap5min',
            docs: ['average estimate of (bid+ask)/2 price over FIVE_MINUTES'],
            type: 'u64',
          },
          {
            name: 'lastUpdateSlot',
            docs: ['the last blockchain slot the amm was updated'],
            type: 'u64',
          },
          {
            name: 'lastOracleConfPct',
            docs: [
              'the pct size of the oracle confidence interval',
              'precision: PERCENTAGE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'netRevenueSinceLastFunding',
            docs: [
              'the total_fee_minus_distribution change since the last funding update',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'lastFundingRateTs',
            docs: ['the last funding rate update unix_timestamp'],
            type: 'i64',
          },
          {
            name: 'fundingPeriod',
            docs: ['the peridocity of the funding rate updates'],
            type: 'i64',
          },
          {
            name: 'orderStepSize',
            docs: [
              'the base step size (increment) of orders',
              'precision: BASE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'orderTickSize',
            docs: [
              'the price tick size of orders',
              'precision: PRICE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'minOrderSize',
            docs: [
              'the minimum base size of an order',
              'precision: BASE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'maxPositionSize',
            docs: [
              'the max base size a single user can have',
              'precision: BASE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'volume24h',
            docs: ['estimated total of volume in market', 'QUOTE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'longIntensityVolume',
            docs: ['the volume intensity of long fills against AMM'],
            type: 'u64',
          },
          {
            name: 'shortIntensityVolume',
            docs: ['the volume intensity of short fills against AMM'],
            type: 'u64',
          },
          {
            name: 'lastTradeTs',
            docs: [
              'the blockchain unix timestamp at the time of the last trade',
            ],
            type: 'i64',
          },
          {
            name: 'markStd',
            docs: [
              'estimate of standard deviation of the fill (mark) prices',
              'precision: PRICE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'oracleStd',
            docs: [
              'estimate of standard deviation of the oracle price at each update',
              'precision: PRICE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'lastMarkPriceTwapTs',
            docs: ['the last unix_timestamp the mark twap was updated'],
            type: 'i64',
          },
          {
            name: 'baseSpread',
            docs: [
              'the minimum spread the AMM can quote. also used as step size for some spread logic increases.',
            ],
            type: 'u32',
          },
          {
            name: 'maxSpread',
            docs: ['the maximum spread the AMM can quote'],
            type: 'u32',
          },
          {
            name: 'longSpread',
            docs: ['the spread for asks vs the reserve price'],
            type: 'u32',
          },
          {
            name: 'shortSpread',
            docs: ['the spread for bids vs the reserve price'],
            type: 'u32',
          },
          {
            name: 'longIntensityCount',
            docs: ['the count intensity of long fills against AMM'],
            type: 'u32',
          },
          {
            name: 'shortIntensityCount',
            docs: ['the count intensity of short fills against AMM'],
            type: 'u32',
          },
          {
            name: 'maxFillReserveFraction',
            docs: [
              'the fraction of total available liquidity a single fill on the AMM can consume',
            ],
            type: 'u16',
          },
          {
            name: 'maxSlippageRatio',
            docs: ['the maximum slippage a single fill on the AMM can push'],
            type: 'u16',
          },
          {
            name: 'curveUpdateIntensity',
            docs: [
              'the update intensity of AMM formulaic updates (adjusting k). 0-100',
            ],
            type: 'u8',
          },
          {
            name: 'ammJitIntensity',
            docs: [
              'the jit intensity of AMM. larger intensity means larger participation in jit. 0 means no jit participation.',
              '(0, 100] is intensity for protocol-owned AMM. (100, 200] is intensity for user LP-owned AMM.',
            ],
            type: 'u8',
          },
          {
            name: 'oracleSource',
            docs: [
              'the oracle provider information. used to decode/scale the oracle public key',
            ],
            type: {
              defined: 'OracleSource',
            },
          },
          {
            name: 'lastOracleValid',
            docs: [
              'tracks whether the oracle was considered valid at the last AMM update',
            ],
            type: 'bool',
          },
          {
            name: 'targetBaseAssetAmountPerLp',
            docs: [
              'the target value for `base_asset_amount_per_lp`, used during AMM JIT with LP split',
              'precision: BASE_PRECISION',
            ],
            type: 'i32',
          },
          {
            name: 'perLpBase',
            docs: [
              'expo for unit of per_lp, base 10 (if per_lp_base=X, then per_lp unit is 10^X)',
            ],
            type: 'i8',
          },
          {
            name: 'padding1',
            type: 'u8',
          },
          {
            name: 'padding2',
            type: 'u16',
          },
          {
            name: 'totalFeeEarnedPerLp',
            type: 'u64',
          },
          {
            name: 'netUnsettledFundingPnl',
            type: 'i64',
          },
          {
            name: 'quoteAssetAmountWithUnsettledLp',
            type: 'i64',
          },
          {
            name: 'referencePriceOffset',
            type: 'i32',
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 12],
            },
          },
        ],
      },
    },
    {
      name: 'InsuranceFund',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'vault',
            type: 'publicKey',
          },
          {
            name: 'totalShares',
            type: 'u128',
          },
          {
            name: 'userShares',
            type: 'u128',
          },
          {
            name: 'sharesBase',
            type: 'u128',
          },
          {
            name: 'unstakingPeriod',
            type: 'i64',
          },
          {
            name: 'lastRevenueSettleTs',
            type: 'i64',
          },
          {
            name: 'revenueSettlePeriod',
            type: 'i64',
          },
          {
            name: 'totalFactor',
            type: 'u32',
          },
          {
            name: 'userFactor',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'OracleGuardRails',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'priceDivergence',
            type: {
              defined: 'PriceDivergenceGuardRails',
            },
          },
          {
            name: 'validity',
            type: {
              defined: 'ValidityGuardRails',
            },
          },
        ],
      },
    },
    {
      name: 'PriceDivergenceGuardRails',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'markOraclePercentDivergence',
            type: 'u64',
          },
          {
            name: 'oracleTwap5minPercentDivergence',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'ValidityGuardRails',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'slotsBeforeStaleForAmm',
            type: 'i64',
          },
          {
            name: 'slotsBeforeStaleForMargin',
            type: 'i64',
          },
          {
            name: 'confidenceIntervalMaxSize',
            type: 'u64',
          },
          {
            name: 'tooVolatileRatio',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'FeeStructure',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'feeTiers',
            type: {
              array: [
                {
                  defined: 'FeeTier',
                },
                10,
              ],
            },
          },
          {
            name: 'fillerRewardStructure',
            type: {
              defined: 'OrderFillerRewardStructure',
            },
          },
          {
            name: 'referrerRewardEpochUpperBound',
            type: 'u64',
          },
          {
            name: 'flatFillerFee',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'FeeTier',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'feeNumerator',
            type: 'u32',
          },
          {
            name: 'feeDenominator',
            type: 'u32',
          },
          {
            name: 'makerRebateNumerator',
            type: 'u32',
          },
          {
            name: 'makerRebateDenominator',
            type: 'u32',
          },
          {
            name: 'referrerRewardNumerator',
            type: 'u32',
          },
          {
            name: 'referrerRewardDenominator',
            type: 'u32',
          },
          {
            name: 'refereeFeeNumerator',
            type: 'u32',
          },
          {
            name: 'refereeFeeDenominator',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'OrderFillerRewardStructure',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'rewardNumerator',
            type: 'u32',
          },
          {
            name: 'rewardDenominator',
            type: 'u32',
          },
          {
            name: 'timeBasedRewardLowerBound',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'UserFees',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'totalFeePaid',
            docs: ['Total taker fee paid', 'precision: QUOTE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'totalFeeRebate',
            docs: ['Total maker fee rebate', 'precision: QUOTE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'totalTokenDiscount',
            docs: [
              'Total discount from holding token',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'totalRefereeDiscount',
            docs: [
              'Total discount from being referred',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'totalReferrerReward',
            docs: ['Total reward to referrer', 'precision: QUOTE_PRECISION'],
            type: 'u64',
          },
          {
            name: 'currentEpochReferrerReward',
            docs: [
              'Total reward to referrer this epoch',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'SpotPosition',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'scaledBalance',
            docs: [
              'The scaled balance of the position. To get the token amount, multiply by the cumulative deposit/borrow',
              'interest of corresponding market.',
              'precision: SPOT_BALANCE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'openBids',
            docs: [
              'How many spot bids the user has open',
              'precision: token mint precision',
            ],
            type: 'i64',
          },
          {
            name: 'openAsks',
            docs: [
              'How many spot asks the user has open',
              'precision: token mint precision',
            ],
            type: 'i64',
          },
          {
            name: 'cumulativeDeposits',
            docs: [
              'The cumulative deposits/borrows a user has made into a market',
              'precision: token mint precision',
            ],
            type: 'i64',
          },
          {
            name: 'marketIndex',
            docs: ['The market index of the corresponding spot market'],
            type: 'u16',
          },
          {
            name: 'balanceType',
            docs: ['Whether the position is deposit or borrow'],
            type: {
              defined: 'SpotBalanceType',
            },
          },
          {
            name: 'openOrders',
            docs: ['Number of open orders'],
            type: 'u8',
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 4],
            },
          },
        ],
      },
    },
    {
      name: 'PerpPosition',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lastCumulativeFundingRate',
            docs: [
              "The perp market's last cumulative funding rate. Used to calculate the funding payment owed to user",
              'precision: FUNDING_RATE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'baseAssetAmount',
            docs: [
              'the size of the users perp position',
              'precision: BASE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'quoteAssetAmount',
            docs: [
              'Used to calculate the users pnl. Upon entry, is equal to base_asset_amount * avg entry price - fees',
              'Updated when the user open/closes position or settles pnl. Includes fees/funding',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'quoteBreakEvenAmount',
            docs: [
              'The amount of quote the user would need to exit their position at to break even',
              'Updated when the user open/closes position or settles pnl. Includes fees/funding',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'quoteEntryAmount',
            docs: [
              'The amount quote the user entered the position with. Equal to base asset amount * avg entry price',
              'Updated when the user open/closes position. Excludes fees/funding',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'openBids',
            docs: [
              'The amount of open bids the user has in this perp market',
              'precision: BASE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'openAsks',
            docs: [
              'The amount of open asks the user has in this perp market',
              'precision: BASE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'settledPnl',
            docs: [
              'The amount of pnl settled in this market since opening the position',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'lpShares',
            docs: [
              'The number of lp (liquidity provider) shares the user has in this perp market',
              'LP shares allow users to provide liquidity via the AMM',
              'precision: BASE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'lastBaseAssetAmountPerLp',
            docs: [
              'The last base asset amount per lp the amm had',
              'Used to settle the users lp position',
              'precision: BASE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'lastQuoteAssetAmountPerLp',
            docs: [
              'The last quote asset amount per lp the amm had',
              'Used to settle the users lp position',
              'precision: QUOTE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'remainderBaseAssetAmount',
            docs: [
              'Settling LP position can lead to a small amount of base asset being left over smaller than step size',
              'This records that remainder so it can be settled later on',
              'precision: BASE_PRECISION',
            ],
            type: 'i32',
          },
          {
            name: 'marketIndex',
            docs: ['The market index for the perp market'],
            type: 'u16',
          },
          {
            name: 'openOrders',
            docs: ['The number of open orders'],
            type: 'u8',
          },
          {
            name: 'perLpBase',
            type: 'i8',
          },
        ],
      },
    },
    {
      name: 'Order',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'slot',
            docs: ['The slot the order was placed'],
            type: 'u64',
          },
          {
            name: 'price',
            docs: [
              'The limit price for the order (can be 0 for market orders)',
              "For orders with an auction, this price isn't used until the auction is complete",
              'precision: PRICE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'baseAssetAmount',
            docs: [
              'The size of the order',
              'precision for perps: BASE_PRECISION',
              'precision for spot: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'baseAssetAmountFilled',
            docs: [
              'The amount of the order filled',
              'precision for perps: BASE_PRECISION',
              'precision for spot: token mint precision',
            ],
            type: 'u64',
          },
          {
            name: 'quoteAssetAmountFilled',
            docs: [
              'The amount of quote filled for the order',
              'precision: QUOTE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'triggerPrice',
            docs: [
              'At what price the order will be triggered. Only relevant for trigger orders',
              'precision: PRICE_PRECISION',
            ],
            type: 'u64',
          },
          {
            name: 'auctionStartPrice',
            docs: [
              'The start price for the auction. Only relevant for market/oracle orders',
              'precision: PRICE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'auctionEndPrice',
            docs: [
              'The end price for the auction. Only relevant for market/oracle orders',
              'precision: PRICE_PRECISION',
            ],
            type: 'i64',
          },
          {
            name: 'maxTs',
            docs: ['The time when the order will expire'],
            type: 'i64',
          },
          {
            name: 'oraclePriceOffset',
            docs: [
              'If set, the order limit price is the oracle price + this offset',
              'precision: PRICE_PRECISION',
            ],
            type: 'i32',
          },
          {
            name: 'orderId',
            docs: [
              'The id for the order. Each users has their own order id space',
            ],
            type: 'u32',
          },
          {
            name: 'marketIndex',
            docs: ['The perp/spot market index'],
            type: 'u16',
          },
          {
            name: 'status',
            docs: ['Whether the order is open or unused'],
            type: {
              defined: 'OrderStatus',
            },
          },
          {
            name: 'orderType',
            docs: ['The type of order'],
            type: {
              defined: 'OrderType',
            },
          },
          {
            name: 'marketType',
            docs: ['Whether market is spot or perp'],
            type: {
              defined: 'MarketType',
            },
          },
          {
            name: 'userOrderId',
            docs: [
              'User generated order id. Can make it easier to place/cancel orders',
            ],
            type: 'u8',
          },
          {
            name: 'existingPositionDirection',
            docs: ['What the users position was when the order was placed'],
            type: {
              defined: 'PositionDirection',
            },
          },
          {
            name: 'direction',
            docs: [
              'Whether the user is going long or short. LONG = bid, SHORT = ask',
            ],
            type: {
              defined: 'PositionDirection',
            },
          },
          {
            name: 'reduceOnly',
            docs: ['Whether the order is allowed to only reduce position size'],
            type: 'bool',
          },
          {
            name: 'postOnly',
            docs: ['Whether the order must be a maker'],
            type: 'bool',
          },
          {
            name: 'immediateOrCancel',
            docs: [
              'Whether the order must be canceled the same slot it is placed',
            ],
            type: 'bool',
          },
          {
            name: 'triggerCondition',
            docs: [
              'Whether the order is triggered above or below the trigger price. Only relevant for trigger orders',
            ],
            type: {
              defined: 'OrderTriggerCondition',
            },
          },
          {
            name: 'auctionDuration',
            docs: ['How many slots the auction lasts'],
            type: 'u8',
          },
          {
            name: 'padding',
            type: {
              array: ['u8', 3],
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
            name: 'Add',
          },
          {
            name: 'Remove',
          },
        ],
      },
    },
    {
      name: 'ModifyOrderId',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'UserOrderId',
            fields: ['u8'],
          },
          {
            name: 'OrderId',
            fields: ['u32'],
          },
        ],
      },
    },
    {
      name: 'PositionDirection',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Long',
          },
          {
            name: 'Short',
          },
        ],
      },
    },
    {
      name: 'SpotFulfillmentType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'SerumV3',
          },
          {
            name: 'Match',
          },
          {
            name: 'PhoenixV1',
          },
        ],
      },
    },
    {
      name: 'SwapReduceOnly',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'In',
          },
          {
            name: 'Out',
          },
        ],
      },
    },
    {
      name: 'TwapPeriod',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'FundingPeriod',
          },
          {
            name: 'FiveMin',
          },
        ],
      },
    },
    {
      name: 'LiquidationMultiplierType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Discount',
          },
          {
            name: 'Premium',
          },
        ],
      },
    },
    {
      name: 'MarginRequirementType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Initial',
          },
          {
            name: 'Fill',
          },
          {
            name: 'Maintenance',
          },
        ],
      },
    },
    {
      name: 'OracleValidity',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Invalid',
          },
          {
            name: 'TooVolatile',
          },
          {
            name: 'TooUncertain',
          },
          {
            name: 'StaleForMargin',
          },
          {
            name: 'InsufficientDataPoints',
          },
          {
            name: 'StaleForAMM',
          },
          {
            name: 'Valid',
          },
        ],
      },
    },
    {
      name: 'DriftAction',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'UpdateFunding',
          },
          {
            name: 'SettlePnl',
          },
          {
            name: 'TriggerOrder',
          },
          {
            name: 'FillOrderMatch',
          },
          {
            name: 'FillOrderAmm',
          },
          {
            name: 'Liquidate',
          },
          {
            name: 'MarginCalc',
          },
          {
            name: 'UpdateTwap',
          },
          {
            name: 'UpdateAMMCurve',
          },
          {
            name: 'OracleOrderPrice',
          },
        ],
      },
    },
    {
      name: 'PositionUpdateType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Open',
          },
          {
            name: 'Increase',
          },
          {
            name: 'Reduce',
          },
          {
            name: 'Close',
          },
          {
            name: 'Flip',
          },
        ],
      },
    },
    {
      name: 'DepositExplanation',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'None',
          },
          {
            name: 'Transfer',
          },
          {
            name: 'Borrow',
          },
          {
            name: 'RepayBorrow',
          },
        ],
      },
    },
    {
      name: 'DepositDirection',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Deposit',
          },
          {
            name: 'Withdraw',
          },
        ],
      },
    },
    {
      name: 'OrderAction',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Place',
          },
          {
            name: 'Cancel',
          },
          {
            name: 'Fill',
          },
          {
            name: 'Trigger',
          },
          {
            name: 'Expire',
          },
        ],
      },
    },
    {
      name: 'OrderActionExplanation',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'None',
          },
          {
            name: 'InsufficientFreeCollateral',
          },
          {
            name: 'OraclePriceBreachedLimitPrice',
          },
          {
            name: 'MarketOrderFilledToLimitPrice',
          },
          {
            name: 'OrderExpired',
          },
          {
            name: 'Liquidation',
          },
          {
            name: 'OrderFilledWithAMM',
          },
          {
            name: 'OrderFilledWithAMMJit',
          },
          {
            name: 'OrderFilledWithMatch',
          },
          {
            name: 'OrderFilledWithMatchJit',
          },
          {
            name: 'MarketExpired',
          },
          {
            name: 'RiskingIncreasingOrder',
          },
          {
            name: 'ReduceOnlyOrderIncreasedPosition',
          },
          {
            name: 'OrderFillWithSerum',
          },
          {
            name: 'NoBorrowLiquidity',
          },
          {
            name: 'OrderFillWithPhoenix',
          },
          {
            name: 'OrderFilledWithAMMJitLPSplit',
          },
          {
            name: 'OrderFilledWithLPJit',
          },
          {
            name: 'DeriskLp',
          },
        ],
      },
    },
    {
      name: 'LPAction',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'AddLiquidity',
          },
          {
            name: 'RemoveLiquidity',
          },
          {
            name: 'SettleLiquidity',
          },
          {
            name: 'RemoveLiquidityDerisk',
          },
        ],
      },
    },
    {
      name: 'LiquidationType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'LiquidatePerp',
          },
          {
            name: 'LiquidateSpot',
          },
          {
            name: 'LiquidateBorrowForPerpPnl',
          },
          {
            name: 'LiquidatePerpPnlForDeposit',
          },
          {
            name: 'PerpBankruptcy',
          },
          {
            name: 'SpotBankruptcy',
          },
        ],
      },
    },
    {
      name: 'SettlePnlExplanation',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'None',
          },
          {
            name: 'ExpiredPosition',
          },
        ],
      },
    },
    {
      name: 'StakeAction',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Stake',
          },
          {
            name: 'UnstakeRequest',
          },
          {
            name: 'UnstakeCancelRequest',
          },
          {
            name: 'Unstake',
          },
          {
            name: 'UnstakeTransfer',
          },
          {
            name: 'StakeTransfer',
          },
        ],
      },
    },
    {
      name: 'FillMode',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Fill',
          },
          {
            name: 'PlaceAndMake',
          },
          {
            name: 'PlaceAndTake',
          },
        ],
      },
    },
    {
      name: 'PerpFulfillmentMethod',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'AMM',
            fields: [
              {
                option: 'u64',
              },
            ],
          },
          {
            name: 'Match',
            fields: ['publicKey', 'u16'],
          },
        ],
      },
    },
    {
      name: 'SpotFulfillmentMethod',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'ExternalMarket',
          },
          {
            name: 'Match',
          },
        ],
      },
    },
    {
      name: 'MarginCalculationMode',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Standard',
            fields: [
              {
                name: 'track_open_orders_fraction',
                type: 'bool',
              },
            ],
          },
          {
            name: 'Liquidation',
            fields: [
              {
                name: 'market_to_track_margin_requirement',
                type: {
                  option: {
                    defined: 'MarketIdentifier',
                  },
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'OracleSource',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Pyth',
          },
          {
            name: 'Switchboard',
          },
          {
            name: 'QuoteAsset',
          },
          {
            name: 'Pyth1K',
          },
          {
            name: 'Pyth1M',
          },
          {
            name: 'PythStableCoin',
          },
        ],
      },
    },
    {
      name: 'PostOnlyParam',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'None',
          },
          {
            name: 'MustPostOnly',
          },
          {
            name: 'TryPostOnly',
          },
          {
            name: 'Slide',
          },
        ],
      },
    },
    {
      name: 'ModifyOrderPolicy',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'TryModify',
          },
          {
            name: 'MustModify',
          },
        ],
      },
    },
    {
      name: 'PerpOperation',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'UpdateFunding',
          },
          {
            name: 'AmmFill',
          },
          {
            name: 'Fill',
          },
          {
            name: 'SettlePnl',
          },
          {
            name: 'SettlePnlWithPosition',
          },
          {
            name: 'Liquidation',
          },
        ],
      },
    },
    {
      name: 'SpotOperation',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'UpdateCumulativeInterest',
          },
          {
            name: 'Fill',
          },
          {
            name: 'Withdraw',
          },
          {
            name: 'Liquidation',
          },
        ],
      },
    },
    {
      name: 'MarketStatus',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Initialized',
          },
          {
            name: 'Active',
          },
          {
            name: 'FundingPaused',
          },
          {
            name: 'AmmPaused',
          },
          {
            name: 'FillPaused',
          },
          {
            name: 'WithdrawPaused',
          },
          {
            name: 'ReduceOnly',
          },
          {
            name: 'Settlement',
          },
          {
            name: 'Delisted',
          },
        ],
      },
    },
    {
      name: 'ContractType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Perpetual',
          },
          {
            name: 'Future',
          },
        ],
      },
    },
    {
      name: 'ContractTier',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'A',
          },
          {
            name: 'B',
          },
          {
            name: 'C',
          },
          {
            name: 'Speculative',
          },
          {
            name: 'Isolated',
          },
        ],
      },
    },
    {
      name: 'AMMLiquiditySplit',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'ProtocolOwned',
          },
          {
            name: 'LPOwned',
          },
          {
            name: 'Shared',
          },
        ],
      },
    },
    {
      name: 'SpotBalanceType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Deposit',
          },
          {
            name: 'Borrow',
          },
        ],
      },
    },
    {
      name: 'SpotFulfillmentConfigStatus',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Enabled',
          },
          {
            name: 'Disabled',
          },
        ],
      },
    },
    {
      name: 'AssetTier',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Collateral',
          },
          {
            name: 'Protected',
          },
          {
            name: 'Cross',
          },
          {
            name: 'Isolated',
          },
          {
            name: 'Unlisted',
          },
        ],
      },
    },
    {
      name: 'ExchangeStatus',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'DepositPaused',
          },
          {
            name: 'WithdrawPaused',
          },
          {
            name: 'AmmPaused',
          },
          {
            name: 'FillPaused',
          },
          {
            name: 'LiqPaused',
          },
          {
            name: 'FundingPaused',
          },
          {
            name: 'SettlePnlPaused',
          },
        ],
      },
    },
    {
      name: 'UserStatus',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'BeingLiquidated',
          },
          {
            name: 'Bankrupt',
          },
          {
            name: 'ReduceOnly',
          },
          {
            name: 'AdvancedLp',
          },
        ],
      },
    },
    {
      name: 'AssetType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Base',
          },
          {
            name: 'Quote',
          },
        ],
      },
    },
    {
      name: 'OrderStatus',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Init',
          },
          {
            name: 'Open',
          },
          {
            name: 'Filled',
          },
          {
            name: 'Canceled',
          },
        ],
      },
    },
    {
      name: 'OrderType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Market',
          },
          {
            name: 'Limit',
          },
          {
            name: 'TriggerMarket',
          },
          {
            name: 'TriggerLimit',
          },
          {
            name: 'Oracle',
          },
        ],
      },
    },
    {
      name: 'OrderTriggerCondition',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Above',
          },
          {
            name: 'Below',
          },
          {
            name: 'TriggeredAbove',
          },
          {
            name: 'TriggeredBelow',
          },
        ],
      },
    },
    {
      name: 'MarketType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Spot',
          },
          {
            name: 'Perp',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'NewUserRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'userAuthority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'subAccountId',
          type: 'u16',
          index: false,
        },
        {
          name: 'name',
          type: {
            array: ['u8', 32],
          },
          index: false,
        },
        {
          name: 'referrer',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'DepositRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'userAuthority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'direction',
          type: {
            defined: 'DepositDirection',
          },
          index: false,
        },
        {
          name: 'depositRecordId',
          type: 'u64',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'marketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'oraclePrice',
          type: 'i64',
          index: false,
        },
        {
          name: 'marketDepositBalance',
          type: 'u128',
          index: false,
        },
        {
          name: 'marketWithdrawBalance',
          type: 'u128',
          index: false,
        },
        {
          name: 'marketCumulativeDepositInterest',
          type: 'u128',
          index: false,
        },
        {
          name: 'marketCumulativeBorrowInterest',
          type: 'u128',
          index: false,
        },
        {
          name: 'totalDepositsAfter',
          type: 'u64',
          index: false,
        },
        {
          name: 'totalWithdrawsAfter',
          type: 'u64',
          index: false,
        },
        {
          name: 'explanation',
          type: {
            defined: 'DepositExplanation',
          },
          index: false,
        },
        {
          name: 'transferUser',
          type: {
            option: 'publicKey',
          },
          index: false,
        },
      ],
    },
    {
      name: 'SpotInterestRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'marketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'depositBalance',
          type: 'u128',
          index: false,
        },
        {
          name: 'cumulativeDepositInterest',
          type: 'u128',
          index: false,
        },
        {
          name: 'borrowBalance',
          type: 'u128',
          index: false,
        },
        {
          name: 'cumulativeBorrowInterest',
          type: 'u128',
          index: false,
        },
        {
          name: 'optimalUtilization',
          type: 'u32',
          index: false,
        },
        {
          name: 'optimalBorrowRate',
          type: 'u32',
          index: false,
        },
        {
          name: 'maxBorrowRate',
          type: 'u32',
          index: false,
        },
      ],
    },
    {
      name: 'FundingPaymentRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'userAuthority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'marketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'fundingPayment',
          type: 'i64',
          index: false,
        },
        {
          name: 'baseAssetAmount',
          type: 'i64',
          index: false,
        },
        {
          name: 'userLastCumulativeFunding',
          type: 'i64',
          index: false,
        },
        {
          name: 'ammCumulativeFundingLong',
          type: 'i128',
          index: false,
        },
        {
          name: 'ammCumulativeFundingShort',
          type: 'i128',
          index: false,
        },
      ],
    },
    {
      name: 'FundingRateRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'recordId',
          type: 'u64',
          index: false,
        },
        {
          name: 'marketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'fundingRate',
          type: 'i64',
          index: false,
        },
        {
          name: 'fundingRateLong',
          type: 'i128',
          index: false,
        },
        {
          name: 'fundingRateShort',
          type: 'i128',
          index: false,
        },
        {
          name: 'cumulativeFundingRateLong',
          type: 'i128',
          index: false,
        },
        {
          name: 'cumulativeFundingRateShort',
          type: 'i128',
          index: false,
        },
        {
          name: 'oraclePriceTwap',
          type: 'i64',
          index: false,
        },
        {
          name: 'markPriceTwap',
          type: 'u64',
          index: false,
        },
        {
          name: 'periodRevenue',
          type: 'i64',
          index: false,
        },
        {
          name: 'baseAssetAmountWithAmm',
          type: 'i128',
          index: false,
        },
        {
          name: 'baseAssetAmountWithUnsettledLp',
          type: 'i128',
          index: false,
        },
      ],
    },
    {
      name: 'CurveRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'recordId',
          type: 'u64',
          index: false,
        },
        {
          name: 'pegMultiplierBefore',
          type: 'u128',
          index: false,
        },
        {
          name: 'baseAssetReserveBefore',
          type: 'u128',
          index: false,
        },
        {
          name: 'quoteAssetReserveBefore',
          type: 'u128',
          index: false,
        },
        {
          name: 'sqrtKBefore',
          type: 'u128',
          index: false,
        },
        {
          name: 'pegMultiplierAfter',
          type: 'u128',
          index: false,
        },
        {
          name: 'baseAssetReserveAfter',
          type: 'u128',
          index: false,
        },
        {
          name: 'quoteAssetReserveAfter',
          type: 'u128',
          index: false,
        },
        {
          name: 'sqrtKAfter',
          type: 'u128',
          index: false,
        },
        {
          name: 'baseAssetAmountLong',
          type: 'u128',
          index: false,
        },
        {
          name: 'baseAssetAmountShort',
          type: 'u128',
          index: false,
        },
        {
          name: 'baseAssetAmountWithAmm',
          type: 'i128',
          index: false,
        },
        {
          name: 'totalFee',
          type: 'i128',
          index: false,
        },
        {
          name: 'totalFeeMinusDistributions',
          type: 'i128',
          index: false,
        },
        {
          name: 'adjustmentCost',
          type: 'i128',
          index: false,
        },
        {
          name: 'oraclePrice',
          type: 'i64',
          index: false,
        },
        {
          name: 'fillRecord',
          type: 'u128',
          index: false,
        },
        {
          name: 'numberOfUsers',
          type: 'u32',
          index: false,
        },
        {
          name: 'marketIndex',
          type: 'u16',
          index: false,
        },
      ],
    },
    {
      name: 'OrderRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'order',
          type: {
            defined: 'Order',
          },
          index: false,
        },
      ],
    },
    {
      name: 'OrderActionRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'action',
          type: {
            defined: 'OrderAction',
          },
          index: false,
        },
        {
          name: 'actionExplanation',
          type: {
            defined: 'OrderActionExplanation',
          },
          index: false,
        },
        {
          name: 'marketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'marketType',
          type: {
            defined: 'MarketType',
          },
          index: false,
        },
        {
          name: 'filler',
          type: {
            option: 'publicKey',
          },
          index: false,
        },
        {
          name: 'fillerReward',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'fillRecordId',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'baseAssetAmountFilled',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'quoteAssetAmountFilled',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'takerFee',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'makerFee',
          type: {
            option: 'i64',
          },
          index: false,
        },
        {
          name: 'referrerReward',
          type: {
            option: 'u32',
          },
          index: false,
        },
        {
          name: 'quoteAssetAmountSurplus',
          type: {
            option: 'i64',
          },
          index: false,
        },
        {
          name: 'spotFulfillmentMethodFee',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'taker',
          type: {
            option: 'publicKey',
          },
          index: false,
        },
        {
          name: 'takerOrderId',
          type: {
            option: 'u32',
          },
          index: false,
        },
        {
          name: 'takerOrderDirection',
          type: {
            option: {
              defined: 'PositionDirection',
            },
          },
          index: false,
        },
        {
          name: 'takerOrderBaseAssetAmount',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'takerOrderCumulativeBaseAssetAmountFilled',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'takerOrderCumulativeQuoteAssetAmountFilled',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'maker',
          type: {
            option: 'publicKey',
          },
          index: false,
        },
        {
          name: 'makerOrderId',
          type: {
            option: 'u32',
          },
          index: false,
        },
        {
          name: 'makerOrderDirection',
          type: {
            option: {
              defined: 'PositionDirection',
            },
          },
          index: false,
        },
        {
          name: 'makerOrderBaseAssetAmount',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'makerOrderCumulativeBaseAssetAmountFilled',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'makerOrderCumulativeQuoteAssetAmountFilled',
          type: {
            option: 'u64',
          },
          index: false,
        },
        {
          name: 'oraclePrice',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'LPRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'action',
          type: {
            defined: 'LPAction',
          },
          index: false,
        },
        {
          name: 'nShares',
          type: 'u64',
          index: false,
        },
        {
          name: 'marketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'deltaBaseAssetAmount',
          type: 'i64',
          index: false,
        },
        {
          name: 'deltaQuoteAssetAmount',
          type: 'i64',
          index: false,
        },
        {
          name: 'pnl',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'LiquidationRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'liquidationType',
          type: {
            defined: 'LiquidationType',
          },
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'liquidator',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'marginRequirement',
          type: 'u128',
          index: false,
        },
        {
          name: 'totalCollateral',
          type: 'i128',
          index: false,
        },
        {
          name: 'marginFreed',
          type: 'u64',
          index: false,
        },
        {
          name: 'liquidationId',
          type: 'u16',
          index: false,
        },
        {
          name: 'bankrupt',
          type: 'bool',
          index: false,
        },
        {
          name: 'canceledOrderIds',
          type: {
            vec: 'u32',
          },
          index: false,
        },
        {
          name: 'liquidatePerp',
          type: {
            defined: 'LiquidatePerpRecord',
          },
          index: false,
        },
        {
          name: 'liquidateSpot',
          type: {
            defined: 'LiquidateSpotRecord',
          },
          index: false,
        },
        {
          name: 'liquidateBorrowForPerpPnl',
          type: {
            defined: 'LiquidateBorrowForPerpPnlRecord',
          },
          index: false,
        },
        {
          name: 'liquidatePerpPnlForDeposit',
          type: {
            defined: 'LiquidatePerpPnlForDepositRecord',
          },
          index: false,
        },
        {
          name: 'perpBankruptcy',
          type: {
            defined: 'PerpBankruptcyRecord',
          },
          index: false,
        },
        {
          name: 'spotBankruptcy',
          type: {
            defined: 'SpotBankruptcyRecord',
          },
          index: false,
        },
      ],
    },
    {
      name: 'SettlePnlRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'marketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'pnl',
          type: 'i128',
          index: false,
        },
        {
          name: 'baseAssetAmount',
          type: 'i64',
          index: false,
        },
        {
          name: 'quoteAssetAmountAfter',
          type: 'i64',
          index: false,
        },
        {
          name: 'quoteEntryAmount',
          type: 'i64',
          index: false,
        },
        {
          name: 'settlePrice',
          type: 'i64',
          index: false,
        },
        {
          name: 'explanation',
          type: {
            defined: 'SettlePnlExplanation',
          },
          index: false,
        },
      ],
    },
    {
      name: 'InsuranceFundRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'spotMarketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'perpMarketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'userIfFactor',
          type: 'u32',
          index: false,
        },
        {
          name: 'totalIfFactor',
          type: 'u32',
          index: false,
        },
        {
          name: 'vaultAmountBefore',
          type: 'u64',
          index: false,
        },
        {
          name: 'insuranceVaultAmountBefore',
          type: 'u64',
          index: false,
        },
        {
          name: 'totalIfSharesBefore',
          type: 'u128',
          index: false,
        },
        {
          name: 'totalIfSharesAfter',
          type: 'u128',
          index: false,
        },
        {
          name: 'amount',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'InsuranceFundStakeRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'userAuthority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'action',
          type: {
            defined: 'StakeAction',
          },
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'marketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'insuranceVaultAmountBefore',
          type: 'u64',
          index: false,
        },
        {
          name: 'ifSharesBefore',
          type: 'u128',
          index: false,
        },
        {
          name: 'userIfSharesBefore',
          type: 'u128',
          index: false,
        },
        {
          name: 'totalIfSharesBefore',
          type: 'u128',
          index: false,
        },
        {
          name: 'ifSharesAfter',
          type: 'u128',
          index: false,
        },
        {
          name: 'userIfSharesAfter',
          type: 'u128',
          index: false,
        },
        {
          name: 'totalIfSharesAfter',
          type: 'u128',
          index: false,
        },
      ],
    },
    {
      name: 'SwapRecord',
      fields: [
        {
          name: 'ts',
          type: 'i64',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amountOut',
          type: 'u64',
          index: false,
        },
        {
          name: 'amountIn',
          type: 'u64',
          index: false,
        },
        {
          name: 'outMarketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'inMarketIndex',
          type: 'u16',
          index: false,
        },
        {
          name: 'outOraclePrice',
          type: 'i64',
          index: false,
        },
        {
          name: 'inOraclePrice',
          type: 'i64',
          index: false,
        },
        {
          name: 'fee',
          type: 'u64',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'InvalidSpotMarketAuthority',
      msg: 'Invalid Spot Market Authority',
    },
    {
      code: 6001,
      name: 'InvalidInsuranceFundAuthority',
      msg: 'Clearing house not insurance fund authority',
    },
    {
      code: 6002,
      name: 'InsufficientDeposit',
      msg: 'Insufficient deposit',
    },
    {
      code: 6003,
      name: 'InsufficientCollateral',
      msg: 'Insufficient collateral',
    },
    {
      code: 6004,
      name: 'SufficientCollateral',
      msg: 'Sufficient collateral',
    },
    {
      code: 6005,
      name: 'MaxNumberOfPositions',
      msg: 'Max number of positions taken',
    },
    {
      code: 6006,
      name: 'AdminControlsPricesDisabled',
      msg: 'Admin Controls Prices Disabled',
    },
    {
      code: 6007,
      name: 'MarketDelisted',
      msg: 'Market Delisted',
    },
    {
      code: 6008,
      name: 'MarketIndexAlreadyInitialized',
      msg: 'Market Index Already Initialized',
    },
    {
      code: 6009,
      name: 'UserAccountAndUserPositionsAccountMismatch',
      msg: 'User Account And User Positions Account Mismatch',
    },
    {
      code: 6010,
      name: 'UserHasNoPositionInMarket',
      msg: 'User Has No Position In Market',
    },
    {
      code: 6011,
      name: 'InvalidInitialPeg',
      msg: 'Invalid Initial Peg',
    },
    {
      code: 6012,
      name: 'InvalidRepegRedundant',
      msg: 'AMM repeg already configured with amt given',
    },
    {
      code: 6013,
      name: 'InvalidRepegDirection',
      msg: 'AMM repeg incorrect repeg direction',
    },
    {
      code: 6014,
      name: 'InvalidRepegProfitability',
      msg: 'AMM repeg out of bounds pnl',
    },
    {
      code: 6015,
      name: 'SlippageOutsideLimit',
      msg: 'Slippage Outside Limit Price',
    },
    {
      code: 6016,
      name: 'OrderSizeTooSmall',
      msg: 'Order Size Too Small',
    },
    {
      code: 6017,
      name: 'InvalidUpdateK',
      msg: 'Price change too large when updating K',
    },
    {
      code: 6018,
      name: 'AdminWithdrawTooLarge',
      msg: 'Admin tried to withdraw amount larger than fees collected',
    },
    {
      code: 6019,
      name: 'MathError',
      msg: 'Math Error',
    },
    {
      code: 6020,
      name: 'BnConversionError',
      msg: 'Conversion to u128/u64 failed with an overflow or underflow',
    },
    {
      code: 6021,
      name: 'ClockUnavailable',
      msg: 'Clock unavailable',
    },
    {
      code: 6022,
      name: 'UnableToLoadOracle',
      msg: 'Unable To Load Oracles',
    },
    {
      code: 6023,
      name: 'PriceBandsBreached',
      msg: 'Price Bands Breached',
    },
    {
      code: 6024,
      name: 'ExchangePaused',
      msg: 'Exchange is paused',
    },
    {
      code: 6025,
      name: 'InvalidWhitelistToken',
      msg: 'Invalid whitelist token',
    },
    {
      code: 6026,
      name: 'WhitelistTokenNotFound',
      msg: 'Whitelist token not found',
    },
    {
      code: 6027,
      name: 'InvalidDiscountToken',
      msg: 'Invalid discount token',
    },
    {
      code: 6028,
      name: 'DiscountTokenNotFound',
      msg: 'Discount token not found',
    },
    {
      code: 6029,
      name: 'ReferrerNotFound',
      msg: 'Referrer not found',
    },
    {
      code: 6030,
      name: 'ReferrerStatsNotFound',
      msg: 'ReferrerNotFound',
    },
    {
      code: 6031,
      name: 'ReferrerMustBeWritable',
      msg: 'ReferrerMustBeWritable',
    },
    {
      code: 6032,
      name: 'ReferrerStatsMustBeWritable',
      msg: 'ReferrerMustBeWritable',
    },
    {
      code: 6033,
      name: 'ReferrerAndReferrerStatsAuthorityUnequal',
      msg: 'ReferrerAndReferrerStatsAuthorityUnequal',
    },
    {
      code: 6034,
      name: 'InvalidReferrer',
      msg: 'InvalidReferrer',
    },
    {
      code: 6035,
      name: 'InvalidOracle',
      msg: 'InvalidOracle',
    },
    {
      code: 6036,
      name: 'OracleNotFound',
      msg: 'OracleNotFound',
    },
    {
      code: 6037,
      name: 'LiquidationsBlockedByOracle',
      msg: 'Liquidations Blocked By Oracle',
    },
    {
      code: 6038,
      name: 'MaxDeposit',
      msg: 'Can not deposit more than max deposit',
    },
    {
      code: 6039,
      name: 'CantDeleteUserWithCollateral',
      msg: 'Can not delete user that still has collateral',
    },
    {
      code: 6040,
      name: 'InvalidFundingProfitability',
      msg: 'AMM funding out of bounds pnl',
    },
    {
      code: 6041,
      name: 'CastingFailure',
      msg: 'Casting Failure',
    },
    {
      code: 6042,
      name: 'InvalidOrder',
      msg: 'InvalidOrder',
    },
    {
      code: 6043,
      name: 'InvalidOrderMaxTs',
      msg: 'InvalidOrderMaxTs',
    },
    {
      code: 6044,
      name: 'InvalidOrderMarketType',
      msg: 'InvalidOrderMarketType',
    },
    {
      code: 6045,
      name: 'InvalidOrderForInitialMarginReq',
      msg: 'InvalidOrderForInitialMarginReq',
    },
    {
      code: 6046,
      name: 'InvalidOrderNotRiskReducing',
      msg: 'InvalidOrderNotRiskReducing',
    },
    {
      code: 6047,
      name: 'InvalidOrderSizeTooSmall',
      msg: 'InvalidOrderSizeTooSmall',
    },
    {
      code: 6048,
      name: 'InvalidOrderNotStepSizeMultiple',
      msg: 'InvalidOrderNotStepSizeMultiple',
    },
    {
      code: 6049,
      name: 'InvalidOrderBaseQuoteAsset',
      msg: 'InvalidOrderBaseQuoteAsset',
    },
    {
      code: 6050,
      name: 'InvalidOrderIOC',
      msg: 'InvalidOrderIOC',
    },
    {
      code: 6051,
      name: 'InvalidOrderPostOnly',
      msg: 'InvalidOrderPostOnly',
    },
    {
      code: 6052,
      name: 'InvalidOrderIOCPostOnly',
      msg: 'InvalidOrderIOCPostOnly',
    },
    {
      code: 6053,
      name: 'InvalidOrderTrigger',
      msg: 'InvalidOrderTrigger',
    },
    {
      code: 6054,
      name: 'InvalidOrderAuction',
      msg: 'InvalidOrderAuction',
    },
    {
      code: 6055,
      name: 'InvalidOrderOracleOffset',
      msg: 'InvalidOrderOracleOffset',
    },
    {
      code: 6056,
      name: 'InvalidOrderMinOrderSize',
      msg: 'InvalidOrderMinOrderSize',
    },
    {
      code: 6057,
      name: 'PlacePostOnlyLimitFailure',
      msg: 'Failed to Place Post-Only Limit Order',
    },
    {
      code: 6058,
      name: 'UserHasNoOrder',
      msg: 'User has no order',
    },
    {
      code: 6059,
      name: 'OrderAmountTooSmall',
      msg: 'Order Amount Too Small',
    },
    {
      code: 6060,
      name: 'MaxNumberOfOrders',
      msg: 'Max number of orders taken',
    },
    {
      code: 6061,
      name: 'OrderDoesNotExist',
      msg: 'Order does not exist',
    },
    {
      code: 6062,
      name: 'OrderNotOpen',
      msg: 'Order not open',
    },
    {
      code: 6063,
      name: 'FillOrderDidNotUpdateState',
      msg: 'FillOrderDidNotUpdateState',
    },
    {
      code: 6064,
      name: 'ReduceOnlyOrderIncreasedRisk',
      msg: 'Reduce only order increased risk',
    },
    {
      code: 6065,
      name: 'UnableToLoadAccountLoader',
      msg: 'Unable to load AccountLoader',
    },
    {
      code: 6066,
      name: 'TradeSizeTooLarge',
      msg: 'Trade Size Too Large',
    },
    {
      code: 6067,
      name: 'UserCantReferThemselves',
      msg: 'User cant refer themselves',
    },
    {
      code: 6068,
      name: 'DidNotReceiveExpectedReferrer',
      msg: 'Did not receive expected referrer',
    },
    {
      code: 6069,
      name: 'CouldNotDeserializeReferrer',
      msg: 'Could not deserialize referrer',
    },
    {
      code: 6070,
      name: 'CouldNotDeserializeReferrerStats',
      msg: 'Could not deserialize referrer stats',
    },
    {
      code: 6071,
      name: 'UserOrderIdAlreadyInUse',
      msg: 'User Order Id Already In Use',
    },
    {
      code: 6072,
      name: 'NoPositionsLiquidatable',
      msg: 'No positions liquidatable',
    },
    {
      code: 6073,
      name: 'InvalidMarginRatio',
      msg: 'Invalid Margin Ratio',
    },
    {
      code: 6074,
      name: 'CantCancelPostOnlyOrder',
      msg: 'Cant Cancel Post Only Order',
    },
    {
      code: 6075,
      name: 'InvalidOracleOffset',
      msg: 'InvalidOracleOffset',
    },
    {
      code: 6076,
      name: 'CantExpireOrders',
      msg: 'CantExpireOrders',
    },
    {
      code: 6077,
      name: 'CouldNotLoadMarketData',
      msg: 'CouldNotLoadMarketData',
    },
    {
      code: 6078,
      name: 'PerpMarketNotFound',
      msg: 'PerpMarketNotFound',
    },
    {
      code: 6079,
      name: 'InvalidMarketAccount',
      msg: 'InvalidMarketAccount',
    },
    {
      code: 6080,
      name: 'UnableToLoadPerpMarketAccount',
      msg: 'UnableToLoadMarketAccount',
    },
    {
      code: 6081,
      name: 'MarketWrongMutability',
      msg: 'MarketWrongMutability',
    },
    {
      code: 6082,
      name: 'UnableToCastUnixTime',
      msg: 'UnableToCastUnixTime',
    },
    {
      code: 6083,
      name: 'CouldNotFindSpotPosition',
      msg: 'CouldNotFindSpotPosition',
    },
    {
      code: 6084,
      name: 'NoSpotPositionAvailable',
      msg: 'NoSpotPositionAvailable',
    },
    {
      code: 6085,
      name: 'InvalidSpotMarketInitialization',
      msg: 'InvalidSpotMarketInitialization',
    },
    {
      code: 6086,
      name: 'CouldNotLoadSpotMarketData',
      msg: 'CouldNotLoadSpotMarketData',
    },
    {
      code: 6087,
      name: 'SpotMarketNotFound',
      msg: 'SpotMarketNotFound',
    },
    {
      code: 6088,
      name: 'InvalidSpotMarketAccount',
      msg: 'InvalidSpotMarketAccount',
    },
    {
      code: 6089,
      name: 'UnableToLoadSpotMarketAccount',
      msg: 'UnableToLoadSpotMarketAccount',
    },
    {
      code: 6090,
      name: 'SpotMarketWrongMutability',
      msg: 'SpotMarketWrongMutability',
    },
    {
      code: 6091,
      name: 'SpotMarketInterestNotUpToDate',
      msg: 'SpotInterestNotUpToDate',
    },
    {
      code: 6092,
      name: 'SpotMarketInsufficientDeposits',
      msg: 'SpotMarketInsufficientDeposits',
    },
    {
      code: 6093,
      name: 'UserMustSettleTheirOwnPositiveUnsettledPNL',
      msg: 'UserMustSettleTheirOwnPositiveUnsettledPNL',
    },
    {
      code: 6094,
      name: 'CantUpdatePoolBalanceType',
      msg: 'CantUpdatePoolBalanceType',
    },
    {
      code: 6095,
      name: 'InsufficientCollateralForSettlingPNL',
      msg: 'InsufficientCollateralForSettlingPNL',
    },
    {
      code: 6096,
      name: 'AMMNotUpdatedInSameSlot',
      msg: 'AMMNotUpdatedInSameSlot',
    },
    {
      code: 6097,
      name: 'AuctionNotComplete',
      msg: 'AuctionNotComplete',
    },
    {
      code: 6098,
      name: 'MakerNotFound',
      msg: 'MakerNotFound',
    },
    {
      code: 6099,
      name: 'MakerStatsNotFound',
      msg: 'MakerNotFound',
    },
    {
      code: 6100,
      name: 'MakerMustBeWritable',
      msg: 'MakerMustBeWritable',
    },
    {
      code: 6101,
      name: 'MakerStatsMustBeWritable',
      msg: 'MakerMustBeWritable',
    },
    {
      code: 6102,
      name: 'MakerOrderNotFound',
      msg: 'MakerOrderNotFound',
    },
    {
      code: 6103,
      name: 'CouldNotDeserializeMaker',
      msg: 'CouldNotDeserializeMaker',
    },
    {
      code: 6104,
      name: 'CouldNotDeserializeMakerStats',
      msg: 'CouldNotDeserializeMaker',
    },
    {
      code: 6105,
      name: 'AuctionPriceDoesNotSatisfyMaker',
      msg: 'AuctionPriceDoesNotSatisfyMaker',
    },
    {
      code: 6106,
      name: 'MakerCantFulfillOwnOrder',
      msg: 'MakerCantFulfillOwnOrder',
    },
    {
      code: 6107,
      name: 'MakerOrderMustBePostOnly',
      msg: 'MakerOrderMustBePostOnly',
    },
    {
      code: 6108,
      name: 'CantMatchTwoPostOnlys',
      msg: 'CantMatchTwoPostOnlys',
    },
    {
      code: 6109,
      name: 'OrderBreachesOraclePriceLimits',
      msg: 'OrderBreachesOraclePriceLimits',
    },
    {
      code: 6110,
      name: 'OrderMustBeTriggeredFirst',
      msg: 'OrderMustBeTriggeredFirst',
    },
    {
      code: 6111,
      name: 'OrderNotTriggerable',
      msg: 'OrderNotTriggerable',
    },
    {
      code: 6112,
      name: 'OrderDidNotSatisfyTriggerCondition',
      msg: 'OrderDidNotSatisfyTriggerCondition',
    },
    {
      code: 6113,
      name: 'PositionAlreadyBeingLiquidated',
      msg: 'PositionAlreadyBeingLiquidated',
    },
    {
      code: 6114,
      name: 'PositionDoesntHaveOpenPositionOrOrders',
      msg: 'PositionDoesntHaveOpenPositionOrOrders',
    },
    {
      code: 6115,
      name: 'AllOrdersAreAlreadyLiquidations',
      msg: 'AllOrdersAreAlreadyLiquidations',
    },
    {
      code: 6116,
      name: 'CantCancelLiquidationOrder',
      msg: 'CantCancelLiquidationOrder',
    },
    {
      code: 6117,
      name: 'UserIsBeingLiquidated',
      msg: 'UserIsBeingLiquidated',
    },
    {
      code: 6118,
      name: 'LiquidationsOngoing',
      msg: 'LiquidationsOngoing',
    },
    {
      code: 6119,
      name: 'WrongSpotBalanceType',
      msg: 'WrongSpotBalanceType',
    },
    {
      code: 6120,
      name: 'UserCantLiquidateThemself',
      msg: 'UserCantLiquidateThemself',
    },
    {
      code: 6121,
      name: 'InvalidPerpPositionToLiquidate',
      msg: 'InvalidPerpPositionToLiquidate',
    },
    {
      code: 6122,
      name: 'InvalidBaseAssetAmountForLiquidatePerp',
      msg: 'InvalidBaseAssetAmountForLiquidatePerp',
    },
    {
      code: 6123,
      name: 'InvalidPositionLastFundingRate',
      msg: 'InvalidPositionLastFundingRate',
    },
    {
      code: 6124,
      name: 'InvalidPositionDelta',
      msg: 'InvalidPositionDelta',
    },
    {
      code: 6125,
      name: 'UserBankrupt',
      msg: 'UserBankrupt',
    },
    {
      code: 6126,
      name: 'UserNotBankrupt',
      msg: 'UserNotBankrupt',
    },
    {
      code: 6127,
      name: 'UserHasInvalidBorrow',
      msg: 'UserHasInvalidBorrow',
    },
    {
      code: 6128,
      name: 'DailyWithdrawLimit',
      msg: 'DailyWithdrawLimit',
    },
    {
      code: 6129,
      name: 'DefaultError',
      msg: 'DefaultError',
    },
    {
      code: 6130,
      name: 'InsufficientLPTokens',
      msg: 'Insufficient LP tokens',
    },
    {
      code: 6131,
      name: 'CantLPWithPerpPosition',
      msg: 'Cant LP with a market position',
    },
    {
      code: 6132,
      name: 'UnableToBurnLPTokens',
      msg: 'Unable to burn LP tokens',
    },
    {
      code: 6133,
      name: 'TryingToRemoveLiquidityTooFast',
      msg: 'Trying to remove liqudity too fast after adding it',
    },
    {
      code: 6134,
      name: 'InvalidSpotMarketVault',
      msg: 'Invalid Spot Market Vault',
    },
    {
      code: 6135,
      name: 'InvalidSpotMarketState',
      msg: 'Invalid Spot Market State',
    },
    {
      code: 6136,
      name: 'InvalidSerumProgram',
      msg: 'InvalidSerumProgram',
    },
    {
      code: 6137,
      name: 'InvalidSerumMarket',
      msg: 'InvalidSerumMarket',
    },
    {
      code: 6138,
      name: 'InvalidSerumBids',
      msg: 'InvalidSerumBids',
    },
    {
      code: 6139,
      name: 'InvalidSerumAsks',
      msg: 'InvalidSerumAsks',
    },
    {
      code: 6140,
      name: 'InvalidSerumOpenOrders',
      msg: 'InvalidSerumOpenOrders',
    },
    {
      code: 6141,
      name: 'FailedSerumCPI',
      msg: 'FailedSerumCPI',
    },
    {
      code: 6142,
      name: 'FailedToFillOnExternalMarket',
      msg: 'FailedToFillOnExternalMarket',
    },
    {
      code: 6143,
      name: 'InvalidFulfillmentConfig',
      msg: 'InvalidFulfillmentConfig',
    },
    {
      code: 6144,
      name: 'InvalidFeeStructure',
      msg: 'InvalidFeeStructure',
    },
    {
      code: 6145,
      name: 'InsufficientIFShares',
      msg: 'Insufficient IF shares',
    },
    {
      code: 6146,
      name: 'MarketActionPaused',
      msg: 'the Market has paused this action',
    },
    {
      code: 6147,
      name: 'MarketPlaceOrderPaused',
      msg: 'the Market status doesnt allow placing orders',
    },
    {
      code: 6148,
      name: 'MarketFillOrderPaused',
      msg: 'the Market status doesnt allow filling orders',
    },
    {
      code: 6149,
      name: 'MarketWithdrawPaused',
      msg: 'the Market status doesnt allow withdraws',
    },
    {
      code: 6150,
      name: 'ProtectedAssetTierViolation',
      msg: 'Action violates the Protected Asset Tier rules',
    },
    {
      code: 6151,
      name: 'IsolatedAssetTierViolation',
      msg: 'Action violates the Isolated Asset Tier rules',
    },
    {
      code: 6152,
      name: 'UserCantBeDeleted',
      msg: 'User Cant Be Deleted',
    },
    {
      code: 6153,
      name: 'ReduceOnlyWithdrawIncreasedRisk',
      msg: 'Reduce Only Withdraw Increased Risk',
    },
    {
      code: 6154,
      name: 'MaxOpenInterest',
      msg: 'Max Open Interest',
    },
    {
      code: 6155,
      name: 'CantResolvePerpBankruptcy',
      msg: 'Cant Resolve Perp Bankruptcy',
    },
    {
      code: 6156,
      name: 'LiquidationDoesntSatisfyLimitPrice',
      msg: 'Liquidation Doesnt Satisfy Limit Price',
    },
    {
      code: 6157,
      name: 'MarginTradingDisabled',
      msg: 'Margin Trading Disabled',
    },
    {
      code: 6158,
      name: 'InvalidMarketStatusToSettlePnl',
      msg: 'Invalid Market Status to Settle Perp Pnl',
    },
    {
      code: 6159,
      name: 'PerpMarketNotInSettlement',
      msg: 'PerpMarketNotInSettlement',
    },
    {
      code: 6160,
      name: 'PerpMarketNotInReduceOnly',
      msg: 'PerpMarketNotInReduceOnly',
    },
    {
      code: 6161,
      name: 'PerpMarketSettlementBufferNotReached',
      msg: 'PerpMarketSettlementBufferNotReached',
    },
    {
      code: 6162,
      name: 'PerpMarketSettlementUserHasOpenOrders',
      msg: 'PerpMarketSettlementUserHasOpenOrders',
    },
    {
      code: 6163,
      name: 'PerpMarketSettlementUserHasActiveLP',
      msg: 'PerpMarketSettlementUserHasActiveLP',
    },
    {
      code: 6164,
      name: 'UnableToSettleExpiredUserPosition',
      msg: 'UnableToSettleExpiredUserPosition',
    },
    {
      code: 6165,
      name: 'UnequalMarketIndexForSpotTransfer',
      msg: 'UnequalMarketIndexForSpotTransfer',
    },
    {
      code: 6166,
      name: 'InvalidPerpPositionDetected',
      msg: 'InvalidPerpPositionDetected',
    },
    {
      code: 6167,
      name: 'InvalidSpotPositionDetected',
      msg: 'InvalidSpotPositionDetected',
    },
    {
      code: 6168,
      name: 'InvalidAmmDetected',
      msg: 'InvalidAmmDetected',
    },
    {
      code: 6169,
      name: 'InvalidAmmForFillDetected',
      msg: 'InvalidAmmForFillDetected',
    },
    {
      code: 6170,
      name: 'InvalidAmmLimitPriceOverride',
      msg: 'InvalidAmmLimitPriceOverride',
    },
    {
      code: 6171,
      name: 'InvalidOrderFillPrice',
      msg: 'InvalidOrderFillPrice',
    },
    {
      code: 6172,
      name: 'SpotMarketBalanceInvariantViolated',
      msg: 'SpotMarketBalanceInvariantViolated',
    },
    {
      code: 6173,
      name: 'SpotMarketVaultInvariantViolated',
      msg: 'SpotMarketVaultInvariantViolated',
    },
    {
      code: 6174,
      name: 'InvalidPDA',
      msg: 'InvalidPDA',
    },
    {
      code: 6175,
      name: 'InvalidPDASigner',
      msg: 'InvalidPDASigner',
    },
    {
      code: 6176,
      name: 'RevenueSettingsCannotSettleToIF',
      msg: 'RevenueSettingsCannotSettleToIF',
    },
    {
      code: 6177,
      name: 'NoRevenueToSettleToIF',
      msg: 'NoRevenueToSettleToIF',
    },
    {
      code: 6178,
      name: 'NoAmmPerpPnlDeficit',
      msg: 'NoAmmPerpPnlDeficit',
    },
    {
      code: 6179,
      name: 'SufficientPerpPnlPool',
      msg: 'SufficientPerpPnlPool',
    },
    {
      code: 6180,
      name: 'InsufficientPerpPnlPool',
      msg: 'InsufficientPerpPnlPool',
    },
    {
      code: 6181,
      name: 'PerpPnlDeficitBelowThreshold',
      msg: 'PerpPnlDeficitBelowThreshold',
    },
    {
      code: 6182,
      name: 'MaxRevenueWithdrawPerPeriodReached',
      msg: 'MaxRevenueWithdrawPerPeriodReached',
    },
    {
      code: 6183,
      name: 'MaxIFWithdrawReached',
      msg: 'InvalidSpotPositionDetected',
    },
    {
      code: 6184,
      name: 'NoIFWithdrawAvailable',
      msg: 'NoIFWithdrawAvailable',
    },
    {
      code: 6185,
      name: 'InvalidIFUnstake',
      msg: 'InvalidIFUnstake',
    },
    {
      code: 6186,
      name: 'InvalidIFUnstakeSize',
      msg: 'InvalidIFUnstakeSize',
    },
    {
      code: 6187,
      name: 'InvalidIFUnstakeCancel',
      msg: 'InvalidIFUnstakeCancel',
    },
    {
      code: 6188,
      name: 'InvalidIFForNewStakes',
      msg: 'InvalidIFForNewStakes',
    },
    {
      code: 6189,
      name: 'InvalidIFRebase',
      msg: 'InvalidIFRebase',
    },
    {
      code: 6190,
      name: 'InvalidInsuranceUnstakeSize',
      msg: 'InvalidInsuranceUnstakeSize',
    },
    {
      code: 6191,
      name: 'InvalidOrderLimitPrice',
      msg: 'InvalidOrderLimitPrice',
    },
    {
      code: 6192,
      name: 'InvalidIFDetected',
      msg: 'InvalidIFDetected',
    },
    {
      code: 6193,
      name: 'InvalidAmmMaxSpreadDetected',
      msg: 'InvalidAmmMaxSpreadDetected',
    },
    {
      code: 6194,
      name: 'InvalidConcentrationCoef',
      msg: 'InvalidConcentrationCoef',
    },
    {
      code: 6195,
      name: 'InvalidSrmVault',
      msg: 'InvalidSrmVault',
    },
    {
      code: 6196,
      name: 'InvalidVaultOwner',
      msg: 'InvalidVaultOwner',
    },
    {
      code: 6197,
      name: 'InvalidMarketStatusForFills',
      msg: 'InvalidMarketStatusForFills',
    },
    {
      code: 6198,
      name: 'IFWithdrawRequestInProgress',
      msg: 'IFWithdrawRequestInProgress',
    },
    {
      code: 6199,
      name: 'NoIFWithdrawRequestInProgress',
      msg: 'NoIFWithdrawRequestInProgress',
    },
    {
      code: 6200,
      name: 'IFWithdrawRequestTooSmall',
      msg: 'IFWithdrawRequestTooSmall',
    },
    {
      code: 6201,
      name: 'IncorrectSpotMarketAccountPassed',
      msg: 'IncorrectSpotMarketAccountPassed',
    },
    {
      code: 6202,
      name: 'BlockchainClockInconsistency',
      msg: 'BlockchainClockInconsistency',
    },
    {
      code: 6203,
      name: 'InvalidIFSharesDetected',
      msg: 'InvalidIFSharesDetected',
    },
    {
      code: 6204,
      name: 'NewLPSizeTooSmall',
      msg: 'NewLPSizeTooSmall',
    },
    {
      code: 6205,
      name: 'MarketStatusInvalidForNewLP',
      msg: 'MarketStatusInvalidForNewLP',
    },
    {
      code: 6206,
      name: 'InvalidMarkTwapUpdateDetected',
      msg: 'InvalidMarkTwapUpdateDetected',
    },
    {
      code: 6207,
      name: 'MarketSettlementAttemptOnActiveMarket',
      msg: 'MarketSettlementAttemptOnActiveMarket',
    },
    {
      code: 6208,
      name: 'MarketSettlementRequiresSettledLP',
      msg: 'MarketSettlementRequiresSettledLP',
    },
    {
      code: 6209,
      name: 'MarketSettlementAttemptTooEarly',
      msg: 'MarketSettlementAttemptTooEarly',
    },
    {
      code: 6210,
      name: 'MarketSettlementTargetPriceInvalid',
      msg: 'MarketSettlementTargetPriceInvalid',
    },
    {
      code: 6211,
      name: 'UnsupportedSpotMarket',
      msg: 'UnsupportedSpotMarket',
    },
    {
      code: 6212,
      name: 'SpotOrdersDisabled',
      msg: 'SpotOrdersDisabled',
    },
    {
      code: 6213,
      name: 'MarketBeingInitialized',
      msg: 'Market Being Initialized',
    },
    {
      code: 6214,
      name: 'InvalidUserSubAccountId',
      msg: 'Invalid Sub Account Id',
    },
    {
      code: 6215,
      name: 'InvalidTriggerOrderCondition',
      msg: 'Invalid Trigger Order Condition',
    },
    {
      code: 6216,
      name: 'InvalidSpotPosition',
      msg: 'Invalid Spot Position',
    },
    {
      code: 6217,
      name: 'CantTransferBetweenSameUserAccount',
      msg: 'Cant transfer between same user account',
    },
    {
      code: 6218,
      name: 'InvalidPerpPosition',
      msg: 'Invalid Perp Position',
    },
    {
      code: 6219,
      name: 'UnableToGetLimitPrice',
      msg: 'Unable To Get Limit Price',
    },
    {
      code: 6220,
      name: 'InvalidLiquidation',
      msg: 'Invalid Liquidation',
    },
    {
      code: 6221,
      name: 'SpotFulfillmentConfigDisabled',
      msg: 'Spot Fulfillment Config Disabled',
    },
    {
      code: 6222,
      name: 'InvalidMaker',
      msg: 'Invalid Maker',
    },
    {
      code: 6223,
      name: 'FailedUnwrap',
      msg: 'Failed Unwrap',
    },
    {
      code: 6224,
      name: 'MaxNumberOfUsers',
      msg: 'Max Number Of Users',
    },
    {
      code: 6225,
      name: 'InvalidOracleForSettlePnl',
      msg: 'InvalidOracleForSettlePnl',
    },
    {
      code: 6226,
      name: 'MarginOrdersOpen',
      msg: 'MarginOrdersOpen',
    },
    {
      code: 6227,
      name: 'TierViolationLiquidatingPerpPnl',
      msg: 'TierViolationLiquidatingPerpPnl',
    },
    {
      code: 6228,
      name: 'CouldNotLoadUserData',
      msg: 'CouldNotLoadUserData',
    },
    {
      code: 6229,
      name: 'UserWrongMutability',
      msg: 'UserWrongMutability',
    },
    {
      code: 6230,
      name: 'InvalidUserAccount',
      msg: 'InvalidUserAccount',
    },
    {
      code: 6231,
      name: 'CouldNotLoadUserStatsData',
      msg: 'CouldNotLoadUserData',
    },
    {
      code: 6232,
      name: 'UserStatsWrongMutability',
      msg: 'UserWrongMutability',
    },
    {
      code: 6233,
      name: 'InvalidUserStatsAccount',
      msg: 'InvalidUserAccount',
    },
    {
      code: 6234,
      name: 'UserNotFound',
      msg: 'UserNotFound',
    },
    {
      code: 6235,
      name: 'UnableToLoadUserAccount',
      msg: 'UnableToLoadUserAccount',
    },
    {
      code: 6236,
      name: 'UserStatsNotFound',
      msg: 'UserStatsNotFound',
    },
    {
      code: 6237,
      name: 'UnableToLoadUserStatsAccount',
      msg: 'UnableToLoadUserStatsAccount',
    },
    {
      code: 6238,
      name: 'UserNotInactive',
      msg: 'User Not Inactive',
    },
    {
      code: 6239,
      name: 'RevertFill',
      msg: 'RevertFill',
    },
    {
      code: 6240,
      name: 'InvalidMarketAccountforDeletion',
      msg: 'Invalid MarketAccount for Deletion',
    },
    {
      code: 6241,
      name: 'InvalidSpotFulfillmentParams',
      msg: 'Invalid Spot Fulfillment Params',
    },
    {
      code: 6242,
      name: 'FailedToGetMint',
      msg: 'Failed to Get Mint',
    },
    {
      code: 6243,
      name: 'FailedPhoenixCPI',
      msg: 'FailedPhoenixCPI',
    },
    {
      code: 6244,
      name: 'FailedToDeserializePhoenixMarket',
      msg: 'FailedToDeserializePhoenixMarket',
    },
    {
      code: 6245,
      name: 'InvalidPricePrecision',
      msg: 'InvalidPricePrecision',
    },
    {
      code: 6246,
      name: 'InvalidPhoenixProgram',
      msg: 'InvalidPhoenixProgram',
    },
    {
      code: 6247,
      name: 'InvalidPhoenixMarket',
      msg: 'InvalidPhoenixMarket',
    },
    {
      code: 6248,
      name: 'InvalidSwap',
      msg: 'InvalidSwap',
    },
    {
      code: 6249,
      name: 'SwapLimitPriceBreached',
      msg: 'SwapLimitPriceBreached',
    },
    {
      code: 6250,
      name: 'SpotMarketReduceOnly',
      msg: 'SpotMarketReduceOnly',
    },
    {
      code: 6251,
      name: 'FundingWasNotUpdated',
      msg: 'FundingWasNotUpdated',
    },
    {
      code: 6252,
      name: 'ImpossibleFill',
      msg: 'ImpossibleFill',
    },
    {
      code: 6253,
      name: 'CantUpdatePerpBidAskTwap',
      msg: 'CantUpdatePerpBidAskTwap',
    },
    {
      code: 6254,
      name: 'UserReduceOnly',
      msg: 'UserReduceOnly',
    },
    {
      code: 6255,
      name: 'InvalidMarginCalculation',
      msg: 'InvalidMarginCalculation',
    },
    {
      code: 6256,
      name: 'CantPayUserInitFee',
      msg: 'CantPayUserInitFee',
    },
    {
      code: 6257,
      name: 'CantReclaimRent',
      msg: 'CantReclaimRent',
    },
  ],
}
