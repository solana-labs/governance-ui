import { Idl } from '@project-serum/anchor'

export const UXD_PROGRAM_ID = 'UXDQDbkAeGMPR7gqDykDNu22D9DnYrKdvZhvNmMu6QX'

const uxdIdl: Idl = {
  version: '1.2.0',
  name: 'uxd',
  instructions: [
    {
      name: 'initializeController',
      accounts: [
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
          name: 'controller',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'redeemableMint',
          isMut: true,
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
          name: 'redeemableMintBump',
          type: 'u8',
        },
        {
          name: 'redeemableMintDecimals',
          type: 'u8',
        },
      ],
    },
    {
      name: 'setRedeemableGlobalSupplyCap',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'controller',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'redeemableGlobalSupplyCap',
          type: 'u128',
        },
      ],
    },
    {
      name: 'setMangoDepositoriesRedeemableSoftCap',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'controller',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'redeemableSoftCap',
          type: 'u64',
        },
      ],
    },
    {
      name: 'registerMangoDepository',
      accounts: [
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
          name: 'controller',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depository',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'depositoryCollateralPassthroughAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositoryInsurancePassthroughAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositoryMangoAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoGroup',
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
        {
          name: 'mangoProgram',
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
          name: 'collateralPassthroughBump',
          type: 'u8',
        },
        {
          name: 'insurancePassthroughBump',
          type: 'u8',
        },
        {
          name: 'mangoAccountBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'depositInsuranceToMangoDepository',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'controller',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depository',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authorityInsurance',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositoryInsurancePassthroughAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositoryMangoAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoGroup',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoCache',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoRootBank',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoNodeBank',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'insuranceAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawInsuranceFromMangoDepository',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'controller',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depository',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'insuranceMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authorityInsurance',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositoryInsurancePassthroughAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositoryMangoAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoGroup',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoCache',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoRootBank',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoNodeBank',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoVault',
          isMut: true,
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
        {
          name: 'mangoProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'insuranceAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'mintWithMangoDepository',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'controller',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depository',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'redeemableMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userCollateral',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userRedeemable',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositoryCollateralPassthroughAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositoryMangoAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoGroup',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoCache',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoRootBank',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoNodeBank',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoPerpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoBids',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoAsks',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoEventQueue',
          isMut: true,
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
        {
          name: 'mangoProgram',
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
          name: 'collateralAmount',
          type: 'u64',
        },
        {
          name: 'slippage',
          type: 'u32',
        },
      ],
    },
    {
      name: 'redeemFromMangoDepository',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'controller',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depository',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userCollateral',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userRedeemable',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'redeemableMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositoryCollateralPassthroughAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositoryMangoAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoGroup',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoCache',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoRootBank',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mangoNodeBank',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoPerpMarket',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoBids',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoAsks',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mangoEventQueue',
          isMut: true,
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
        {
          name: 'mangoProgram',
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
          name: 'redeemableAmount',
          type: 'u64',
        },
        {
          name: 'slippage',
          type: 'u32',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'Controller',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'redeemableMintBump',
            type: 'u8',
          },
          {
            name: 'version',
            type: 'u8',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'redeemableMint',
            type: 'publicKey',
          },
          {
            name: 'redeemableMintDecimals',
            type: 'u8',
          },
          {
            name: 'registeredMangoDepositories',
            type: {
              array: ['publicKey', 8],
            },
          },
          {
            name: 'registeredMangoDepositoriesCount',
            type: 'u8',
          },
          {
            name: 'redeemableGlobalSupplyCap',
            type: 'u128',
          },
          {
            name: 'mangoDepositoriesRedeemableSoftCap',
            type: 'u64',
          },
          {
            name: 'redeemableCirculatingSupply',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'MangoDepository',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'collateralPassthroughBump',
            type: 'u8',
          },
          {
            name: 'insurancePassthroughBump',
            type: 'u8',
          },
          {
            name: 'mangoAccountBump',
            type: 'u8',
          },
          {
            name: 'version',
            type: 'u8',
          },
          {
            name: 'collateralMint',
            type: 'publicKey',
          },
          {
            name: 'collateralPassthrough',
            type: 'publicKey',
          },
          {
            name: 'insuranceMint',
            type: 'publicKey',
          },
          {
            name: 'insurancePassthrough',
            type: 'publicKey',
          },
          {
            name: 'mangoAccount',
            type: 'publicKey',
          },
          {
            name: 'controller',
            type: 'publicKey',
          },
          {
            name: 'insuranceAmountDeposited',
            type: 'u128',
          },
          {
            name: 'collateralAmountDeposited',
            type: 'u128',
          },
          {
            name: 'redeemableAmountUnderManagement',
            type: 'u128',
          },
          {
            name: 'deltaNeutralQuoteFeeOffset',
            type: 'u128',
          },
          {
            name: 'deltaNeutralQuotePosition',
            type: 'u128',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'AccountingEvent',
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
  ],
  errors: [
    {
      code: 6000,
      name: 'InvalidRedeemableMintDecimals',
      msg: 'The redeemable mint decimals must be between 0 and 9 (inclusive).',
    },
    {
      code: 6001,
      name: 'InvalidRedeemableGlobalSupplyCap',
      msg:
        'The redeemable global supply cap must be below MAX_REDEEMABLE_GLOBAL_SUPPLY_CAP.',
    },
    {
      code: 6002,
      name: 'RootBankIndexNotFound',
      msg:
        'The associated mango root bank index cannot be found for the deposited coin..',
    },
    {
      code: 6003,
      name: 'InvalidSlippage',
      msg:
        'The slippage value is invalid. Must be in the [0...1000] range points.',
    },
    {
      code: 6004,
      name: 'InvalidCollateralMint',
      msg:
        "The provided collateral mint does not match the depository's collateral mint.",
    },
    {
      code: 6005,
      name: 'InvalidInsuranceMint',
      msg:
        "The provided insurance mint does not match the depository's insurance mint.",
    },
    {
      code: 6006,
      name: 'InvalidCollateralAmount',
      msg: 'Collateral amount must be > 0 in order to mint.',
    },
    {
      code: 6007,
      name: 'InsuficientCollateralAmount',
      msg:
        'The balance of the collateral ATA is not enough to fulfill the mint operation.',
    },
    {
      code: 6008,
      name: 'InvalidRedeemableAmount',
      msg: 'The redeemable amount for redeem must be superior to 0.',
    },
    {
      code: 6009,
      name: 'InsuficientRedeemableAmount',
      msg:
        'The balance of the redeemable ATA is not enough to fulfill the redeem operation.',
    },
    {
      code: 6010,
      name: 'InvalidAuthority',
      msg:
        'Only the Program initializer authority can access this instructions.',
    },
    {
      code: 6011,
      name: 'InvalidRedeemableMint',
      msg: "The Redeemable Mint provided does not match the Controller's one.",
    },
    {
      code: 6012,
      name: 'InvalidUserRedeemableATAMint',
      msg:
        "The user's Redeemable ATA's mint does not match the Controller's one.",
    },
    {
      code: 6013,
      name: 'InvalidUserCollateralATAMint',
      msg:
        "The user's Collateral ATA's mint does not match the Depository's one.",
    },
    {
      code: 6014,
      name: 'InvalidAuthorityInsuranceATAMint',
      msg:
        "The authority's Insurance ATA's mint does not match the Depository's one.",
    },
    {
      code: 6015,
      name: 'InvalidCollateralPassthroughATAMint',
      msg:
        "The Depository Collateral Passthrough ATA's mint does not match the Depository's one.",
    },
    {
      code: 6016,
      name: 'InvalidInsurancePassthroughATAMint',
      msg:
        "The Depository Insurance Passthrough ATA's mint does not match the Depository's one.",
    },
    {
      code: 6017,
      name: 'PerpOrderPartiallyFilled',
      msg:
        'The perp position could not be fully filled with the provided slippage.',
    },
    {
      code: 6018,
      name: 'PositionAmountCalculation',
      msg:
        'Error while getting the redeemable value of the deposited coin amount.',
    },
    {
      code: 6019,
      name: 'RedeemableGlobalSupplyCapReached',
      msg: 'Minting amount would go past the Redeemable Global Supply Cap.',
    },
    {
      code: 6020,
      name: 'MangoDepositoriesSoftCapOverflow',
      msg: 'Operation not allowed due to being over the Redeemable soft Cap.',
    },
    {
      code: 6030,
      name: 'MaxNumberOfMangoDepositoriesRegisteredReached',
      msg:
        'Cannot register more mango depositories, the limit has been reached.',
    },
    {
      code: 6031,
      name: 'InvalidController',
      msg: "The Depository's controller doesn't match the provided Controller.",
    },
    {
      code: 6032,
      name: 'InvalidDepository',
      msg: 'The Depository provided is not registered with the Controller.',
    },
    {
      code: 6033,
      name: 'InvalidCollateralPassthroughAccount',
      msg: "The Collateral Passthrough Account isn't the Deposiroty one.",
    },
    {
      code: 6034,
      name: 'InvalidInsurancePassthroughAccount',
      msg: "The Insurance Passthrough Account isn't the Deposiroty one.",
    },
    {
      code: 6035,
      name: 'InvalidMangoAccount',
      msg: "The Mango Account isn't the Deposiroty one.",
    },
    {
      code: 6036,
      name: 'InvalidInsuranceAmount',
      msg:
        'The amount to withdraw from the Insurance Fund must be superior to zero..',
    },
    {
      code: 6037,
      name: 'InsuficientAuthorityInsuranceAmount',
      msg: "The Insurance ATA from authority doesn't have enough balance.",
    },
    {
      code: 6038,
      name: 'InvalidRebalancingAmount',
      msg: 'The max amount to rebalance must be superior to zero..',
    },
    {
      code: 6039,
      name: 'InsuficentOrderBookDepth',
      msg: 'Insuficcent order book depth for order.',
    },
    {
      code: 6040,
      name: 'InvalidExecutedOrderSize',
      msg: 'The executed order size does not match the expected one.',
    },
    {
      code: 6080,
      name: 'MangoOrderBookLoading',
      msg: 'Could not load Mango Order book.',
    },
    {
      code: 6081,
      name: 'MangoGroupLoading',
      msg: 'Could not load Mango Group.',
    },
    {
      code: 6082,
      name: 'MangoCacheLoading',
      msg: 'Could not load Mango Cache.',
    },
    {
      code: 6083,
      name: 'MangoLoadPerpMarket',
      msg: 'Could not load Mango PerpMarket.',
    },
    {
      code: 6084,
      name: 'MangoAccountLoading',
      msg: 'Could not load Mango Account.',
    },
    {
      code: 6085,
      name: 'MangoPerpMarketIndexNotFound',
      msg: 'Could not find the perp market index for the given collateral.',
    },
    {
      code: 6086,
      name: 'InvalidPerpAccountState',
      msg: 'The Mango PerpAccount has uncommitted changes.',
    },
    {
      code: 6087,
      name: 'InvalidDepositoryAccounting',
      msg: 'The Depository accounting is in an invalid state.',
    },
  ],
}

export default uxdIdl
