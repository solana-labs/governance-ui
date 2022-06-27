import { Idl } from '@project-serum/anchor';

export const LifinityAmmIDL: Idl = {
  version: '0.1.0',
  name: 'lifinity_amm',
  instructions: [
    {
      name: 'depositAllTokenTypes',
      accounts: [
        {
          name: 'amm',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userTransferAuthorityInfo',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'sourceAInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'sourceBInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenA',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenB',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'destination',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'configAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'holderAccountInfo',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'lifinityNftAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lifinityNftMetaAccount',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'poolTokenAmount',
          type: 'u64',
        },
        {
          name: 'maximumTokenAAmount',
          type: 'u64',
        },
        {
          name: 'maximumTokenBAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawAllTokenTypes',
      accounts: [
        {
          name: 'amm',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userTransferAuthorityInfo',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'sourceInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenA',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenB',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'destTokenAInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'destTokenBInfo',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'feeAccount',
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
          name: 'poolTokenAmount',
          type: 'u64',
        },
        {
          name: 'minimumTokenAAmount',
          type: 'u64',
        },
        {
          name: 'minimumTokenBAmount',
          type: 'u64',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'amm',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'initializerKey',
            type: 'publicKey',
          },
          {
            name: 'initializerDepositTokenAccount',
            type: 'publicKey',
          },
          {
            name: 'initializerReceiveTokenAccount',
            type: 'publicKey',
          },
          {
            name: 'initializerAmount',
            type: 'u64',
          },
          {
            name: 'takerAmount',
            type: 'u64',
          },
          {
            name: 'isInitialized',
            type: 'bool',
          },
          {
            name: 'bumpSeed',
            type: 'u8',
          },
          {
            name: 'freezeTrade',
            type: 'u8',
          },
          {
            name: 'freezeDeposit',
            type: 'u8',
          },
          {
            name: 'freezeWithdraw',
            type: 'u8',
          },
          {
            name: 'baseDecimals',
            type: 'u8',
          },
          {
            name: 'tokenProgramId',
            type: 'publicKey',
          },
          {
            name: 'tokenAAccount',
            type: 'publicKey',
          },
          {
            name: 'tokenBAccount',
            type: 'publicKey',
          },
          {
            name: 'poolMint',
            type: 'publicKey',
          },
          {
            name: 'tokenAMint',
            type: 'publicKey',
          },
          {
            name: 'tokenBMint',
            type: 'publicKey',
          },
          {
            name: 'poolFeeAccount',
            type: 'publicKey',
          },
          {
            name: 'pythAccount',
            type: 'publicKey',
          },
          {
            name: 'pythPcAccount',
            type: 'publicKey',
          },
          {
            name: 'configAccount',
            type: 'publicKey',
          },
          {
            name: 'ammTemp1',
            type: 'publicKey',
          },
          {
            name: 'ammTemp2',
            type: 'publicKey',
          },
          {
            name: 'ammTemp3',
            type: 'publicKey',
          },
          {
            name: 'fees',
            type: {
              defined: 'FeesInput',
            },
          },
          {
            name: 'curve',
            type: {
              defined: 'CurveInput',
            },
          },
        ],
      },
    },
    {
      name: 'config',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'concentrationRatio',
            type: 'u64',
          },
          {
            name: 'lastPrice',
            type: 'u64',
          },
          {
            name: 'adjustRatio',
            type: 'u64',
          },
          {
            name: 'balanceRatio',
            type: 'u64',
          },
          {
            name: 'lastBalancedPrice',
            type: 'u64',
          },
          {
            name: 'configDenominator',
            type: 'u64',
          },
          {
            name: 'pythConfidenceLimit',
            type: 'u64',
          },
          {
            name: 'pythSlotLimit',
            type: 'u64',
          },
          {
            name: 'volumeX',
            type: 'u64',
          },
          {
            name: 'volumeY',
            type: 'u64',
          },
          {
            name: 'volumeXInY',
            type: 'u64',
          },
          {
            name: 'coefficientUp',
            type: 'u64',
          },
          {
            name: 'coefficientDown',
            type: 'u64',
          },
          {
            name: 'oracleStatus',
            type: 'u64',
          },
          {
            name: 'depositCap',
            type: 'u64',
          },
          {
            name: 'configTemp2',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'metadata',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'key',
            type: 'u8',
          },
          {
            name: 'updateAuthority',
            type: 'publicKey',
          },
          {
            name: 'mint',
            type: 'publicKey',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'FeesInput',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'tradeFeeNumerator',
            type: 'u64',
          },
          {
            name: 'tradeFeeDenominator',
            type: 'u64',
          },
          {
            name: 'ownerTradeFeeNumerator',
            type: 'u64',
          },
          {
            name: 'ownerTradeFeeDenominator',
            type: 'u64',
          },
          {
            name: 'ownerWithdrawFeeNumerator',
            type: 'u64',
          },
          {
            name: 'ownerWithdrawFeeDenominator',
            type: 'u64',
          },
          {
            name: 'hostFeeNumerator',
            type: 'u64',
          },
          {
            name: 'hostFeeDenominator',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'CurveInput',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'curveType',
            type: 'u8',
          },
          {
            name: 'curveParameters',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'ConfigInput',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'concentrationRatio',
            type: 'u64',
          },
          {
            name: 'lastPrice',
            type: 'u64',
          },
          {
            name: 'adjustRatio',
            type: 'u64',
          },
          {
            name: 'balanceRatio',
            type: 'u64',
          },
          {
            name: 'lastBalancedPrice',
            type: 'u64',
          },
          {
            name: 'configDenominator',
            type: 'u64',
          },
          {
            name: 'pythConfidenceLimit',
            type: 'u64',
          },
          {
            name: 'pythSlotLimit',
            type: 'u64',
          },
          {
            name: 'volumeX',
            type: 'u64',
          },
          {
            name: 'volumeY',
            type: 'u64',
          },
          {
            name: 'volumeXInY',
            type: 'u64',
          },
          {
            name: 'coefficientUp',
            type: 'u64',
          },
          {
            name: 'coefficientDown',
            type: 'u64',
          },
          {
            name: 'oracleStatus',
            type: 'u64',
          },
          {
            name: 'depositCap',
            type: 'u64',
          },
          {
            name: 'configTemp2',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'CurveFees',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'tradeFeeNumerator',
            type: 'u64',
          },
          {
            name: 'tradeFeeDenominator',
            type: 'u64',
          },
          {
            name: 'ownerTradeFeeNumerator',
            type: 'u64',
          },
          {
            name: 'ownerTradeFeeDenominator',
            type: 'u64',
          },
          {
            name: 'ownerWithdrawFeeNumerator',
            type: 'u64',
          },
          {
            name: 'ownerWithdrawFeeDenominator',
            type: 'u64',
          },
          {
            name: 'hostFeeNumerator',
            type: 'u64',
          },
          {
            name: 'hostFeeDenominator',
            type: 'u64',
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
      name: 'TradeDirection',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'AtoB',
          },
          {
            name: 'BtoA',
          },
        ],
      },
    },
    {
      name: 'RoundDirection',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Floor',
          },
          {
            name: 'Ceiling',
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
      name: 'InvalidProgramAddress',
      msg: 'Invalid program address generated from bump seed and key',
    },
    {
      code: 6002,
      name: 'InvalidOwner',
      msg: 'Input account owner is not the program address',
    },
    {
      code: 6003,
      name: 'InvalidOutputOwner',
      msg: 'Output pool account owner cannot be the program address',
    },
    {
      code: 6004,
      name: 'ExpectedMint',
      msg: 'Deserialized account is not an SPL Token mint',
    },
    {
      code: 6005,
      name: 'ExpectedAccount',
      msg: 'Deserialized account is not an SPL Token account',
    },
    {
      code: 6006,
      name: 'EmptySupply',
      msg: 'Input token account empty',
    },
    {
      code: 6007,
      name: 'InvalidSupply',
      msg: 'Pool token mint has a non-zero supply',
    },
    {
      code: 6008,
      name: 'InvalidDelegate',
      msg: 'Token account has a delegate',
    },
    {
      code: 6009,
      name: 'InvalidInput',
      msg: 'InvalidInput',
    },
    {
      code: 6010,
      name: 'IncorrectSwapAccount',
      msg: 'Address of the provided swap token account is incorrect',
    },
    {
      code: 6011,
      name: 'IncorrectPoolMint',
      msg: 'Address of the provided pool token mint is incorrect',
    },
    {
      code: 6012,
      name: 'InvalidOutput',
      msg: 'InvalidOutput',
    },
    {
      code: 6013,
      name: 'CalculationFailure',
      msg: 'General calculation failure due to overflow or underflow',
    },
    {
      code: 6014,
      name: 'InvalidInstruction',
      msg: 'Invalid instruction',
    },
    {
      code: 6015,
      name: 'RepeatedMint',
      msg: 'Swap input token accounts have the same mint',
    },
    {
      code: 6016,
      name: 'ExceededSlippage',
      msg: 'Swap instruction exceeds desired slippage limit',
    },
    {
      code: 6017,
      name: 'InvalidCloseAuthority',
      msg: 'Token account has a close authority',
    },
    {
      code: 6018,
      name: 'InvalidFreezeAuthority',
      msg: 'Pool token mint has a freeze authority',
    },
    {
      code: 6019,
      name: 'IncorrectFeeAccount',
      msg: 'Pool fee token account incorrect',
    },
    {
      code: 6020,
      name: 'ZeroTradingTokens',
      msg: 'Given pool token amount results in zero trading tokens',
    },
    {
      code: 6021,
      name: 'FeeCalculationFailure',
      msg: 'Fee calculation failed due to overflow, underflow, or unexpected 0',
    },
    {
      code: 6022,
      name: 'ConversionFailure',
      msg: 'Conversion to u64 failed with an overflow or underflow',
    },
    {
      code: 6023,
      name: 'InvalidFee',
      msg: "The provided fee does not match the program owner's constraints",
    },
    {
      code: 6024,
      name: 'IncorrectTokenProgramId',
      msg:
        'The provided token program does not match the token program expected by the swap',
    },
    {
      code: 6025,
      name: 'IncorrectOracleAccount',
      msg: 'Address of the provided oracle account is incorrect',
    },
    {
      code: 6026,
      name: 'IncorrectConfigAccount',
      msg: 'Address of the provided config account is incorrect',
    },
    {
      code: 6027,
      name: 'UnsupportedCurveType',
      msg: 'The provided curve type is not supported by the program owner',
    },
    {
      code: 6028,
      name: 'InvalidCurve',
      msg: 'The provided curve parameters are invalid',
    },
    {
      code: 6029,
      name: 'UnsupportedCurveOperation',
      msg: 'The operation cannot be performed on the given curve',
    },
    {
      code: 6030,
      name: 'InvalidPythStatus',
      msg: "Pyth oracle status is not 'trading'",
    },
    {
      code: 6031,
      name: 'InvalidPythPrice',
      msg: 'Could not retrieve updated price feed from the Pyth oracle',
    },
    {
      code: 6032,
      name: 'IncorrectSigner',
      msg: 'Address of the provided signer account is incorrect',
    },
    {
      code: 6033,
      name: 'ExceedPoolBalance',
      msg: 'Swap amount exceeds pool balance',
    },
    {
      code: 6034,
      name: 'ProgramIsFrozen',
      msg: 'Program is frozen',
    },
    {
      code: 6035,
      name: 'OracleConfidence',
      msg: 'Oracle confidence is too low',
    },
    {
      code: 6036,
      name: 'InvalidMetaAccount',
      msg: 'Invalid NFT Metadata Account',
    },
    {
      code: 6037,
      name: 'InvalidNFTAccount',
      msg: 'Invalid NFT Holder Account',
    },
    {
      code: 6038,
      name: 'InsufficientNftFunds',
      msg: 'Invalid NFT Amount',
    },
    {
      code: 6039,
      name: 'InvalidNftMint',
      msg: 'Invalid NFT MintAddress',
    },
    {
      code: 6040,
      name: 'InvalidNftAuthority',
      msg: 'Invalid NFT Upgrade Authority',
    },
    {
      code: 6041,
      name: 'OverCapAmount',
      msg: 'Over Pool Cap Amount',
    },
  ],
};
