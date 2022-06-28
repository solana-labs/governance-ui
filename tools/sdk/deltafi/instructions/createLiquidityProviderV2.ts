import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { DeltafiProgram } from '../program/deltafi';
import deltafiConfiguration, { PoolInfo } from '../configuration';

export default async function createLiquidityProviderV2({
  deltafiProgram,
  authority,
  poolInfo,
  payer,
}: {
  deltafiProgram: DeltafiProgram;
  authority: PublicKey;
  poolInfo: PoolInfo;
  payer: PublicKey;
}) {
  const [{ configKey }, [lpPublicKey, lpBump]] = await Promise.all([
    deltafiProgram.account.swapInfo.fetch(poolInfo.swapInfo),

    deltafiConfiguration.findLiquidityProviderAddress({
      poolInfo,
      authority,
    }),
  ]);

  return deltafiProgram.instruction.createLiquidityProviderV2(lpBump, {
    accounts: {
      marketConfig: configKey,
      swapInfo: poolInfo.swapInfo,
      liquidityProvider: lpPublicKey,
      owner: authority,
      payer,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
  });
}
