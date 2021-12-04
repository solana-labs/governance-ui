import { Idl } from '@project-serum/anchor'

const uxdIdl: Idl = {
  version: '0.0.0',
  name: 'uxd',
  instructions: [
    {
      name: 'initializeController',
      accounts: [
        {
          name: 'authority',
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
      code: 300,
      name: 'InvalidRedeemableMintDecimals',
      msg: 'The redeemable mint decimals must be between 0 and 9 (inclusive).',
    },
    {
      code: 301,
      name: 'InvalidRedeemableGlobalSupplyCap',
      msg:
        'The redeemable global supply cap must be below MAX_REDEEMABLE_GLOBAL_SUPPLY_CAP.',
    },
    {
      code: 302,
      name: 'RootBankIndexNotFound',
      msg:
        'The associated mango root bank index cannot be found for the deposited coin..',
    },
    {
      code: 303,
      name: 'InvalidSlippage',
      msg:
        'The slippage value is invalid. Must be in the [0...1000] range points.',
    },
    {
      code: 304,
      name: 'InvalidCollateralMint',
      msg:
        "The provided collateral mint does not match the depository's collateral mint.",
    },
    {
      code: 305,
      name: 'InvalidInsuranceMint',
      msg:
        "The provided insurance mint does not match the depository's insurance mint.",
    },
    {
      code: 306,
      name: 'InvalidCollateralAmount',
      msg: 'Collateral amount must be > 0 in order to mint.',
    },
    {
      code: 307,
      name: 'InsuficientCollateralAmount',
      msg:
        'The balance of the collateral ATA is not enough to fulfill the mint operation.',
    },
    {
      code: 308,
      name: 'InvalidRedeemableAmount',
      msg: 'The redeemable amount for redeem must be superior to 0.',
    },
    {
      code: 309,
      name: 'InsuficientRedeemableAmount',
      msg:
        'The balance of the redeemable ATA is not enough to fulfill the redeem operation.',
    },
    {
      code: 310,
      name: 'InvalidAuthority',
      msg:
        'Only the Program initializer authority can access this instructions.',
    },
    {
      code: 311,
      name: 'InvalidRedeemableMint',
      msg: "The Redeemable Mint provided does not match the Controller's one.",
    },
    {
      code: 312,
      name: 'InvalidUserRedeemableATAMint',
      msg:
        "The user's Redeemable ATA's mint does not match the Controller's one.",
    },
    {
      code: 313,
      name: 'InvalidUserCollateralATAMint',
      msg:
        "The user's Collateral ATA's mint does not match the Depository's one.",
    },
    {
      code: 314,
      name: 'InvalidAuthorityInsuranceATAMint',
      msg:
        "The authority's Insurance ATA's mint does not match the Depository's one.",
    },
    {
      code: 315,
      name: 'InvalidCollateralPassthroughATAMint',
      msg:
        "The Depository Collateral Passthrough ATA's mint does not match the Depository's one.",
    },
    {
      code: 316,
      name: 'InvalidInsurancePassthroughATAMint',
      msg:
        "The Depository Insurance Passthrough ATA's mint does not match the Depository's one.",
    },
    {
      code: 317,
      name: 'PerpOrderPartiallyFilled',
      msg:
        'The perp position could not be fully filled with the provided slippage.',
    },
    {
      code: 318,
      name: 'PositionAmountCalculation',
      msg:
        'Error while getting the redeemable value of the deposited coin amount.',
    },
    {
      code: 319,
      name: 'RedeemableGlobalSupplyCapReached',
      msg: 'Minting amount would go past the Redeemable Global Supply Cap.',
    },
    {
      code: 320,
      name: 'MangoDepositoriesSoftCapOverflow',
      msg: 'Operation not allowed due to being over the Redeemable soft Cap.',
    },
    {
      code: 330,
      name: 'MaxNumberOfMangoDepositoriesRegisteredReached',
      msg:
        'Cannot register more mango depositories, the limit has been reached.',
    },
    {
      code: 331,
      name: 'InvalidController',
      msg: "The Depository's controller doesn't match the provided Controller.",
    },
    {
      code: 332,
      name: 'InvalidDepository',
      msg: 'The Depository provided is not registered with the Controller.',
    },
    {
      code: 333,
      name: 'InvalidCollateralPassthroughAccount',
      msg: "The Collateral Passthrough Account isn't the Deposiroty one.",
    },
    {
      code: 334,
      name: 'InvalidInsurancePassthroughAccount',
      msg: "The Insurance Passthrough Account isn't the Deposiroty one.",
    },
    {
      code: 335,
      name: 'InvalidMangoAccount',
      msg: "The Mango Account isn't the Deposiroty one.",
    },
    {
      code: 336,
      name: 'InvalidInsuranceAmount',
      msg:
        'The amount to withdraw from the Insurance Fund must be superior to zero..',
    },
    {
      code: 337,
      name: 'InsuficientAuthorityInsuranceAmount',
      msg: "The Insurance ATA from authority doesn't have enough balance.",
    },
  ],
}

export default uxdIdl
