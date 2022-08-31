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
import { BN_ZERO } from '@utils/helpers';

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

export default function withdraw({
  connection,
  authority,
  uiLpTokenAmount,
  ammPool,
  slippage,
}: {
  connection: Connection;
  authority: PublicKey;
  uiLpTokenAmount: number;
  ammPool: AmmImpl;
  slippage: number;
}): Promise<TransactionInstruction> {
  const { tokenAMint, tokenBMint, lpMint } = ammPool.poolState;

  const [
    [userAToken],
    [userBToken],
    [userPoolLp],
  ] = findMultipleATAAddSync(authority, [tokenAMint, tokenBMint, lpMint]);

  const {
    poolTokenAmountIn,
    tokenAOutAmount,
    tokenBOutAmount,
  } = ammPool.getWithdrawQuote(
    uiAmountToNativeBN(uiLpTokenAmount, ammPool.decimals),
    slippage,
  );

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

  const programMethod =
    ammPool.isStablePool &&
    (tokenAOutAmount.isZero() || tokenBOutAmount.isZero())
      ? ammProgram.methods
          .removeLiquiditySingleSide(poolTokenAmountIn, BN_ZERO)
          .accounts({
            aTokenVault: ammPool.vaultA.vaultState.tokenVault,
            aVault: ammPool.poolState.aVault,
            aVaultLp: ammPool.poolState.aVaultLp,
            aVaultLpMint: ammPool.vaultA.vaultState.lpMint,
            bTokenVault: ammPool.vaultB.vaultState.tokenVault,
            bVault: ammPool.poolState.bVault,
            bVaultLp: ammPool.poolState.bVaultLp,
            bVaultLpMint: ammPool.vaultB.vaultState.lpMint,
            lpMint: ammPool.poolState.lpMint,
            pool: ammPool.address,
            userDestinationToken: tokenBOutAmount.isZero()
              ? userAToken
              : userBToken,
            userPoolLp,
            user: authority,
            tokenProgram: TOKEN_PROGRAM_ID,
            vaultProgram: MercurialConfiguration.vaultProgram,
          })
      : ammProgram.methods
          .removeBalanceLiquidity(
            poolTokenAmountIn,
            tokenAOutAmount,
            tokenBOutAmount,
          )
          .accounts({
            pool: ammPool.address,
            lpMint: ammPool.poolState.lpMint,
            aVault: ammPool.poolState.aVault,
            aTokenVault: ammPool.vaultA.vaultState.tokenVault,
            aVaultLp: ammPool.poolState.aVaultLp,
            aVaultLpMint: ammPool.vaultA.vaultState.lpMint,
            bVault: ammPool.poolState.bVault,
            bTokenVault: ammPool.vaultB.vaultState.tokenVault,
            bVaultLp: ammPool.poolState.bVaultLp,
            bVaultLpMint: ammPool.vaultB.vaultState.lpMint,
            userAToken,
            userBToken,
            user: authority,
            userPoolLp,
            tokenProgram: TOKEN_PROGRAM_ID,
            vaultProgram: MercurialConfiguration.vaultProgram,
          });

  return programMethod
    .remainingAccounts(getRemainingAccounts(ammPool.poolState))
    .instruction();
}
