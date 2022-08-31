import AmmImpl, { PoolState } from '@mercurial-finance/dynamic-amm-sdk';
import { CURVE_TYPE_ACCOUNTS } from '@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/constants';
import { Program, Provider } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { findMultipleATAAddSync } from '@uxd-protocol/uxd-client';
import {
  Amm,
  IDL as AmmIdl,
} from '@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/idl';
import { MercurialConfiguration } from './configuration';
import { uiAmountToNativeBN } from '../units';

const getRemainingAccounts = (poolState: PoolState) => {
  const accounts: Array<{
    pubkey: PublicKey;
    isWritable: boolean;
    isSigner: boolean;
  }> = [];

  if ('stable' in poolState.curveType) {
    if ('marinade' in poolState.curveType['stable'].depeg.depegType) {
      accounts.push({
        pubkey: CURVE_TYPE_ACCOUNTS.marinade,
        isWritable: false,
        isSigner: false,
      });
    }

    if ('lido' in poolState.curveType['stable'].depeg.depegType) {
      accounts.push({
        pubkey: CURVE_TYPE_ACCOUNTS.solido,
        isWritable: false,
        isSigner: false,
      });
    }
  }

  return accounts;
};

export default function deposit({
  connection,
  authority,
  uiTokenAInAmount,
  uiTokenBInAmount,
  slippage,
  ammPool,
}: {
  connection: Connection;
  authority: PublicKey;
  uiTokenAInAmount: number;
  uiTokenBInAmount: number;
  slippage: number;
  ammPool: AmmImpl;
}): Promise<TransactionInstruction> {
  const { tokenAMint, tokenBMint, lpMint } = ammPool.poolState;

  const {
    poolTokenAmountOut,
    tokenAInAmount,
    tokenBInAmount,
  } = ammPool.getDepositQuote(
    uiAmountToNativeBN(uiTokenAInAmount, ammPool.tokenA.decimals),
    uiAmountToNativeBN(uiTokenBInAmount, ammPool.tokenB.decimals),
    false,
    slippage,
  );

  const [
    [userAToken],
    [userBToken],
    [userPoolLp],
  ] = findMultipleATAAddSync(authority, [tokenAMint, tokenBMint, lpMint]);

  const provider = new Provider(
    connection,
    {} as any,
    Provider.defaultOptions(),
  );
  const ammProgram = new Program<Amm>(
    AmmIdl,
    MercurialConfiguration.poolProgram,
    provider,
  );

  const programMethod = ammPool.isStablePool
    ? ammProgram.methods.addImbalanceLiquidity
    : ammProgram.methods.addBalanceLiquidity;

  return programMethod(poolTokenAmountOut, tokenAInAmount, tokenBInAmount)
    .accounts({
      aTokenVault: ammPool.vaultA.vaultState.tokenVault,
      bTokenVault: ammPool.vaultB.vaultState.tokenVault,
      aVault: ammPool.poolState.aVault,
      bVault: ammPool.poolState.bVault,
      pool: ammPool.address,
      user: authority,
      userAToken,
      userBToken,
      aVaultLp: ammPool.poolState.aVaultLp,
      bVaultLp: ammPool.poolState.bVaultLp,
      aVaultLpMint: ammPool.vaultA.vaultState.lpMint,
      bVaultLpMint: ammPool.vaultB.vaultState.lpMint,
      lpMint: ammPool.poolState.lpMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      vaultProgram: MercurialConfiguration.vaultProgram,
      userPoolLp,
    })
    .remainingAccounts(getRemainingAccounts(ammPool.poolState))
    .instruction();
}
