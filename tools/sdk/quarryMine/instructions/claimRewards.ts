import {
  QuarrySDK,
  findMinerAddress,
  findQuarryAddress,
} from '@quarryprotocol/quarry-sdk';
import { AugmentedProvider } from '@saberhq/solana-contrib';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import QuarryMineConfiguration, { SupportedMintName } from '../configuration';

export async function claimRewardsInstruction({
  augmentedProvider,
  authority,
  mintName,
}: {
  augmentedProvider: AugmentedProvider;
  authority: PublicKey;
  mintName: SupportedMintName;
}): Promise<TransactionInstruction> {
  const {
    mint,
    rewarder,
    mintWrapper,
    claimFeeTokenAccount,
    rewardsTokenMint,
    minter,
  } = QuarryMineConfiguration.mintSpecificAddresses[mintName];

  const [quarry] = await findQuarryAddress(rewarder, mint);
  const [miner] = await findMinerAddress(quarry, authority);
  const [minerVault] = findATAAddrSync(miner, mint);

  const sdk = QuarrySDK.load({
    provider: augmentedProvider,
  });

  const [rewardsTokenAccount] = findATAAddrSync(authority, rewardsTokenMint);

  return sdk.programs.Mine.instruction.claimRewards({
    accounts: {
      mintWrapper,
      mintWrapperProgram: QuarryMineConfiguration.mintWrapperProgram,
      minter,
      rewardsTokenMint,
      rewardsTokenAccount,
      claimFeeTokenAccount,
      stake: {
        authority,
        miner,
        quarry,
        tokenProgram: TOKEN_PROGRAM_ID,
        rewarder,

        // Could be any writable account
        unusedMinerVault: minerVault,
        unusedTokenAccount: minerVault,
      },
    },
  });
}
