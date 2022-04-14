'use strict';
(function (_0x24036c, _0x1298b3) {
  var _0x5f1f41 = a0_0x4fd5,
    _0x1bb58f = _0x24036c();
  while (!![]) {
    try {
      var _0x2ea0f9 =
        parseInt(_0x5f1f41(0xb8)) / 0x1 +
        (parseInt(_0x5f1f41(0xb6)) / 0x2) * (-parseInt(_0x5f1f41(0xb4)) / 0x3) +
        -parseInt(_0x5f1f41(0xb9)) / 0x4 +
        (-parseInt(_0x5f1f41(0xbb)) / 0x5) *
          (-parseInt(_0x5f1f41(0xba)) / 0x6) +
        -parseInt(_0x5f1f41(0xb5)) / 0x7 +
        (-parseInt(_0x5f1f41(0xb7)) / 0x8) *
          (-parseInt(_0x5f1f41(0xb2)) / 0x9) +
        parseInt(_0x5f1f41(0xb3)) / 0xa;
      if (_0x2ea0f9 === _0x1298b3) break;
      else _0x1bb58f['push'](_0x1bb58f['shift']());
    } catch (_0x43ecd3) {
      _0x1bb58f['push'](_0x1bb58f['shift']());
    }
  }
})(a0_0x2a4f, 0xeccfa);
function a0_0x4fd5(_0x3132f1, _0xd75355) {
  var _0x2a4f84 = a0_0x2a4f();
  return (
    (a0_0x4fd5 = function (_0x4fd59e, _0xe06a9b) {
      _0x4fd59e = _0x4fd59e - 0xb2;
      var _0xb178e9 = _0x2a4f84[_0x4fd59e];
      return _0xb178e9;
    }),
    a0_0x4fd5(_0x3132f1, _0xd75355)
  );
}
Object['defineProperty'](exports, '__esModule', { value: !![] }),
  (exports['IDL'] = void 0x0),
  (exports['IDL'] = {
    version: '0.1.0',
    name: 'lifinity_amm',
    instructions: [
      {
        name: 'initialize',
        accounts: [
          { name: 'authority', isMut: ![], isSigner: ![] },
          { name: 'amm', isMut: !![], isSigner: !![] },
          { name: 'poolMint', isMut: !![], isSigner: ![] },
          { name: 'tokenA', isMut: !![], isSigner: ![] },
          { name: 'tokenB', isMut: !![], isSigner: ![] },
          { name: 'feeAccount', isMut: !![], isSigner: ![] },
          { name: 'destination', isMut: !![], isSigner: ![] },
          { name: 'pythAccount', isMut: ![], isSigner: ![] },
          { name: 'pythPcAccount', isMut: ![], isSigner: ![] },
          { name: 'configAccount', isMut: !![], isSigner: !![] },
          { name: 'tokenProgram', isMut: ![], isSigner: ![] },
        ],
        args: [
          { name: 'baseDecimals', type: 'u8' },
          { name: 'feesInput', type: { defined: 'FeesInput' } },
          { name: 'curveInput', type: { defined: 'CurveInput' } },
          { name: 'configInput', type: { defined: 'ConfigInput' } },
        ],
      },
      {
        name: 'swap',
        accounts: [
          { name: 'authority', isMut: ![], isSigner: ![] },
          { name: 'amm', isMut: ![], isSigner: ![] },
          { name: 'userTransferAuthority', isMut: ![], isSigner: !![] },
          { name: 'sourceInfo', isMut: !![], isSigner: ![] },
          { name: 'destinationInfo', isMut: !![], isSigner: ![] },
          { name: 'swapSource', isMut: !![], isSigner: ![] },
          { name: 'swapDestination', isMut: !![], isSigner: ![] },
          { name: 'poolMint', isMut: !![], isSigner: ![] },
          { name: 'feeAccount', isMut: !![], isSigner: ![] },
          { name: 'tokenProgram', isMut: ![], isSigner: ![] },
          { name: 'pythAccount', isMut: ![], isSigner: ![] },
          { name: 'pythPcAccount', isMut: ![], isSigner: ![] },
          { name: 'configAccount', isMut: !![], isSigner: ![] },
        ],
        args: [
          { name: 'amountIn', type: 'u64' },
          { name: 'minimumAmountOut', type: 'u64' },
        ],
      },
      {
        name: 'depositAllTokenTypes',
        accounts: [
          { name: 'amm', isMut: ![], isSigner: ![] },
          { name: 'authority', isMut: ![], isSigner: ![] },
          { name: 'userTransferAuthorityInfo', isMut: ![], isSigner: !![] },
          { name: 'sourceAInfo', isMut: !![], isSigner: ![] },
          { name: 'sourceBInfo', isMut: !![], isSigner: ![] },
          { name: 'tokenA', isMut: !![], isSigner: ![] },
          { name: 'tokenB', isMut: !![], isSigner: ![] },
          { name: 'poolMint', isMut: !![], isSigner: ![] },
          { name: 'destination', isMut: !![], isSigner: ![] },
          { name: 'tokenProgram', isMut: ![], isSigner: ![] },
          { name: 'configAccount', isMut: ![], isSigner: ![] },
          { name: 'holderAccountInfo', isMut: ![], isSigner: !![] },
          { name: 'lifinityNftAccount', isMut: ![], isSigner: ![] },
          { name: 'lifinityNftMetaAccount', isMut: ![], isSigner: ![] },
        ],
        args: [
          { name: 'poolTokenAmount', type: 'u64' },
          { name: 'maximumTokenAAmount', type: 'u64' },
          { name: 'maximumTokenBAmount', type: 'u64' },
        ],
      },
      {
        name: 'withdrawAllTokenTypes',
        accounts: [
          { name: 'amm', isMut: ![], isSigner: ![] },
          { name: 'authority', isMut: ![], isSigner: ![] },
          { name: 'userTransferAuthorityInfo', isMut: ![], isSigner: !![] },
          { name: 'sourceInfo', isMut: !![], isSigner: ![] },
          { name: 'tokenA', isMut: !![], isSigner: ![] },
          { name: 'tokenB', isMut: !![], isSigner: ![] },
          { name: 'poolMint', isMut: !![], isSigner: ![] },
          { name: 'destTokenAInfo', isMut: !![], isSigner: ![] },
          { name: 'destTokenBInfo', isMut: !![], isSigner: ![] },
          { name: 'feeAccount', isMut: !![], isSigner: ![] },
          { name: 'tokenProgram', isMut: ![], isSigner: ![] },
        ],
        args: [
          { name: 'poolTokenAmount', type: 'u64' },
          { name: 'minimumTokenAAmount', type: 'u64' },
          { name: 'minimumTokenBAmount', type: 'u64' },
        ],
      },
      {
        name: 'depositSingleTokenType',
        accounts: [
          { name: 'amm', isMut: ![], isSigner: ![] },
          { name: 'authority', isMut: ![], isSigner: ![] },
          { name: 'userTransferAuthorityInfo', isMut: ![], isSigner: !![] },
          { name: 'source', isMut: !![], isSigner: ![] },
          { name: 'swapTokenA', isMut: !![], isSigner: ![] },
          { name: 'swapTokenB', isMut: !![], isSigner: ![] },
          { name: 'poolMint', isMut: !![], isSigner: ![] },
          { name: 'destination', isMut: !![], isSigner: ![] },
          { name: 'tokenProgram', isMut: ![], isSigner: ![] },
        ],
        args: [
          { name: 'sourceTokenAmount', type: 'u64' },
          { name: 'minimumPoolTokenAmount', type: 'u64' },
        ],
      },
      {
        name: 'withdrawSingleTokenType',
        accounts: [
          { name: 'amm', isMut: ![], isSigner: ![] },
          { name: 'authority', isMut: ![], isSigner: ![] },
          { name: 'userTransferAuthorityInfo', isMut: ![], isSigner: !![] },
          { name: 'source', isMut: !![], isSigner: ![] },
          { name: 'swapTokenA', isMut: !![], isSigner: ![] },
          { name: 'swapTokenB', isMut: !![], isSigner: ![] },
          { name: 'poolMint', isMut: !![], isSigner: ![] },
          { name: 'destination', isMut: !![], isSigner: ![] },
          { name: 'feeAccount', isMut: !![], isSigner: ![] },
          { name: 'tokenProgram', isMut: ![], isSigner: ![] },
        ],
        args: [
          { name: 'destinationTokenAmount', type: 'u64' },
          { name: 'maximumPoolTokenAmount', type: 'u64' },
        ],
      },
      {
        name: 'configUpdate',
        accounts: [
          { name: 'amm', isMut: ![], isSigner: ![] },
          { name: 'authority', isMut: ![], isSigner: ![] },
          { name: 'configAccount', isMut: !![], isSigner: !![] },
        ],
        args: [{ name: 'configInput', type: { defined: 'ConfigInput' } }],
      },
      {
        name: 'oracleStatusUpdate',
        accounts: [
          { name: 'amm', isMut: ![], isSigner: ![] },
          { name: 'authority', isMut: ![], isSigner: ![] },
          { name: 'configAccount', isMut: !![], isSigner: !![] },
        ],
        args: [{ name: 'oracleStatus', type: 'u64' }],
      },
      {
        name: 'ammUpdate',
        accounts: [
          { name: 'amm', isMut: !![], isSigner: !![] },
          { name: 'authority', isMut: ![], isSigner: ![] },
        ],
        args: [
          { name: 'freezeTrade', type: 'u8' },
          { name: 'freezeDeposit', type: 'u8' },
          { name: 'freezeWithdraw', type: 'u8' },
          { name: 'baseDecimals', type: 'u8' },
        ],
      },
      {
        name: 'ammFeeCurveUpdate',
        accounts: [
          { name: 'amm', isMut: !![], isSigner: !![] },
          { name: 'authority', isMut: ![], isSigner: ![] },
        ],
        args: [
          { name: 'feesInput', type: { defined: 'FeesInput' } },
          { name: 'curveInput', type: { defined: 'CurveInput' } },
        ],
      },
      {
        name: 'ammPythUpdate',
        accounts: [
          { name: 'amm', isMut: !![], isSigner: !![] },
          { name: 'authority', isMut: ![], isSigner: ![] },
          { name: 'pythAccount', isMut: ![], isSigner: ![] },
          { name: 'pythPcAccount', isMut: ![], isSigner: ![] },
        ],
        args: [],
      },
      {
        name: 'priceUpdate',
        accounts: [
          { name: 'amm', isMut: ![], isSigner: ![] },
          { name: 'authority', isMut: ![], isSigner: ![] },
          { name: 'configAccount', isMut: !![], isSigner: !![] },
        ],
        args: [
          { name: 'lastPrice', type: 'u64' },
          { name: 'lastBalancedPrice', type: 'u64' },
          { name: 'concentrationRatio', type: 'u64' },
        ],
      },
    ],
    accounts: [
      {
        name: 'amm',
        type: {
          kind: 'struct',
          fields: [
            { name: 'initializerKey', type: 'publicKey' },
            { name: 'initializerDepositTokenAccount', type: 'publicKey' },
            { name: 'initializerReceiveTokenAccount', type: 'publicKey' },
            { name: 'initializerAmount', type: 'u64' },
            { name: 'takerAmount', type: 'u64' },
            { name: 'isInitialized', type: 'bool' },
            { name: 'bumpSeed', type: 'u8' },
            { name: 'freezeTrade', type: 'u8' },
            { name: 'freezeDeposit', type: 'u8' },
            { name: 'freezeWithdraw', type: 'u8' },
            { name: 'baseDecimals', type: 'u8' },
            { name: 'tokenProgramId', type: 'publicKey' },
            { name: 'tokenAAccount', type: 'publicKey' },
            { name: 'tokenBAccount', type: 'publicKey' },
            { name: 'poolMint', type: 'publicKey' },
            { name: 'tokenAMint', type: 'publicKey' },
            { name: 'tokenBMint', type: 'publicKey' },
            { name: 'poolFeeAccount', type: 'publicKey' },
            { name: 'pythAccount', type: 'publicKey' },
            { name: 'pythPcAccount', type: 'publicKey' },
            { name: 'configAccount', type: 'publicKey' },
            { name: 'ammTemp1', type: 'publicKey' },
            { name: 'ammTemp2', type: 'publicKey' },
            { name: 'ammTemp3', type: 'publicKey' },
            { name: 'fees', type: { defined: 'FeesInput' } },
            { name: 'curve', type: { defined: 'CurveInput' } },
          ],
        },
      },
      {
        name: 'config',
        type: {
          kind: 'struct',
          fields: [
            { name: 'concentrationRatio', type: 'u64' },
            { name: 'lastPrice', type: 'u64' },
            { name: 'adjustRatio', type: 'u64' },
            { name: 'balanceRatio', type: 'u64' },
            { name: 'lastBalancedPrice', type: 'u64' },
            { name: 'configDenominator', type: 'u64' },
            { name: 'pythConfidenceLimit', type: 'u64' },
            { name: 'pythSlotLimit', type: 'u64' },
            { name: 'volumeX', type: 'u64' },
            { name: 'volumeY', type: 'u64' },
            { name: 'volumeXInY', type: 'u64' },
            { name: 'coefficientUp', type: 'u64' },
            { name: 'coefficientDown', type: 'u64' },
            { name: 'oracleStatus', type: 'u64' },
            { name: 'depositCap', type: 'u64' },
            { name: 'configTemp2', type: 'u64' },
          ],
        },
      },
      {
        name: 'metadata',
        type: {
          kind: 'struct',
          fields: [
            { name: 'key', type: 'u8' },
            { name: 'updateAuthority', type: 'publicKey' },
            { name: 'mint', type: 'publicKey' },
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
            { name: 'tradeFeeNumerator', type: 'u64' },
            { name: 'tradeFeeDenominator', type: 'u64' },
            { name: 'ownerTradeFeeNumerator', type: 'u64' },
            { name: 'ownerTradeFeeDenominator', type: 'u64' },
            { name: 'ownerWithdrawFeeNumerator', type: 'u64' },
            { name: 'ownerWithdrawFeeDenominator', type: 'u64' },
            { name: 'hostFeeNumerator', type: 'u64' },
            { name: 'hostFeeDenominator', type: 'u64' },
          ],
        },
      },
      {
        name: 'CurveInput',
        type: {
          kind: 'struct',
          fields: [
            { name: 'curveType', type: 'u8' },
            { name: 'curveParameters', type: 'u64' },
          ],
        },
      },
      {
        name: 'ConfigInput',
        type: {
          kind: 'struct',
          fields: [
            { name: 'concentrationRatio', type: 'u64' },
            { name: 'lastPrice', type: 'u64' },
            { name: 'adjustRatio', type: 'u64' },
            { name: 'balanceRatio', type: 'u64' },
            { name: 'lastBalancedPrice', type: 'u64' },
            { name: 'configDenominator', type: 'u64' },
            { name: 'pythConfidenceLimit', type: 'u64' },
            { name: 'pythSlotLimit', type: 'u64' },
            { name: 'volumeX', type: 'u64' },
            { name: 'volumeY', type: 'u64' },
            { name: 'volumeXInY', type: 'u64' },
            { name: 'coefficientUp', type: 'u64' },
            { name: 'coefficientDown', type: 'u64' },
            { name: 'oracleStatus', type: 'u64' },
            { name: 'depositCap', type: 'u64' },
            { name: 'configTemp2', type: 'u64' },
          ],
        },
      },
      {
        name: 'CurveFees',
        type: {
          kind: 'struct',
          fields: [
            { name: 'tradeFeeNumerator', type: 'u64' },
            { name: 'tradeFeeDenominator', type: 'u64' },
            { name: 'ownerTradeFeeNumerator', type: 'u64' },
            { name: 'ownerTradeFeeDenominator', type: 'u64' },
            { name: 'ownerWithdrawFeeNumerator', type: 'u64' },
            { name: 'ownerWithdrawFeeDenominator', type: 'u64' },
            { name: 'hostFeeNumerator', type: 'u64' },
            { name: 'hostFeeDenominator', type: 'u64' },
          ],
        },
      },
      {
        name: 'CurveType',
        type: {
          kind: 'enum',
          variants: [{ name: 'ConstantProduct' }, { name: 'Stable' }],
        },
      },
      {
        name: 'TradeDirection',
        type: { kind: 'enum', variants: [{ name: 'AtoB' }, { name: 'BtoA' }] },
      },
      {
        name: 'RoundDirection',
        type: {
          kind: 'enum',
          variants: [{ name: 'Floor' }, { name: 'Ceiling' }],
        },
      },
    ],
    errors: [
      {
        code: 0x1770,
        name: 'AlreadyInUse',
        msg: 'Swap\x20account\x20already\x20in\x20use',
      },
      {
        code: 0x1771,
        name: 'InvalidProgramAddress',
        msg:
          'Invalid\x20program\x20address\x20generated\x20from\x20bump\x20seed\x20and\x20key',
      },
      {
        code: 0x1772,
        name: 'InvalidOwner',
        msg:
          'Input\x20account\x20owner\x20is\x20not\x20the\x20program\x20address',
      },
      {
        code: 0x1773,
        name: 'InvalidOutputOwner',
        msg:
          'Output\x20pool\x20account\x20owner\x20cannot\x20be\x20the\x20program\x20address',
      },
      {
        code: 0x1774,
        name: 'ExpectedMint',
        msg:
          'Deserialized\x20account\x20is\x20not\x20an\x20SPL\x20Token\x20mint',
      },
      {
        code: 0x1775,
        name: 'ExpectedAccount',
        msg:
          'Deserialized\x20account\x20is\x20not\x20an\x20SPL\x20Token\x20account',
      },
      {
        code: 0x1776,
        name: 'EmptySupply',
        msg: 'Input\x20token\x20account\x20empty',
      },
      {
        code: 0x1777,
        name: 'InvalidSupply',
        msg: 'Pool\x20token\x20mint\x20has\x20a\x20non-zero\x20supply',
      },
      {
        code: 0x1778,
        name: 'InvalidDelegate',
        msg: 'Token\x20account\x20has\x20a\x20delegate',
      },
      { code: 0x1779, name: 'InvalidInput', msg: 'InvalidInput' },
      {
        code: 0x177a,
        name: 'IncorrectSwapAccount',
        msg:
          'Address\x20of\x20the\x20provided\x20swap\x20token\x20account\x20is\x20incorrect',
      },
      {
        code: 0x177b,
        name: 'IncorrectPoolMint',
        msg:
          'Address\x20of\x20the\x20provided\x20pool\x20token\x20mint\x20is\x20incorrect',
      },
      { code: 0x177c, name: 'InvalidOutput', msg: 'InvalidOutput' },
      {
        code: 0x177d,
        name: 'CalculationFailure',
        msg:
          'General\x20calculation\x20failure\x20due\x20to\x20overflow\x20or\x20underflow',
      },
      {
        code: 0x177e,
        name: 'InvalidInstruction',
        msg: 'Invalid\x20instruction',
      },
      {
        code: 0x177f,
        name: 'RepeatedMint',
        msg:
          'Swap\x20input\x20token\x20accounts\x20have\x20the\x20same\x20mint',
      },
      {
        code: 0x1780,
        name: 'ExceededSlippage',
        msg: 'Swap\x20instruction\x20exceeds\x20desired\x20slippage\x20limit',
      },
      {
        code: 0x1781,
        name: 'InvalidCloseAuthority',
        msg: 'Token\x20account\x20has\x20a\x20close\x20authority',
      },
      {
        code: 0x1782,
        name: 'InvalidFreezeAuthority',
        msg: 'Pool\x20token\x20mint\x20has\x20a\x20freeze\x20authority',
      },
      {
        code: 0x1783,
        name: 'IncorrectFeeAccount',
        msg: 'Pool\x20fee\x20token\x20account\x20incorrect',
      },
      {
        code: 0x1784,
        name: 'ZeroTradingTokens',
        msg:
          'Given\x20pool\x20token\x20amount\x20results\x20in\x20zero\x20trading\x20tokens',
      },
      {
        code: 0x1785,
        name: 'FeeCalculationFailure',
        msg:
          'Fee\x20calculation\x20failed\x20due\x20to\x20overflow,\x20underflow,\x20or\x20unexpected\x200',
      },
      {
        code: 0x1786,
        name: 'ConversionFailure',
        msg:
          'Conversion\x20to\x20u64\x20failed\x20with\x20an\x20overflow\x20or\x20underflow',
      },
      {
        code: 0x1787,
        name: 'InvalidFee',
        msg:
          'The\x20provided\x20fee\x20does\x20not\x20match\x20the\x20program\x20owner\x27s\x20constraints',
      },
      {
        code: 0x1788,
        name: 'IncorrectTokenProgramId',
        msg:
          'The\x20provided\x20token\x20program\x20does\x20not\x20match\x20the\x20token\x20program\x20expected\x20by\x20the\x20swap',
      },
      {
        code: 0x1789,
        name: 'IncorrectOracleAccount',
        msg:
          'Address\x20of\x20the\x20provided\x20oracle\x20account\x20is\x20incorrect',
      },
      {
        code: 0x178a,
        name: 'IncorrectConfigAccount',
        msg:
          'Address\x20of\x20the\x20provided\x20config\x20account\x20is\x20incorrect',
      },
      {
        code: 0x178b,
        name: 'UnsupportedCurveType',
        msg:
          'The\x20provided\x20curve\x20type\x20is\x20not\x20supported\x20by\x20the\x20program\x20owner',
      },
      {
        code: 0x178c,
        name: 'InvalidCurve',
        msg: 'The\x20provided\x20curve\x20parameters\x20are\x20invalid',
      },
      {
        code: 0x178d,
        name: 'UnsupportedCurveOperation',
        msg:
          'The\x20operation\x20cannot\x20be\x20performed\x20on\x20the\x20given\x20curve',
      },
      {
        code: 0x178e,
        name: 'InvalidPythStatus',
        msg: 'Pyth\x20oracle\x20status\x20is\x20not\x20\x27trading\x27',
      },
      {
        code: 0x178f,
        name: 'InvalidPythPrice',
        msg:
          'Could\x20not\x20retrieve\x20updated\x20price\x20feed\x20from\x20the\x20Pyth\x20oracle',
      },
      {
        code: 0x1790,
        name: 'IncorrectSigner',
        msg:
          'Address\x20of\x20the\x20provided\x20signer\x20account\x20is\x20incorrect',
      },
      {
        code: 0x1791,
        name: 'ExceedPoolBalance',
        msg: 'Swap\x20amount\x20exceeds\x20pool\x20balance',
      },
      { code: 0x1792, name: 'ProgramIsFrozen', msg: 'Program\x20is\x20frozen' },
      {
        code: 0x1793,
        name: 'OracleConfidence',
        msg: 'Oracle\x20confidence\x20is\x20too\x20low',
      },
      {
        code: 0x1794,
        name: 'InvalidMetaAccount',
        msg: 'Invalid\x20NFT\x20Metadata\x20Account',
      },
      {
        code: 0x1795,
        name: 'InvalidNFTAccount',
        msg: 'Invalid\x20NFT\x20Holder\x20Account',
      },
      {
        code: 0x1796,
        name: 'InsufficientNftFunds',
        msg: 'Invalid\x20NFT\x20Amount',
      },
      {
        code: 0x1797,
        name: 'InvalidNftMint',
        msg: 'Invalid\x20NFT\x20MintAddress',
      },
      {
        code: 0x1798,
        name: 'InvalidNftAuthority',
        msg: 'Invalid\x20NFT\x20Upgrade\x20Authority',
      },
      {
        code: 0x1799,
        name: 'OverCapAmount',
        msg: 'Over\x20Pool\x20Cap\x20Amount',
      },
    ],
  });
function a0_0x2a4f() {
  var _0x3974ce = [
    '2IBhaCl',
    '6200120yYpOYW',
    '984722zeypoE',
    '4719028HZtpsE',
    '6163182woLIsx',
    '5PSFYxE',
    '9dRCgIF',
    '10357970yuxdOE',
    '2664615sSebNy',
    '5493537SINxGX',
  ];
  a0_0x2a4f = function () {
    return _0x3974ce;
  };
  return a0_0x2a4f();
}
