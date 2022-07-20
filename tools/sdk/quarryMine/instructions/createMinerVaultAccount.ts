import {
  findMinerAddress,
  findQuarryAddress,
} from '@quarryprotocol/quarry-sdk';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { createAssociatedTokenAccount } from '@utils/associated';
import QuarryMineConfiguration, { SupportedMintName } from '../configuration';

export async function createMinerVaultAccountInstruction({
  authority,
  payer,
  mintName,
}: {
  authority: PublicKey;
  payer: PublicKey;
  mintName: SupportedMintName;
}): Promise<TransactionInstruction> {
  const { mint, rewarder } = QuarryMineConfiguration.mintSpecificAddresses[
    mintName
  ];

  const [quarry] = await findQuarryAddress(rewarder, mint);
  const [miner] = await findMinerAddress(quarry, authority);

  const [tx, minerVault] = await createAssociatedTokenAccount(
    payer,
    miner,
    mint,
  );

  console.info('Create Miner Vault Account', {
    authority: authority.toString(),
    payer: payer.toString(),
    mint: mint.toString(),
    miner: miner.toString(),
    minerVault: minerVault.toString(),
  });

  return tx;
}
