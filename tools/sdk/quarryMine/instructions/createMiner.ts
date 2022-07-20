import {
  QuarrySDK,
  findMinerAddress,
  findQuarryAddress,
} from '@quarryprotocol/quarry-sdk';
import { AugmentedProvider } from '@saberhq/solana-contrib';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import QuarryMineConfiguration, { SupportedMintName } from '../configuration';

export async function createMinerInstruction({
  augmentedProvider,
  authority,
  payer,
  mintName,
}: {
  augmentedProvider: AugmentedProvider;
  authority: PublicKey;
  payer: PublicKey;
  mintName: SupportedMintName;
}): Promise<TransactionInstruction> {
  const { mint, rewarder } = QuarryMineConfiguration.mintSpecificAddresses[
    mintName
  ];

  const [quarry] = await findQuarryAddress(rewarder, mint);
  const [miner, bump] = await findMinerAddress(quarry, authority);
  const [minerVault] = findATAAddrSync(miner, mint);

  const sdk = QuarrySDK.load({
    provider: augmentedProvider,
  });

  return sdk.programs.Mine.instruction.createMiner(bump, {
    accounts: {
      authority,
      miner,
      quarry,
      rewarder,
      systemProgram: SystemProgram.programId,
      payer,
      tokenMint: mint,
      minerVault,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}
