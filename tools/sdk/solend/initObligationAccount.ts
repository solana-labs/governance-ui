import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { initObligationInstruction } from '@solendprotocol/solend-sdk';
import SolendConfiguration, {
  SupportedLendingMarketName,
} from './configuration';
import { deriveObligationAddressFromWalletAndSeed } from './utils';

export async function initObligationAccount({
  obligationOwner,
  lendingMarketName,
}: {
  obligationOwner: PublicKey;
  lendingMarketName: SupportedLendingMarketName;
}): Promise<TransactionInstruction> {
  const {
    seed,
    lendingMarket,
  } = SolendConfiguration.getSupportedLendingMarketInformation(
    lendingMarketName,
  );

  const obligationAddress = await deriveObligationAddressFromWalletAndSeed(
    obligationOwner,
    seed,
  );

  return initObligationInstruction(
    obligationAddress,
    lendingMarket,
    obligationOwner,
    SolendConfiguration.programID,
  );
}
