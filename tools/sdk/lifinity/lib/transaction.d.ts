/// <reference types="bn.js" />
import { Program, BN } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { LifinityAmm as LifinityAmmType } from './idl/lifinity_amm';
import { ISwapInstructions } from './lifinity_amm';
import { IPoolInfo } from './pool';
import Decimal from 'decimal.js';
export declare function sendSwap(
  program: Program<LifinityAmmType>,
  pool: IPoolInfo,
  fromTokenMint: PublicKey,
  toTokenMint: PublicKey,
  amountIn: number,
  minimumAmountOut: number,
): Promise<string>;
export declare function getInstruction(
  program: Program<LifinityAmmType>,
  pool: IPoolInfo,
  amountIn: Decimal,
  minimumOut: Decimal,
  ownerAccount: PublicKey,
  fromUserAccount: PublicKey,
  toTokenAccount: PublicKey,
  fromPoolAccount: PublicKey,
  toPoolAccount: PublicKey,
  approve?: boolean,
): Promise<ISwapInstructions>;
export declare function makeSwapTransactionWithAuthority(
  program: Program<LifinityAmmType>,
  amountIn: number,
  minimumAmountOut: number,
  ownerAccount: PublicKey,
  fromUserAccount: PublicKey,
  toTokenAccount: PublicKey,
  fromTokenMint: PublicKey,
  pool: IPoolInfo,
  authority: PublicKey,
): TransactionInstruction;
export declare function makeSwapInstructionWithAuthority(
  program: Program<LifinityAmmType>,
  userTransferAuthority: PublicKey,
  fromUserAccount: PublicKey,
  toTokenAccount: PublicKey,
  fromPoolAccount: PublicKey,
  toPoolAccount: PublicKey,
  amountIn: BN,
  minimumOut: BN,
  pool: IPoolInfo,
  authority: PublicKey,
): TransactionInstruction;
export declare function getAccountInst(
  program: Program<LifinityAmmType>,
  tokenMintAddress: PublicKey,
): Promise<TransactionInstruction | undefined>;
export declare function getDepositInst(
  program: Program<LifinityAmmType>,
  pool: IPoolInfo,
  amountInUxd: number,
  amountInUsdc: number,
  amountInLp: number,
  userLpTokenAccount: PublicKey,
): Promise<TransactionInstruction | undefined>;
export declare function getWithdrawInst(
  program: Program<LifinityAmmType>,
  pool: IPoolInfo,
  amountInLp: number,
  userUxdTokenAccount: PublicKey,
  userUsdcTokenAccount: PublicKey,
  slippage: number,
): Promise<TransactionInstruction | undefined>;
