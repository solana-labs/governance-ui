import { BN } from '@project-serum/anchor';
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

export async function stakeTokensInstruction({
  augmentedProvider,
  authority,
  sourceAccount,
  amount,
  mintName,
}: {
  augmentedProvider: AugmentedProvider;
  authority: PublicKey;
  sourceAccount: PublicKey;
  amount: BN;
  mintName: SupportedMintName;
}): Promise<TransactionInstruction> {
  const { mint, rewarder } = QuarryMineConfiguration.mintSpecificAddresses[
    mintName
  ];

  const [quarry] = await findQuarryAddress(rewarder, mint);
  const [miner] = await findMinerAddress(quarry, authority);
  const [minerVault] = findATAAddrSync(miner, mint);

  const sdk = QuarrySDK.load({
    provider: augmentedProvider,
  });

  return sdk.programs.Mine.instruction.stakeTokens(amount, {
    accounts: {
      authority,
      miner,
      quarry,
      minerVault,
      tokenAccount: sourceAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      rewarder,
    },
  });
}
