import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { refreshObligationInstruction } from '@solendprotocol/solend-sdk';
import SolendConfiguration, {
  SupportedLendingMarketName,
} from './configuration';
import { deriveObligationAddressFromWalletAndSeed } from './utils';

export async function refreshObligation({
  obligationOwner,
  lendingMarketName,
}: {
  obligationOwner: PublicKey;
  lendingMarketName: SupportedLendingMarketName;
}): Promise<TransactionInstruction> {
  const {
    seed,
    supportedTokens,
  } = SolendConfiguration.getSupportedLendingMarketInformation(
    lendingMarketName,
  );

  const obligationAddress = await deriveObligationAddressFromWalletAndSeed(
    obligationOwner,
    seed,
  );

  return refreshObligationInstruction(
    obligationAddress,
    // Both deposit reserves + borrow reserves parameters leads to the same data in instruction they are concatenated
    Object.values(supportedTokens).map(({ reserve }) => reserve),
    [],
    SolendConfiguration.programID,
  );
}
