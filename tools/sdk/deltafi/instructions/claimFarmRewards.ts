import { PublicKey } from '@solana/web3.js';
import { DeltafiProgram } from '../program/deltafi';
import deltafiConfiguration, {
  FarmInfo,
  PoolInfo,
  DeltafiDexV2,
} from '../configuration';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { findATAAddrSync } from '@utils/ataTools';

export default async function claimFarmRewards({
  deltafiProgram,
  authority,
  poolInfo,
  farmInfo,
}: {
  deltafiProgram: DeltafiProgram;
  authority: PublicKey;
  poolInfo: PoolInfo;
  farmInfo: FarmInfo;
}) {
  const [{ configKey }, [farmUser]] = await Promise.all([
    deltafiProgram.account.swapInfo.fetch(poolInfo.swapInfo),

    deltafiConfiguration.findFarmUserAddress({
      farmAddress: farmInfo.address,
      authority,
    }),
  ]);

  const farmUserInfo = await deltafiProgram.account.farmUser.fetchNullable(
    farmUser,
  );
  const farmInfoAccount = await deltafiProgram.account.farmInfo.fetch(
    farmInfo.address,
  );
  const swapInfo = await deltafiProgram.account.swapInfo.fetch(
    poolInfo.swapInfo,
  );

  console.log('farmUserInfo', farmUserInfo);
  console.log('farmInfo', farmInfoAccount);
  console.log('swapInfo', swapInfo);

  if (!farmUserInfo) {
    throw new Error('Farm user is required. Please create it beforehand.');
  }

  const [userDeltafiToken] = findATAAddrSync(
    authority,
    DeltafiDexV2.deltafiMint,
  );

  return deltafiProgram.instruction.claimFarmRewards({
    accounts: {
      marketConfig: configKey.toBase58(),
      swapInfo: poolInfo.swapInfo,
      farmInfo: farmInfo.address,
      farmUser,
      userDeltafiToken,
      swapDeltafiToken: DeltafiDexV2.deltafiToken,
      owner: authority,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}
