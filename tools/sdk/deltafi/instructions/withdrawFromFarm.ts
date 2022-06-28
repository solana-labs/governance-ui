import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { DeltafiProgram } from '../program/deltafi';
import deltafiConfiguration, { FarmInfo, PoolInfo } from '../configuration';

export default async function withdrawFromFarm({
  deltafiProgram,
  authority,
  poolInfo,
  farmInfo,
  baseAmount,
  quoteAmount,
}: {
  deltafiProgram: DeltafiProgram;
  authority: PublicKey;
  poolInfo: PoolInfo;
  farmInfo: FarmInfo;
  baseAmount: BN;
  quoteAmount: BN;
}) {
  const [{ configKey }, [lpPublicKey], [farmUser]] = await Promise.all([
    deltafiProgram.account.swapInfo.fetch(poolInfo.swapInfo),

    deltafiConfiguration.findLiquidityProviderAddress({
      poolInfo,
      authority,
    }),

    deltafiConfiguration.findFarmUserAddress({
      farmAddress: farmInfo.address,
      authority,
    }),
  ]);

  const farmUserInfo = await deltafiProgram.account.farmUser.fetchNullable(
    farmUser,
  );

  if (!farmUserInfo) {
    throw new Error('Farm user is required. Please create it beforehand.');
  }

  return deltafiProgram.instruction.withdrawFromFarm(baseAmount, quoteAmount, {
    accounts: {
      marketConfig: configKey.toBase58(),
      swapInfo: poolInfo.swapInfo,
      farmInfo: farmInfo.address,
      liquidityProvider: lpPublicKey,
      farmUser,
      owner: authority,
    },
  });
}
