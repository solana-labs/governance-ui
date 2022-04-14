import Decimal from 'decimal.js';
import { AmmData, FeesData, ConfigData, PythData } from './types';
export declare const TradeDirection: {
  readonly AtoB: 'AtoB';
  readonly BtoA: 'BtoA';
};
export interface ICurveAmount {
  amountSwapped: Decimal;
  priceImpact: Decimal;
  fee: Decimal;
  feePercent: Decimal;
}
export declare function getCurveAmount(
  amount: Decimal,
  slot: number,
  amm: AmmData,
  fees: FeesData,
  coinBalance: Decimal,
  pcBalance: Decimal,
  config: ConfigData,
  pyth: PythData,
  pythPc: PythData,
  tradeDirection: any,
): ICurveAmount;
