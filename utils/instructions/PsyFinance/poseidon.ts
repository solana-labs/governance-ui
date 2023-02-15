import { BN, Program, web3 } from '@coral-xyz/anchor'
import { Poseidon } from './PoseidonIdl'

type BoundedStrategyParamsV2 = {
  boundPriceNumerator: BN
  boundPriceDenominator: BN
  reclaimDate: BN
}

const deriveBoundedStrategyV2 = (
  program: Program<Poseidon>,
  mint: web3.PublicKey,
  boundPriceNumerator: BN,
  boundPriceDenominator: BN,
  reclaimDate: BN
) => {
  const textEncoder = new TextEncoder()
  return web3.PublicKey.findProgramAddressSync(
    [
      mint.toBuffer(),
      boundPriceNumerator.toArrayLike(Buffer, 'le', 8),
      boundPriceDenominator.toArrayLike(Buffer, 'le', 8),
      reclaimDate.toArrayLike(Buffer, 'le', 8),
      textEncoder.encode('boundedStrategy'),
    ],
    program.programId
  )
}

const deriveCollateralAccount = (
  program: Program<Poseidon>,
  strategy: web3.PublicKey
) => {
  const textEncoder = new TextEncoder()
  return web3.PublicKey.findProgramAddressSync(
    [strategy.toBuffer(), textEncoder.encode('orderPayer')],
    program.programId
  )
}

export const deriveAllBoundedStrategyKeysV2 = (
  program: Program<Poseidon>,
  mint: web3.PublicKey,
  boundedStrategyParams: BoundedStrategyParamsV2
) => {
  const {
    boundPriceNumerator,
    boundPriceDenominator,
    reclaimDate,
  } = boundedStrategyParams
  const [boundedStrategy] = deriveBoundedStrategyV2(
    program,
    mint,
    boundPriceNumerator,
    boundPriceDenominator,
    reclaimDate
  )
  const [collateralAccount] = deriveCollateralAccount(program, boundedStrategy)
  return { collateralAccount, boundedStrategy }
}
