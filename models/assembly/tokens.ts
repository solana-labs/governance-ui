import {
  Account,
  Connection,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  AccountInfo,
  AccountLayout,
  MintInfo,
  Token,
  u64,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

export type TokenAccount = AccountInfo
export type MintAccount = MintInfo
export type ProgramAccount<T> = {
  publicKey: PublicKey
  account: T
}

export async function getOwnedTokenAccounts(
  connection: Connection,
  publicKey: PublicKey
): Promise<ProgramAccount<TokenAccount>[]> {
  const results = await connection.getTokenAccountsByOwner(publicKey, {
    programId: TOKEN_PROGRAM_ID,
  })
  return results.value.map((r) => {
    const publicKey = r.pubkey
    const data = Buffer.from(r.account.data)
    const account = parseTokenAccountData(publicKey, data)
    return { publicKey, account }
  })
}

function parseTokenAccountData(account: PublicKey, data: Buffer): TokenAccount {
  const accountInfo = AccountLayout.decode(data)
  accountInfo.address = account
  accountInfo.mint = new PublicKey(accountInfo.mint)
  accountInfo.owner = new PublicKey(accountInfo.owner)
  accountInfo.amount = u64.fromBuffer(accountInfo.amount)

  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null
    accountInfo.delegatedAmount = new u64(0)
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate)
    accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount)
  }

  accountInfo.isInitialized = accountInfo.state !== 0
  accountInfo.isFrozen = accountInfo.state === 2

  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative)
    accountInfo.isNative = true
  } else {
    accountInfo.rentExemptReserve = null
    accountInfo.isNative = false
  }

  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority)
  }

  return accountInfo
}

export function approveTokenTransfer(
  instructions: TransactionInstruction[],
  cleanupInstructions: TransactionInstruction[],
  account: PublicKey,
  owner: PublicKey,
  amount: number | u64,
  autoRevoke = true,

  // if delegate is not passed ephemeral transfer authority is used
  delegate?: PublicKey,
  existingTransferAuthority?: Account
): Account {
  const tokenProgram = TOKEN_PROGRAM_ID
  const transferAuthority = existingTransferAuthority || new Account()

  // Coerce amount to u64 in case it's deserialized as BN which differs by buffer conversion functions only
  // Without the coercion createApproveInstruction would fail because it won't be able to serialize it
  if (typeof amount !== 'number') {
    amount = new u64(amount.toArray())
  }

  instructions.push(
    Token.createApproveInstruction(
      tokenProgram,
      account,
      delegate ?? transferAuthority.publicKey,
      owner,
      [],
      amount
    )
  )

  if (autoRevoke) {
    cleanupInstructions.push(
      Token.createRevokeInstruction(tokenProgram, account, owner, [])
    )
  }

  return transferAuthority
}
