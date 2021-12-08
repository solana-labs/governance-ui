import { AccountLayout, MintLayout, Token } from '@solana/spl-token'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT } from '../utils/ids'
import { cache, TokenAccountParser } from '../contexts/accounts'

////////////////////////////////////////////////
export function createUninitializedMint(
  instructions: TransactionInstruction[],
  payer: PublicKey,
  amount: number,
  signers: Keypair[]
) {
  const account = new Keypair()
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: account.publicKey,
      lamports: amount,
      space: MintLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  )

  signers.push(account)

  return account.publicKey
}

//////////////////////////////////////////////////////
export function createUninitializedAccount(
  instructions: TransactionInstruction[],
  payer: PublicKey,
  amount: number,
  signers: Keypair[]
) {
  const account = new Keypair()
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: account.publicKey,
      lamports: amount,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    })
  )

  signers.push(account)

  return account.publicKey
}

/////////////////////////////////////
export function createMint(
  instructions: TransactionInstruction[],
  payer: PublicKey,
  mintRentExempt: number,
  decimals: number,
  owner: PublicKey,
  freezeAuthority: PublicKey,
  signers: Keypair[]
) {
  const account = createUninitializedMint(
    instructions,
    payer,
    mintRentExempt,
    signers
  )

  instructions.push(
    Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      account,
      decimals,
      owner,
      freezeAuthority
    )
  )

  return account
}

///////////////////////////////////////////////
export function createTokenAccount(
  instructions: TransactionInstruction[],
  payer: PublicKey,
  accountRentExempt: number,
  mint: PublicKey,
  owner: PublicKey,
  signers: Keypair[]
) {
  const account = createUninitializedAccount(
    instructions,
    payer,
    accountRentExempt,
    signers
  )

  instructions.push(
    Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, mint, account, owner)
  )

  return account
}

// // TODO: check if one of to accounts needs to be native sol ... if yes unwrap it ...
// export function findOrCreateAccountByMint(
//   payer: PublicKey,
//   owner: PublicKey,
//   instructions: TransactionInstruction[],
//   cleanupInstructions: TransactionInstruction[],
//   accountRentExempt: number,
//   mint: PublicKey, // use to identify same type
//   signers: Keypair[],
//   excluded?: Set<string>
// ): PublicKey {
//   const accountToFind = mint.toBase58()
//   const account = cache
//     .byParser(TokenAccountParser)
//     .map((id) => cache.get(id))
//     .find(
//       (acc) =>
//         acc !== undefined &&
//         acc.info.mint.toBase58() === accountToFind &&
//         acc.info.owner.toBase58() === owner.toBase58() &&
//         (excluded === undefined || !excluded.has(acc.pubkey.toBase58()))
//     )
//   const isWrappedSol = accountToFind === WRAPPED_SOL_MINT.toBase58()

//   let toAccount: PublicKey
//   if (account && !isWrappedSol) {
//     toAccount = account.pubkey
//   } else {
//     // creating depositor pool account
//     toAccount = createTokenAccount(
//       instructions,
//       payer,
//       accountRentExempt,
//       mint,
//       owner,
//       signers
//     )

//     if (isWrappedSol) {
//       cleanupInstructions.push(
//         Token.createCloseAccountInstruction(
//           TOKEN_PROGRAM_ID,
//           toAccount,
//           payer,
//           payer,
//           []
//         )
//       )
//     }
//   }

//   return toAccount
// }
