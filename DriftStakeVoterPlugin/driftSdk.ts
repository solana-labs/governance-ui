import { PublicKey } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { BN } from '@coral-xyz/anchor'

export async function getSpotMarketPublicKey(
  programId: PublicKey,
  marketIndex: number
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode('spot_market')),
        new anchor.BN(marketIndex).toArrayLike(Buffer, 'le', 2),
      ],
      programId
    )
  )[0]
}

export async function getInsuranceFundVaultPublicKey(
  programId: PublicKey,
  marketIndex: number
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode('insurance_fund_vault')),
        new anchor.BN(marketIndex).toArrayLike(Buffer, 'le', 2),
      ],
      programId
    )
  )[0]
}

export function getInsuranceFundStakeAccountPublicKey(
  programId: PublicKey,
  authority: PublicKey,
  marketIndex: number
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode('insurance_fund_stake')),
      authority.toBuffer(),
      new anchor.BN(marketIndex).toArrayLike(Buffer, 'le', 2),
    ],
    programId
  )[0]
}

const ZERO = new BN(0)
export function unstakeSharesToAmountWithOpenRequest(
  nShares: BN,
  withdrawRequestShares: BN,
  withdrawRequestAmount: BN,
  totalIfShares: BN,
  insuranceFundVaultBalance: BN
): BN {
  let stakedAmount: BN
  if (totalIfShares.gt(ZERO)) {
    stakedAmount = BN.max(
      ZERO,
      nShares
        .sub(withdrawRequestShares)
        .mul(insuranceFundVaultBalance)
        .div(totalIfShares)
    )
  } else {
    stakedAmount = ZERO
  }

  const withdrawAmount = BN.min(
    withdrawRequestAmount,
    withdrawRequestShares.mul(insuranceFundVaultBalance).div(totalIfShares)
  )
  const amount = withdrawAmount.add(stakedAmount)

  return amount
}
