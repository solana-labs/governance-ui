import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { withdrawObligationCollateralAndRedeemReserveLiquidity as originalWithdrawFunction } from '@solendprotocol/solend-sdk'
import { findATAAddrSync } from '@utils/ataTools'
import SolendConfiguration, { SupportedMintName } from './configuration'

import { deriveObligationAddressFromWalletAndSeed } from './utils'

export async function withdrawObligationCollateralAndRedeemReserveLiquidity({
  obligationOwner,
  liquidityAmount,
  mintName,
  destinationLiquidity,
}: {
  obligationOwner: PublicKey
  liquidityAmount: number | BN
  mintName: SupportedMintName
  destinationLiquidity?: PublicKey
}) {
  const {
    relatedCollateralMint,
    mint,
    reserve,
    reserveLiquiditySupply,
    reserveCollateralSupplySplTokenAccount,
  } = SolendConfiguration.getSupportedMintInformation(mintName)

  const reserveCollateralMint = relatedCollateralMint.mint

  const [usdcTokenAccount] = findATAAddrSync(obligationOwner, mint)
  const [cusdcTokenAccount] = findATAAddrSync(
    obligationOwner,
    relatedCollateralMint.mint
  )

  const obligation = await deriveObligationAddressFromWalletAndSeed(
    obligationOwner
  )

  const transferAuthority = obligationOwner
  const sourceCollateral = reserveCollateralSupplySplTokenAccount
  const destinationCollateral = cusdcTokenAccount
  const withdrawReserve = reserve

  return originalWithdrawFunction(
    liquidityAmount,
    sourceCollateral,
    destinationCollateral,
    withdrawReserve,
    obligation,
    SolendConfiguration.lendingMarket,
    SolendConfiguration.lendingMarketAuthority,
    destinationLiquidity ?? usdcTokenAccount,
    reserveCollateralMint,
    reserveLiquiditySupply,
    obligationOwner,
    transferAuthority,
    SolendConfiguration.programID
  )
}
