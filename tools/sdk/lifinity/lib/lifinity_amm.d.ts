import { Program } from '@project-serum/anchor';
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import { IWallet } from '.';
import { LifinityAmm as LifinityAmmType } from './idl/lifinity_amm';
export declare class Lifinity {
  connection: Connection;
  wallet: IWallet;
  program: Program<LifinityAmmType>;
  stateAddress: PublicKey;
  programAuthority: PublicKey;
  owner: Keypair;
  private constructor();
  static build(connection: Connection, wallet: any): Promise<Lifinity>;
  swap(
    amountIn: number,
    minimumAmountOut: number,
    fromMint: PublicKey,
    toMint: PublicKey,
  ): Promise<string>;
  getCreateTokenAccountInstruction(
    tokenMintAddress: PublicKey,
  ): Promise<TransactionInstruction | undefined>;
  getDepositUxdInstruction(
    amountInUxd: number,
    amountInUsdc: number,
    amountInLp: number,
    userLpTokenAccount: PublicKey,
  ): Promise<TransactionInstruction | undefined>;
  getWithdrawUxdInstruction(
    amountInLp: number,
    userUxdTokenAccount: PublicKey,
    userUsdcTokenAccount: PublicKey,
    slippage: number,
  ): Promise<TransactionInstruction | undefined>;
  getDepositAmountOut(
    connection: Connection,
    amountIn: number,
    slippage: number,
  ): Promise<IDepositAmountOut>;
  private getOutAmount;
}
export interface IAmountOut {
  amountIn: number;
  amountOut: number;
  amountOutWithSlippage: number;
  priceImpact: number;
  fee: number;
  feePercent: number;
}
export declare function getAmountOut(
  connection: Connection,
  amountIn: number,
  fromMint: PublicKey,
  toMint: PublicKey,
  slippage: number,
): Promise<IAmountOut>;
export interface ISwapInstructions {
  approveInstruction: TransactionInstruction;
  swapInstruction: TransactionInstruction;
  signers: any[];
}
export declare function getSwapInstruction(
  connection: Connection,
  ownerAccount: PublicKey,
  amountIn: number,
  minimumOut: number,
  fromMint: PublicKey,
  toMint: PublicKey,
  fromUserAccount: PublicKey,
  toTokenAccount: PublicKey,
  approve?: boolean,
): Promise<ISwapInstructions>;
export declare function getSwapTransactionWithAuthority(
  connection: Connection,
  ownerAccount: PublicKey,
  amountIn: number,
  minimumAmountOut: number,
  fromMint: PublicKey,
  toMint: PublicKey,
  fromUserAccount: PublicKey,
  toTokenAccount: PublicKey,
  authority: PublicKey,
): TransactionInstruction;
export interface IDepositAmountOut {
  amountIn: number;
  amountOut: number;
  lpRecive: number;
}
