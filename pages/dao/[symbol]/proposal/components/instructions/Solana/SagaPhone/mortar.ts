import BN from 'bn.js'

import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { Program, AnchorProvider } from '@project-serum/anchor'

import { IDL, Mortar } from './schema'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token } from '@solana/spl-token'

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
)

export const MORTAR_PROGRAM_ID = new PublicKey(
  '781wH11JGQgEoBkBzuc8uoQLtp8KxeHk1yZiS1JhFYKy'
)

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
)

export const USDC_MINT_ID = new PublicKey(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
)

export const USDC_DEVNET = new PublicKey(
  'HykjxVsY6NkdiHNcsENe1uHyesyW55ZYcHvdmsbt1uwK'
)

export const MAINNET_ISSUER = new PublicKey(
  '6GAsF1NumJfPP3mfkTQYnXKRJAevCrhvGvuvvV2xhV3G'
)

export const DEVNET_ISSUER = new PublicKey(
  '8aymYFSYaAW3g85itE5v6tewgNhTKKJpQB94WYD8KcAd'
)

export const getATAKeySync = (mint: PublicKey, owner: PublicKey): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  )[0]
}

export const getIssuerKey = (initializer: PublicKey, nonce: BN): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [initializer.toBuffer(), Buffer.from(nonce.toArray('le', 8))],
    MORTAR_PROGRAM_ID
  )[0]
}

export const getReceiptKey = (
  purchaser: PublicKey,
  issuer: PublicKey
): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [purchaser.toBuffer(), issuer.toBuffer()],
    MORTAR_PROGRAM_ID
  )[0]
}

export const getPurchaseInstructions = (
  feePayer: PublicKey,
  issuer: PublicKey,
  purchaser: PublicKey,
  mint: PublicKey, // issuer.paymentMint
  quantity: BN
): TransactionInstruction[] => {
  const program = new Program<Mortar>(
    IDL,
    MORTAR_PROGRAM_ID,
    new AnchorProvider(null as any, Keypair.generate() as any, {})
  )

  const transactionInstructions: TransactionInstruction[] = []

  const receipt = getReceiptKey(purchaser, issuer)

  const receiptTokens = getATAKeySync(mint, receipt)
  const purchaserTokens = getATAKeySync(mint, purchaser)

  transactionInstructions.push(
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      mint, // mint
      receiptTokens, // ata
      receipt, // owner of token account
      feePayer // fee payer
    )
  )

  transactionInstructions.push(
    program.instruction.purchaseWithPayer({
      accounts: {
        issuer,
        purchaser,
        payer: feePayer,
        receipt,
        receiptTokens,
        purchaserTokens,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    })
  )

  if (!quantity.eq(new BN(1))) {
    transactionInstructions.push(
      program.instruction.updateQuantity(quantity, {
        accounts: {
          issuer,
          purchaser,
          receipt,
          receiptTokens,
          purchaserTokens,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      })
    )
  }

  return transactionInstructions
}
