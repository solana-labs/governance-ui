import { PublicKey } from '@solana/web3.js';
import SolendConfiguration from './configuration';

export async function deriveObligationAddressFromWalletAndSeed(
  walletAddress: PublicKey,
  seed,
) {
  return PublicKey.createWithSeed(
    walletAddress,
    seed,
    SolendConfiguration.programID,
  );
}
