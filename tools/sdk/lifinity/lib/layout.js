'use strict';
(function (_0x10c911, _0x23ef09) {
  const _0x1a5624 = a0_0x3a2a,
    _0x1a399a = _0x10c911();
  while (!![]) {
    try {
      const _0x20ecc9 =
        (-parseInt(_0x1a5624(0x126)) / 0x1) *
          (-parseInt(_0x1a5624(0x128)) / 0x2) +
        (parseInt(_0x1a5624(0x127)) / 0x3) *
          (parseInt(_0x1a5624(0x12b)) / 0x4) +
        parseInt(_0x1a5624(0x12c)) / 0x5 +
        (-parseInt(_0x1a5624(0x125)) / 0x6) *
          (-parseInt(_0x1a5624(0x12d)) / 0x7) +
        (parseInt(_0x1a5624(0x124)) / 0x8) *
          (-parseInt(_0x1a5624(0x122)) / 0x9) +
        (-parseInt(_0x1a5624(0x12e)) / 0xa) *
          (parseInt(_0x1a5624(0x12a)) / 0xb) +
        (-parseInt(_0x1a5624(0x123)) / 0xc) *
          (parseInt(_0x1a5624(0x129)) / 0xd);
      if (_0x20ecc9 === _0x23ef09) break;
      else _0x1a399a['push'](_0x1a399a['shift']());
    } catch (_0x28e848) {
      _0x1a399a['push'](_0x1a399a['shift']());
    }
  }
})(a0_0x1ee7, 0xd3f89);
function a0_0x1ee7() {
  const _0x5b3966 = [
    '156GiDHwT',
    '6986150wdtKgU',
    '311759tkXlCB',
    '2144030KvGDTz',
    '7233633etqmKA',
    '12eOeNbn',
    '16oyqZdk',
    '120IlMtPC',
    '1549759znaXMQ',
    '115497JjRnHE',
    '2wrJZNo',
    '14927367gZPMmQ',
    '88ZxZHMo',
  ];
  a0_0x1ee7 = function () {
    return _0x5b3966;
  };
  return a0_0x1ee7();
}
Object['defineProperty'](exports, '__esModule', { value: !![] }),
  (exports['CONFIG_LAYOUT'] = exports['LIFINITY_AMM_LAYOUT'] = void 0x0);
function a0_0x3a2a(_0x47ab93, _0x3a04fc) {
  const _0x1ee7c3 = a0_0x1ee7();
  return (
    (a0_0x3a2a = function (_0x3a2a14, _0x58065c) {
      _0x3a2a14 = _0x3a2a14 - 0x122;
      let _0x285f9f = _0x1ee7c3[_0x3a2a14];
      return _0x285f9f;
    }),
    a0_0x3a2a(_0x47ab93, _0x3a04fc)
  );
}
const borsh_1 = require('@project-serum/borsh'),
  buffer_layout_1 = require('buffer-layout');
(exports['LIFINITY_AMM_LAYOUT'] = (0x0, buffer_layout_1['struct'])([
  (0x0, borsh_1['u64'])('index'),
  (0x0, borsh_1['publicKey'])('initializerKey'),
  (0x0, borsh_1['publicKey'])('initializerDepositTokenAccount'),
  (0x0, borsh_1['publicKey'])('initializerReceiveTokenAccount'),
  (0x0, borsh_1['u64'])('initializerAmount'),
  (0x0, borsh_1['u64'])('takerAmount'),
  (0x0, borsh_1['u8'])('initialized'),
  (0x0, borsh_1['u8'])('bumpSeed'),
  (0x0, borsh_1['u8'])('freezeTrade'),
  (0x0, borsh_1['u8'])('freezeDeposit'),
  (0x0, borsh_1['u8'])('freezeWithdraw'),
  (0x0, borsh_1['u8'])('baseDecimals'),
  (0x0, borsh_1['publicKey'])('tokenProgramId'),
  (0x0, borsh_1['publicKey'])('tokenAAccount'),
  (0x0, borsh_1['publicKey'])('tokenBAccount'),
  (0x0, borsh_1['publicKey'])('poolMint'),
  (0x0, borsh_1['publicKey'])('tokenAMint'),
  (0x0, borsh_1['publicKey'])('tokenBMint'),
  (0x0, borsh_1['publicKey'])('poolFeeAccount'),
  (0x0, borsh_1['publicKey'])('pythAccount'),
  (0x0, borsh_1['publicKey'])('pythPcAccount'),
  (0x0, borsh_1['publicKey'])('configAccount'),
  (0x0, borsh_1['publicKey'])('ammTemp1'),
  (0x0, borsh_1['publicKey'])('ammTemp2'),
  (0x0, borsh_1['publicKey'])('ammTemp3'),
  (0x0, borsh_1['u64'])('tradeFeeNumerator'),
  (0x0, borsh_1['u64'])('tradeFeeDenominator'),
  (0x0, borsh_1['u64'])('ownerTradeFeeNumerator'),
  (0x0, borsh_1['u64'])('ownerTradeFeeDenominator'),
  (0x0, borsh_1['u64'])('ownerWithdrawFeeNumerator'),
  (0x0, borsh_1['u64'])('ownerWithdrawFeeDenominator'),
  (0x0, borsh_1['u64'])('hostFeeNumerator'),
  (0x0, borsh_1['u64'])('hostFeeDenominator'),
  (0x0, borsh_1['u8'])('curveType'),
  (0x0, borsh_1['u64'])('curveParameters'),
])),
  (exports['CONFIG_LAYOUT'] = (0x0, buffer_layout_1['struct'])([
    (0x0, borsh_1['u64'])('index'),
    (0x0, borsh_1['u64'])('concentrationRatio'),
    (0x0, borsh_1['u64'])('lastPrice'),
    (0x0, borsh_1['u64'])('adjustRatio'),
    (0x0, borsh_1['u64'])('balanceRatio'),
    (0x0, borsh_1['u64'])('lastBalancedPrice'),
    (0x0, borsh_1['u64'])('configDenominator'),
    (0x0, borsh_1['u64'])('pythConfidenceLimit'),
    (0x0, borsh_1['u64'])('pythSlotLimit'),
    (0x0, borsh_1['u64'])('volumeX'),
    (0x0, borsh_1['u64'])('volumeY'),
    (0x0, borsh_1['u64'])('volumeXinY'),
    (0x0, borsh_1['u64'])('coefficientUp'),
    (0x0, borsh_1['u64'])('coefficientDown'),
    (0x0, borsh_1['u64'])('oracleStatus'),
    (0x0, borsh_1['u64'])('configTemp1'),
    (0x0, borsh_1['u64'])('configTemp2'),
  ]));
