import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Liquidity,
  TOKEN_PROGRAM_ID,
} from '@raydium-io/raydium-sdk'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { Token } from '@solana/spl-token'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'
import { UXP_USDC_POOL_KEYS } from './poolKeys'

export const createAddLiquidityInstruction = (
  baseTokenAccount: PublicKey, //TokenA  we want to deposit (USDC or UXP)
  quoteTokenAccount: PublicKey, //Value in TokenB of TokenA  (UXP or USDC)
  baseAmountIn: number,
  quoteAmountIn: number,
  owner: PublicKey,
  payer: PublicKey
): TransactionInstruction => {
  const [lpTokenAccount] = findATAAddrSync(owner, UXP_USDC_POOL_KEYS.lpMint)
  console.log(
    'lp token account to create if not exist: ',
    lpTokenAccount.toBase58()
  )

  const createlpTokenAccountItx = Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    UXP_USDC_POOL_KEYS.lpMint,
    lpTokenAccount,
    owner, // owner
    payer // payer
  )

  console.log(
    `Initialize Authority Insurance ATA (${lpTokenAccount.toBase58()}) itx:`,
    serializeInstructionToBase64(createlpTokenAccountItx)
  )

  const itx = Liquidity.makeAddLiquidityInstruction({
    poolKeys: UXP_USDC_POOL_KEYS,
    userKeys: {
      baseTokenAccount,
      quoteTokenAccount,
      lpTokenAccount: findATAAddrSync(owner, UXP_USDC_POOL_KEYS.lpMint)[0],
      owner,
    },
    baseAmountIn,
    quoteAmountIn,
    fixedSide: 'quote',
  })

  return itx
}
