import { BN } from '@project-serum/anchor'
import {
  AmountSide,
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
  tokenMintA: PublicKey, //TokenA  we want to deposit (USDC or UXP)
  tokenMintB: PublicKey, //Value in TokenB of TokenA  (UXP or USDC)
  amountA: BN,
  amountB: BN,
  fixedSide: AmountSide,
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
    `Initialize Authority LP token ATA (${lpTokenAccount.toBase58()}) itx:`,
    serializeInstructionToBase64(createlpTokenAccountItx)
  )

  const [baseTokenAccount] = findATAAddrSync(owner, UXP_USDC_POOL_KEYS.baseMint)
  console.log(
    'usdc token account to create if not exist: ',
    baseTokenAccount.toBase58()
  )

  const createBaseTokenAccountItx = Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    UXP_USDC_POOL_KEYS.quoteMint,
    baseTokenAccount,
    owner, // owner
    payer // payer
  )

  console.log(
    `Initialize Authority BASE token ATA (${baseTokenAccount.toBase58()}) itx:`,
    serializeInstructionToBase64(createBaseTokenAccountItx)
  )

  const [quoteTokenAccount] = findATAAddrSync(
    owner,
    UXP_USDC_POOL_KEYS.quoteMint
  )
  console.log(
    'usdc token account to create if not exist: ',
    quoteTokenAccount.toBase58()
  )

  const createQuoteTokenAccountItx = Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    UXP_USDC_POOL_KEYS.quoteMint,
    quoteTokenAccount,
    owner, // owner
    payer // payer
  )

  console.log(
    `Initialize Authority QUOTE token ATA (${quoteTokenAccount.toBase58()}) itx:`,
    serializeInstructionToBase64(createQuoteTokenAccountItx)
  )

  let baseAmountIn = amountA
  let quoteAmountIn = amountB
  if (tokenMintA.equals(UXP_USDC_POOL_KEYS.quoteMint)) {
    baseAmountIn = amountB
    quoteAmountIn = amountA
  }

  const itx = Liquidity.makeAddLiquidityInstruction({
    poolKeys: UXP_USDC_POOL_KEYS,
    userKeys: {
      baseTokenAccount,
      quoteTokenAccount,
      lpTokenAccount,
      owner,
    },
    baseAmountIn,
    quoteAmountIn,
    fixedSide,
  })

  return itx
}
