'use strict';
(function (_0x53e1c6, _0x2c6563) {
  const _0x5d9668 = a0_0x8a1b,
    _0x18e397 = _0x53e1c6();
  while (!![]) {
    try {
      const _0x2eac89 =
        (parseInt(_0x5d9668(0x97)) / 0x1) * (-parseInt(_0x5d9668(0x9d)) / 0x2) +
        -parseInt(_0x5d9668(0x9e)) / 0x3 +
        (parseInt(_0x5d9668(0xa1)) / 0x4) * (-parseInt(_0x5d9668(0x98)) / 0x5) +
        (parseInt(_0x5d9668(0xa0)) / 0x6) * (parseInt(_0x5d9668(0x9f)) / 0x7) +
        (parseInt(_0x5d9668(0x9b)) / 0x8) * (-parseInt(_0x5d9668(0x99)) / 0x9) +
        -parseInt(_0x5d9668(0x9a)) / 0xa +
        parseInt(_0x5d9668(0x9c)) / 0xb;
      if (_0x2eac89 === _0x2c6563) break;
      else _0x18e397['push'](_0x18e397['shift']());
    } catch (_0x327ca1) {
      _0x18e397['push'](_0x18e397['shift']());
    }
  }
})(a0_0x3fa6, 0x56663);
var __importDefault =
  (this && this['__importDefault']) ||
  function (_0x2cdf65) {
    return _0x2cdf65 && _0x2cdf65['__esModule']
      ? _0x2cdf65
      : { default: _0x2cdf65 };
  };
Object['defineProperty'](exports, '__esModule', { value: !![] }),
  (exports['getCurveAmount'] = exports['TradeDirection'] = void 0x0);
