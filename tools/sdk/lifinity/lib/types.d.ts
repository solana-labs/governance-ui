import { Transaction } from '@solana/web3.js';
import Decimal from 'decimal.js';
export declare type SwapTransaction = {
  transaction: Transaction;
  signers: any[];
};
export declare type TokenInfo = {
  symbol: string;
  mintAddress: string;
  decimals: number;
};
export declare type AmmData = {
  freezeTrade: number;
  freezeDeposit: number;
  freezeWithdraw: number;
  baseDecimals: number;
  curveType: number;
};
export declare type FeesData = {
  tradeFeeNumerator: Decimal;
  tradeFeeDenominator: Decimal;
  ownerTradeFeeNumerator: Decimal;
  ownerTradeFeeDenominator: Decimal;
};
export declare type ConfigData = {
  concentrationRatio: Decimal;
  lastPrice: Decimal;
  adjustRatio: Decimal;
  balanceRatio: Decimal;
  lastBalancedPrice: Decimal;
  configDenominator: Decimal;
  pythConfidenceLimit: Decimal;
  pythSlotLimit: Decimal;
  volumeX: Decimal;
  volumeY: Decimal;
  volumeXinY: Decimal;
  coefficientUp: Decimal;
  coefficientDown: Decimal;
  oracleStatus: Decimal;
  configTemp1: Decimal;
  configTemp2: Decimal;
};
export declare type PythData = {
  price: Decimal;
  confidence: Decimal;
  status: Decimal;
  publishSlot: Decimal;
  exponent: number;
};
