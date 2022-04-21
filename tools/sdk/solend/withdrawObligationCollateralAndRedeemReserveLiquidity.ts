import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { withdrawObligationCollateralAndRedeemReserveLiquidity as originalWithdrawFunction } from '@solendprotocol/solend-sdk';
import { findATAAddrSync } from '@utils/ataTools';
import SolendConfiguration, {
  SupportedLendingMarketName,
  SupportedTokenName,
} from './configuration';
import { deriveObligationAddressFromWalletAndSeed } from './utils';

export async function withdrawObligationCollateralAndRedeemReserveLiquidity({
  obligationOwner,
  liquidityAmount,
  lendingMarketName,
  destinationLiquidity,
  tokenName,
}: {
  obligationOwner: PublicKey;
  liquidityAmount: number | BN;
  lendingMarketName: SupportedLendingMarketName;
  tokenName: SupportedTokenName;
  destinationLiquidity?: PublicKey;
}) {
  const {
    supportedTokens,
    lendingMarket,
    lendingMarketAuthority,
    seed,
  } = SolendConfiguration.getSupportedLendingMarketInformation(
    lendingMarketName,
  );

  if (!supportedTokens[tokenName]) {
    throw new Error(
      `Unsupported token ${tokenName} for Lending market ${lendingMarketName}`,
    );
  }

  const {
    relatedCollateralMint,
    mint,
    reserve,
    reserveLiquiditySupply,
    reserveCollateralSupplySplTokenAccount,
  } = supportedTokens[tokenName]!;

  const reserveCollateralMint = relatedCollateralMint.mint;

  const [usdcTokenAccount] = findATAAddrSync(obligationOwner, mint);
  const [cusdcTokenAccount] = findATAAddrSync(
    obligationOwner,
    relatedCollateralMint.mint,
  );

  const obligation = await deriveObligationAddressFromWalletAndSeed(
    obligationOwner,
    seed,
  );

  const transferAuthority = obligationOwner;
  const sourceCollateral = reserveCollateralSupplySplTokenAccount;
  const destinationCollateral = cusdcTokenAccount;
  const withdrawReserve = reserve;

  return originalWithdrawFunction(
    liquidityAmount,
    sourceCollateral,
    destinationCollateral,
    withdrawReserve,
    obligation,
    lendingMarket,
    lendingMarketAuthority,
    destinationLiquidity ?? usdcTokenAccount,
    reserveCollateralMint,
    reserveLiquiditySupply,
    obligationOwner,
    transferAuthority,
    SolendConfiguration.programID,
  );
}
