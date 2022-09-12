import { BigNumber as _BigNumber } from 'bignumber.js';
import { Type, success, failure, TypeOf } from 'io-ts';

export const BigNumber = new Type<_BigNumber, string, unknown>(
  'BigNumber',
  (u: unknown): u is _BigNumber => u instanceof _BigNumber,
  (input, context) => {
    try {
      if (typeof input === 'string') {
        const pk = new _BigNumber(input);
        return success(pk);
      } else {
        return failure(input, context);
      }
    } catch {
      return failure(input, context);
    }
  },
  (a: _BigNumber) => a.toString(),
);

export type PublicKey = TypeOf<typeof BigNumber>;
