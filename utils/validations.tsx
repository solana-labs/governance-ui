import { PublicKey } from '@solana/web3.js'
import { TokenAccountInfo } from '@tools/validators/accounts/token'
import { tryParseKey } from '@tools/validators/pubkey'
import { create } from 'superstruct'
import { tryGetTokenAccount } from './tokens'

export const validateDestinationAccAddress = async (
  connection,
  val: any,
  governedAccount?: PublicKey
) => {
  const pubKey = tryParseKey(val)
  if (pubKey) {
    const account = await connection.current.getParsedAccountInfo(pubKey)
    if (!account || !account.value) {
      throw 'account not found'
    }
    if (
      !(
        'parsed' in account.value.data &&
        account.value.data.program === 'spl-token'
      )
    ) {
      throw 'invalid spl token account'
    }

    let tokenAccount

    try {
      tokenAccount = create(account.value.data.parsed.info, TokenAccountInfo)
    } catch {
      throw 'invalid spl token account'
    }

    if (governedAccount) {
      const sourceAccMint = await tryGetTokenAccount(
        connection.current,
        governedAccount
      )
      if (
        tokenAccount.mint.toBase58() !== sourceAccMint?.account.mint.toBase58()
      ) {
        throw "account mint doesn't match source account"
      }
    } else {
      throw 'source account not provided'
    }
  } else {
    throw 'provided value is not a valid account address'
  }
}
