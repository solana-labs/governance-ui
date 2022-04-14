/// <reference types="node" />
import { Program } from '@project-serum/anchor';
import {
  AccountInfo,
  Commitment,
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import Decimal from 'decimal.js';
import { LifinityAmm as LifinityAmmType } from './idl/lifinity_amm';
import { AmmData, FeesData, ConfigData, PythData } from './types';
import { IPoolInfo } from './pool';
export declare function createWSOLAccountIfNotExist(
  program: Program<LifinityAmmType>,
  account: PublicKey | undefined | null,
  amountIn: number,
  transaction: Transaction,
  signer: any[],
): Promise<PublicKey>;
export declare function createAssociatedTokenAccountIfNotExist(
  program: Program<LifinityAmmType>,
  tokenMintAddress: PublicKey,
  transaction: Transaction,
): Promise<PublicKey>;
export declare function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey,
): Promise<PublicKey>;
export declare function findProgramAddress(
  seeds: Array<Buffer | Uint8Array>,
  programId: PublicKey,
): Promise<{
  publicKey: PublicKey;
  nonce: number;
}>;
export declare function getProgramAuthority(
  id: PublicKey,
  publickey: PublicKey,
): Promise<{
  programAuthority: PublicKey;
  nonce: number;
}>;
export declare const sleep: (ms: number) => Promise<unknown>;
export declare function getMultipleAccounts(
  connection: Connection,
  publicKeys: PublicKey[],
  commitment?: Commitment,
): Promise<
  Array<null | {
    publicKey: PublicKey;
    account: AccountInfo<Buffer>;
  }>
>;
export interface IAmmData {
  amm: AmmData;
  fees: FeesData;
  coinBalance: Decimal;
  pcBalance: Decimal;
  config: ConfigData;
  pyth: PythData;
  pythPc: PythData;
}
export declare function getParsedData(
  multipleInfo: Array<null | {
    publicKey: PublicKey;
    account: AccountInfo<Buffer>;
  }>,
  poolInfo: IPoolInfo,
): IAmmData;
export interface amountInfo {
  amountIn: number;
  amountOut: number;
  priceImpact: number;
  fee: number;
  feePercent: number;
}
export declare function getTokenAccountBalance(
  connection: Connection,
  tokenAccount: PublicKey,
): Promise<{
  context: {};
  value: {
    amount: string;
    decimals: number;
  };
}>;
export declare function getTokenSupply(
  connection: Connection,
  mint: PublicKey,
): Promise<{
  context: {};
  value: {
    amount: string;
    decimals: number;
  };
}>;
