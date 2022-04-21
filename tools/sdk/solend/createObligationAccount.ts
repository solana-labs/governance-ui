import { PublicKey, SystemProgram } from '@solana/web3.js';
import SolendConfiguration, {
  SupportedLendingMarketName,
} from './configuration';
import { deriveObligationAddressFromWalletAndSeed } from './utils';

export async function createObligationAccount({
  payer,
  authority,
  lendingMarketName,
}: {
  payer: PublicKey;
  authority: PublicKey;
  lendingMarketName: SupportedLendingMarketName;
}) {
  const { seed } = SolendConfiguration.getSupportedLendingMarketInformation(
    lendingMarketName,
  );

  const newAccountPubkey = await deriveObligationAddressFromWalletAndSeed(
    authority,
    seed,
  );

  const { lamports, space } = SolendConfiguration.createObligationConfiguration;

  return SystemProgram.createAccountWithSeed({
    basePubkey: authority,
    fromPubkey: payer,
    newAccountPubkey,
    programId: SolendConfiguration.programID,
    seed,
    lamports,
    space,
  });
}
