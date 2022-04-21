import { TransactionInstruction } from '@solana/web3.js';
import { refreshReserveInstruction } from '@solendprotocol/solend-sdk';
import SolendConfiguration, {
  SupportedLendingMarketName,
  SupportedTokenName,
} from './configuration';

export async function refreshReserve({
  lendingMarketName,
  tokenName,
}: {
  lendingMarketName: SupportedLendingMarketName;
  tokenName: SupportedTokenName;
}): Promise<TransactionInstruction> {
  const {
    supportedTokens,
  } = SolendConfiguration.getSupportedLendingMarketInformation(
    lendingMarketName,
  );

  if (!supportedTokens[tokenName]) {
    throw new Error(
      `Unsupported token ${tokenName} for Lending market ${lendingMarketName}`,
    );
  }

  const { reserve, pythOracle, switchboardFeedAddress } = supportedTokens[
    tokenName
  ]!;

  return refreshReserveInstruction(
    reserve,
    SolendConfiguration.programID,
    pythOracle,
    switchboardFeedAddress,
  );
}
