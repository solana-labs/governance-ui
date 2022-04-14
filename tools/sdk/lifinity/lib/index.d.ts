import { PublicKey, Transaction, Keypair } from '@solana/web3.js';
import {
  Lifinity,
  getAmountOut,
  IAmountOut,
  getSwapInstruction,
  ISwapInstructions,
  getSwapTransactionWithAuthority,
} from './lifinity_amm';
import { getProgramAddress } from './network';
import { getPoolList, getPool, IPoolInfo } from './pool';
import { getMultipleAccounts, getParsedData, IAmmData } from './utils';
import { getCurveAmount, TradeDirection, ICurveAmount } from './curve';
import { LIFINITY_AMM_LAYOUT } from './layout';
export {
  Lifinity,
  getProgramAddress,
  getPoolList,
  getAmountOut,
  IAmountOut,
  getPool,
  IPoolInfo,
  TradeDirection,
  getMultipleAccounts,
  getParsedData,
  IAmmData,
  getCurveAmount,
  ICurveAmount,
  getSwapInstruction,
  ISwapInstructions,
  getSwapTransactionWithAuthority,
  LIFINITY_AMM_LAYOUT,
};
export interface IWallet {
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
  publicKey: PublicKey;
  payer: Keypair;
}
