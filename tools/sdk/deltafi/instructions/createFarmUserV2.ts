import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { DeltafiProgram } from '../program/deltafi';
import deltafiConfiguration, { FarmInfo, PoolInfo } from '../configuration';

export default async function createFarmUserV2({
  deltafiProgram,
  authority,
  payer,
  poolInfo,
  farmInfo,
}: {
  deltafiProgram: DeltafiProgram;
  authority: PublicKey;
  payer: PublicKey;
  poolInfo: PoolInfo;
  farmInfo: FarmInfo;
}) {
  const [{ configKey }, [farmUser, farmUserBump]] = await Promise.all([
    deltafiProgram.account.swapInfo.fetch(poolInfo.swapInfo),

    deltafiConfiguration.findFarmUserAddress({
      farmAddress: farmInfo.address,
      authority,
    }),
  ]);

  return deltafiProgram.instruction.createFarmUserV2(farmUserBump, {
    accounts: {
      marketConfig: configKey.toBase58(),
      farmInfo: farmInfo.address,
      farmUser,
      owner: authority,
      payer,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
  });
}