const decimal_js_1 = __importDefault(require('decimal.js'));
function a0_0x3fa6() {
  const _0x26205f = [
    '222820yZHfTd',
    '8YiHaGX',
    '12420826LUuWvL',
    '116xPIjog',
    '750705DOLhEg',
    '245140IcPFdU',
    '30XRxxGx',
    '405668rjvXxb',
    '8117VRrFab',
    '10qfrBbM',
    '38142QhGlzO',
  ];
  a0_0x3fa6 = function () {
    return _0x26205f;
  };
  return a0_0x3fa6();
}
exports['TradeDirection'] = { AtoB: 'AtoB', BtoA: 'BtoA' };
function getCurveAmount(
  _0x7bf070,
  _0xac1647,
  _0xc2794e,
  _0x38495d,
  _0x1e2bc1,
  _0x309b31,
  _0x3dd7d1,
  _0x182fe5,
  _0x1ca449,
  _0x11f33f,
) {
  let _0x96f3fd = new decimal_js_1['default'](0x0),
    _0x2627eb = new decimal_js_1['default'](0x0);
  const _0x629aca = _0x7bf070['times'](_0x38495d['tradeFeeNumerator'])['div'](
      _0x38495d['tradeFeeDenominator'],
    ),
    _0x1533be = _0x7bf070['times'](_0x38495d['ownerTradeFeeNumerator'])['div'](
      _0x38495d['ownerTradeFeeDenominator'],
    ),
    _0x30c8e6 = _0x629aca['plus'](_0x1533be),
    _0x4362da = _0x38495d['tradeFeeNumerator']
      ['div'](_0x38495d['tradeFeeDenominator'])
      ['plus'](
        _0x38495d['ownerTradeFeeNumerator']['div'](
          _0x38495d['ownerTradeFeeDenominator'],
        ),
      ),
    _0x3c662e = _0x7bf070['minus'](_0x30c8e6),
    _0x3238cc = new decimal_js_1['default'](0xa),
    _0x39fc2c = _0x3238cc['pow'](_0xc2794e['baseDecimals']);
  if (_0xc2794e['freezeTrade'] === 0x1) throw new Error('ProgramIsFrozen');
  if (!_0x182fe5['status']['eq'](0x1)) throw new Error('InvalidPythStatus');
  if (
    _0xac1647 - _0x182fe5['publishSlot']['toNumber']() >
    _0x3dd7d1['pythSlotLimit']['toNumber']()
  )
    throw new Error('InvalidPythSlot');
  let _0x1365a0 = _0x182fe5['confidence']['div'](_0x182fe5['price']);
  if (
    _0x1365a0['gt'](
      _0x3dd7d1['pythConfidenceLimit']['div'](_0x3dd7d1['configDenominator']),
    )
  )
    throw new Error('InvalidPythConfidence');
  let _0x2c0aee = _0x182fe5['price'];
  if (_0x1ca449) {
    if (!_0x1ca449['status']['eq'](0x1)) throw new Error('InvalidPythPcStatus');
    if (
      _0xac1647 - _0x1ca449['publishSlot']['toNumber']() >
      _0x3dd7d1['pythSlotLimit']['toNumber']()
    )
      throw new Error('InvalidPythPcSlot');
    let _0xac14e6 = _0x1ca449['confidence']['div'](_0x1ca449['price']);
    if (
      _0xac14e6['gt'](
        _0x3dd7d1['pythConfidenceLimit']['div'](_0x3dd7d1['configDenominator']),
      )
    )
      throw new Error('InvalidPythPcConfidence');
    _0x2c0aee = _0x2c0aee['times'](
      _0x3238cc['pow'](Math['abs'](_0x1ca449['exponent'])),
    )['div'](_0x1ca449['price']);
  }
  let _0x4f3962 = new decimal_js_1['default'](0x0);
  getAbs(_0x2c0aee['div'](_0x3dd7d1['lastPrice'])['minus'](0x1))['gt'](
    _0x3dd7d1['adjustRatio']['div'](_0x3dd7d1['configDenominator']),
  )
    ? (_0x4f3962 = _0x2c0aee)
    : (_0x4f3962 = _0x3dd7d1['lastPrice']);
  if (
    _0x3dd7d1['oracleStatus']['eq'](0x1) &&
    _0x11f33f === exports['TradeDirection']['AtoB']
  )
    throw new Error('OracleConfidence');
  else {
    if (
      _0x3dd7d1['oracleStatus']['eq'](0x2) &&
      _0x11f33f === exports['TradeDirection']['BtoA']
    )
      throw new Error('OracleConfidence');
  }
  const _0x47a78c = _0x3dd7d1['lastBalancedPrice'],
    _0x124ebd = _0x3dd7d1['coefficientUp'],
    _0x489603 = _0x3dd7d1['coefficientDown'];
  if (_0xc2794e['curveType'] === 0x0) {
    const {
      destinationAmountSwapped: _0x2e6c0a,
      poolPriceImpact: _0x12b8f9,
    } = constantCurve(
      _0x3c662e,
      _0x4f3962,
      _0x47a78c,
      _0x39fc2c,
      _0x124ebd,
      _0x489603,
      _0x1e2bc1,
      _0x309b31,
      _0x3dd7d1,
      _0x11f33f,
    );
    (_0x96f3fd = _0x2e6c0a), (_0x2627eb = _0x12b8f9);
  } else {
    if (_0xc2794e['curveType'] === 0x1) {
      const {
        destinationAmountSwapped: _0x2cb7d7,
        poolPriceImpact: _0x2887ac,
      } = stableCurve(
        _0x3c662e,
        _0x4f3962,
        _0x47a78c,
        _0x39fc2c,
        _0x124ebd,
        _0x489603,
        _0x1e2bc1,
        _0x309b31,
        _0x3dd7d1,
        _0x11f33f,
      );
      (_0x96f3fd = _0x2cb7d7), (_0x2627eb = _0x2887ac);
    }
  }
  if (
    _0x11f33f === exports['TradeDirection']['AtoB'] &&
    _0x96f3fd['gte'](_0x309b31)
  )
    throw new Error('ExceedPoolBalance');
  else {
    if (
      _0x11f33f === exports['TradeDirection']['BtoA'] &&
      _0x96f3fd['gte'](_0x1e2bc1)
    )
      throw new Error('ExceedPoolBalance');
  }
  return {
    amountSwapped: _0x96f3fd,
    priceImpact: _0x2627eb,
    fee: _0x30c8e6,
    feePercent: _0x4362da,
  };
}
exports['getCurveAmount'] = getCurveAmount;
function constantCurve(
  _0x119117,
  _0x1befd3,
  _0x21d262,
  _0x2c0623,
  _0x38fb10,
  _0x13b400,
  _0x353083,
  _0x6c2442,
  _0x32813a,
  _0x45a569,
) {
  let _0x56b0ce = new decimal_js_1['default'](0x0),
    _0x13e8ed = new decimal_js_1['default'](0x0),
    _0x52f1ce = _0x353083['times'](_0x32813a['concentrationRatio']),
    _0x5b51c6 = _0x6c2442['times'](_0x32813a['concentrationRatio']),
    _0x10ea01 = _0x52f1ce['times'](_0x1befd3)['div'](_0x2c0623);
  switch (_0x45a569) {
    case exports['TradeDirection']['AtoB']: {
      if (_0x1befd3['gt'](_0x21d262) && _0x10ea01['gt'](_0x5b51c6)) {
        let _0x11d42f = _0x5b51c6['div'](_0x10ea01),
          _0x53411d = _0x11d42f['pow'](_0x13b400);
        (_0x52f1ce = _0x52f1ce['times'](_0x53411d)),
          (_0x5b51c6 = _0x5b51c6['times'](_0x53411d));
      } else {
        if (_0x21d262['gt'](_0x1befd3) && _0x5b51c6['gt'](_0x10ea01)) {
          let _0x4b8e10 = _0x5b51c6['div'](_0x10ea01),
            _0x21e75c = _0x4b8e10['pow'](_0x38fb10);
          (_0x52f1ce = _0x52f1ce['times'](_0x21e75c)),
            (_0x5b51c6 = _0x5b51c6['times'](_0x21e75c));
        } else {
          if (_0x10ea01['gt'](_0x5b51c6)) {
            let _0x39ecf8 = _0x5b51c6['div'](_0x10ea01),
              _0x35372d = _0x39ecf8['pow'](_0x13b400);
            (_0x52f1ce = _0x52f1ce['times'](_0x35372d)),
              (_0x5b51c6 = _0x5b51c6['times'](_0x35372d));
          } else;
        }
      }
      let _0x580474 = new decimal_js_1['default'](
          Math['sqrt'](_0x52f1ce['toNumber']()),
        ),
        _0xe27a89 = new decimal_js_1['default'](
          Math['sqrt'](_0x5b51c6['toNumber']()),
        ),
        _0x4a0a0 = new decimal_js_1['default'](
          Math['sqrt'](_0x1befd3['toNumber']()),
        )['div'](
          new decimal_js_1['default'](Math['sqrt'](_0x2c0623['toNumber']())),
        ),
        _0x342e68 = _0x580474['times'](_0xe27a89);
      (_0x52f1ce = _0x342e68['div'](_0x4a0a0)),
        (_0x5b51c6 = _0x342e68['times'](_0x4a0a0));
      let _0x5bde59 = _0x52f1ce['times'](_0x5b51c6),
        _0x289495 = _0x52f1ce['plus'](_0x119117),
        { q: _0x4cd2ee, r: _0x2c9b1c } = checkedCeilDiv(_0x5bde59, _0x289495),
        _0x3d349c = _0x4cd2ee;
      (_0x289495 = _0x2c9b1c), (_0x56b0ce = _0x5b51c6['minus'](_0x3d349c));
      const _0x4cadda = _0x5b51c6['div'](_0x52f1ce),
        _0x4a091f = _0x5b51c6['minus'](_0x56b0ce)['div'](
          _0x52f1ce['plus'](_0x119117),
        );
      _0x13e8ed = _0x4cadda['minus'](_0x4a091f)['div'](_0x4a091f);
      break;
    }
    case exports['TradeDirection']['BtoA']: {
      if (_0x1befd3['gt'](_0x21d262) && _0x10ea01['gt'](_0x5b51c6)) {
        let _0x4534c1 = _0x10ea01['div'](_0x5b51c6),
          _0x50cdb0 = _0x4534c1['pow'](_0x38fb10);
        (_0x52f1ce = _0x52f1ce['times'](_0x50cdb0)),
          (_0x5b51c6 = _0x5b51c6['times'](_0x50cdb0));
      } else {
        if (_0x21d262['gt'](_0x1befd3) && _0x5b51c6['gt'](_0x10ea01)) {
          let _0x1ee72a = _0x10ea01['div'](_0x5b51c6),
            _0x23fc19 = _0x1ee72a['pow'](_0x13b400);
          (_0x52f1ce = _0x52f1ce['times'](_0x23fc19)),
            (_0x5b51c6 = _0x5b51c6['times'](_0x23fc19));
        } else {
          if (_0x10ea01['gt'](_0x5b51c6));
          else {
            let _0x2c9269 = _0x10ea01['div'](_0x5b51c6),
              _0x362b54 = _0x2c9269['pow'](_0x13b400);
            (_0x52f1ce = _0x52f1ce['times'](_0x362b54)),
              (_0x5b51c6 = _0x5b51c6['times'](_0x362b54));
          }
        }
      }
      let _0x342172 = new decimal_js_1['default'](
          Math['sqrt'](_0x52f1ce['toNumber']()),
        ),
        _0x4a8e9f = new decimal_js_1['default'](
          Math['sqrt'](_0x5b51c6['toNumber']()),
        ),
        _0x4e9f7c = new decimal_js_1['default'](
          Math['sqrt'](_0x1befd3['toNumber']()),
        )['div'](
          new decimal_js_1['default'](Math['sqrt'](_0x2c0623['toNumber']())),
        ),
        _0x2e1b7f = _0x342172['times'](_0x4a8e9f);
      (_0x52f1ce = _0x2e1b7f['div'](_0x4e9f7c)),
        (_0x5b51c6 = _0x2e1b7f['times'](_0x4e9f7c));
      let _0x19b8af = _0x52f1ce['times'](_0x5b51c6),
        _0x30da29 = _0x5b51c6['plus'](_0x119117),
        { q: _0x289176, r: _0x318207 } = checkedCeilDiv(_0x19b8af, _0x30da29),
        _0x2f0bb1 = _0x289176;
      (_0x30da29 = _0x318207), (_0x56b0ce = _0x52f1ce['minus'](_0x2f0bb1));
      const _0x4b90f3 = _0x5b51c6['div'](_0x52f1ce),
        _0x56e808 = _0x5b51c6['plus'](_0x119117)['div'](
          _0x52f1ce['minus'](_0x56b0ce),
        );
      _0x13e8ed = _0x56e808['minus'](_0x4b90f3)['div'](_0x4b90f3);
      break;
    }
  }
  return (
    (_0x56b0ce = new decimal_js_1['default'](
      Math['floor'](_0x56b0ce['toNumber']()),
    )),
    { destinationAmountSwapped: _0x56b0ce, poolPriceImpact: _0x13e8ed }
  );
}
function stableCurve(
  _0x1fb8da,
  _0x31b532,
  _0x513194,
  _0x2f7228,
  _0x3e1308,
  _0x3b2a3f,
  _0x382e62,
  _0x207e83,
  _0x4fa2e0,
  _0x1e4039,
) {
  let _0x183334 = new decimal_js_1['default'](0x0),
    _0x2d27fa = new decimal_js_1['default'](0x0),
    _0x3b8bc7 = _0x382e62,
    _0x1845ea = _0x207e83,
    _0x57d427 = _0x3b8bc7['times'](_0x31b532)['div'](_0x2f7228);
  switch (_0x1e4039) {
    case exports['TradeDirection']['AtoB']: {
      if (_0x31b532['gt'](_0x513194) && _0x57d427['gt'](_0x1845ea)) {
        let _0x126b4a = _0x1845ea['div'](_0x57d427),
          _0xc44cf4 = _0x126b4a['pow'](_0x3b2a3f);
        (_0x3b8bc7 = _0x3b8bc7['times'](_0xc44cf4)),
          (_0x1845ea = _0x1845ea['times'](_0xc44cf4));
      } else {
        if (_0x513194['gt'](_0x31b532) && _0x1845ea['gt'](_0x57d427)) {
          let _0x28cf8f = _0x1845ea['div'](_0x57d427),
            _0x4d8db3 = _0x28cf8f['pow'](_0x3e1308);
          (_0x3b8bc7 = _0x3b8bc7['times'](_0x4d8db3)),
            (_0x1845ea = _0x1845ea['times'](_0x4d8db3));
        } else {
          if (_0x57d427['gt'](_0x1845ea)) {
            let _0x6ef0e = _0x1845ea['div'](_0x57d427),
              _0x51a54e = _0x6ef0e['pow'](_0x3b2a3f);
            (_0x3b8bc7 = _0x3b8bc7['times'](_0x51a54e)),
              (_0x1845ea = _0x1845ea['times'](_0x51a54e));
          } else;
        }
      }
      (_0x3b8bc7 = _0x3b8bc7['times'](_0x4fa2e0['concentrationRatio'])),
        (_0x1845ea = _0x1845ea['times'](_0x4fa2e0['concentrationRatio']));
      let _0x2d04fd = new decimal_js_1['default'](
          Math['sqrt'](_0x3b8bc7['toNumber']()),
        ),
        _0x58a3c3 = new decimal_js_1['default'](
          Math['sqrt'](_0x1845ea['toNumber']()),
        ),
        _0x2fda7b = new decimal_js_1['default'](
          Math['sqrt'](_0x31b532['toNumber']()),
        )['div'](
          new decimal_js_1['default'](Math['sqrt'](_0x2f7228['toNumber']())),
        ),
        _0x409322 = _0x2d04fd['times'](_0x58a3c3);
      (_0x3b8bc7 = _0x409322['div'](_0x2fda7b)),
        (_0x1845ea = _0x409322['times'](_0x2fda7b));
      let _0x63a4b4 = _0x3b8bc7['times'](_0x1845ea),
        _0x55723a = _0x3b8bc7['plus'](_0x1fb8da),
        { q: _0xca52d5, r: _0x503691 } = checkedCeilDiv(_0x63a4b4, _0x55723a),
        _0x178068 = _0xca52d5;
      (_0x55723a = _0x503691), (_0x183334 = _0x1845ea['minus'](_0x178068));
      const _0x260937 = _0x1845ea['div'](_0x3b8bc7),
        _0x1b714b = _0x1845ea['minus'](_0x183334)['div'](
          _0x3b8bc7['plus'](_0x1fb8da),
        );
      _0x2d27fa = _0x260937['minus'](_0x1b714b)['div'](_0x1b714b);
      break;
    }
    case exports['TradeDirection']['BtoA']: {
      if (_0x31b532['gt'](_0x513194) && _0x57d427['gt'](_0x1845ea)) {
        let _0x1aae06 = _0x57d427['div'](_0x1845ea),
          _0x1bde49 = _0x1aae06['pow'](_0x3e1308);
        (_0x3b8bc7 = _0x3b8bc7['times'](_0x1bde49)),
          (_0x1845ea = _0x1845ea['times'](_0x1bde49));
      } else {
        if (_0x513194['gt'](_0x31b532) && _0x1845ea['gt'](_0x57d427)) {
          let _0x114005 = _0x57d427['div'](_0x1845ea),
            _0x4f4ebf = _0x114005['pow'](_0x3b2a3f);
          (_0x3b8bc7 = _0x3b8bc7['times'](_0x4f4ebf)),
            (_0x1845ea = _0x1845ea['times'](_0x4f4ebf));
        } else {
          if (_0x57d427['gt'](_0x1845ea));
          else {
            let _0x461f1a = _0x57d427['div'](_0x1845ea),
              _0x186ba3 = _0x461f1a['pow'](_0x3b2a3f);
            (_0x3b8bc7 = _0x3b8bc7['times'](_0x186ba3)),
              (_0x1845ea = _0x1845ea['times'](_0x186ba3));
          }
        }
      }
      (_0x3b8bc7 = _0x3b8bc7['times'](_0x4fa2e0['concentrationRatio'])),
        (_0x1845ea = _0x1845ea['times'](_0x4fa2e0['concentrationRatio']));
      let _0x28eb51 = new decimal_js_1['default'](
          Math['sqrt'](_0x3b8bc7['toNumber']()),
        ),
        _0xb7e3ec = new decimal_js_1['default'](
          Math['sqrt'](_0x1845ea['toNumber']()),
        ),
        _0x44551b = new decimal_js_1['default'](
          Math['sqrt'](_0x31b532['toNumber']()),
        )['div'](
          new decimal_js_1['default'](Math['sqrt'](_0x2f7228['toNumber']())),
        ),
        _0x1f6ce0 = _0x28eb51['times'](_0xb7e3ec);
      (_0x3b8bc7 = _0x1f6ce0['div'](_0x44551b)),
        (_0x1845ea = _0x1f6ce0['times'](_0x44551b));
      let _0x104fa0 = _0x3b8bc7['times'](_0x1845ea),
        _0x1727ed = _0x1845ea['plus'](_0x1fb8da),
        { q: _0x3a54ef, r: _0x24e879 } = checkedCeilDiv(_0x104fa0, _0x1727ed),
        _0x5af263 = _0x3a54ef;
      (_0x1727ed = _0x24e879), (_0x183334 = _0x3b8bc7['minus'](_0x5af263));
      const _0xaf2d7b = _0x1845ea['div'](_0x3b8bc7),
        _0x18c0a3 = _0x1845ea['plus'](_0x1fb8da)['div'](
          _0x3b8bc7['minus'](_0x183334),
        );
      _0x2d27fa = _0x18c0a3['minus'](_0xaf2d7b)['div'](_0xaf2d7b);
      break;
    }
  }
  return (
    (_0x183334 = new decimal_js_1['default'](
      Math['floor'](_0x183334['toNumber']()),
    )),
    { destinationAmountSwapped: _0x183334, poolPriceImpact: _0x2d27fa }
  );
}
function a0_0x8a1b(_0x3f5df9, _0x35e4c7) {
  const _0x3fa65a = a0_0x3fa6();
  return (
    (a0_0x8a1b = function (_0x8a1bae, _0xbdddd1) {
      _0x8a1bae = _0x8a1bae - 0x97;
      let _0x4f618b = _0x3fa65a[_0x8a1bae];
      return _0x4f618b;
    }),
    a0_0x8a1b(_0x3f5df9, _0x35e4c7)
  );
}
function getAbs(_0x7e23f) {
  return _0x7e23f['toNumber']() < 0x0 ? _0x7e23f['times'](-0x1) : _0x7e23f;
}
function checkedCeilDiv(_0x3d4746, _0x51b2a3) {
  let _0x2dd93c = _0x51b2a3,
    _0x523394 = _0x3d4746['div'](_0x2dd93c);
  if (_0x523394['eq'](0x0))
    return {
      q: new decimal_js_1['default'](0x0),
      r: new decimal_js_1['default'](0x0),
    };
  let _0x2e0366 = _0x3d4746['mod'](_0x51b2a3);
  if (_0x2e0366['gt'](0x0)) {
    (_0x523394 = _0x523394['plus'](0x1)),
      (_0x2dd93c = _0x3d4746['div'](_0x523394));
    let _0x17baa9 = _0x3d4746['mod'](_0x523394);
    _0x17baa9['gt'](0x0) && (_0x2dd93c = _0x2dd93c['plus'](0x1));
  }
  return { q: _0x523394, r: _0x2dd93c };
}
