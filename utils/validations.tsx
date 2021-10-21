import { PublicKey } from '@solana/web3.js'
import { TokenAccountInfo } from '@tools/validators/accounts/token'
import { tryParseKey } from '@tools/validators/pubkey'
import { create } from 'superstruct'
import { tryGetTokenAccount } from './tokens'

export const validateDestinationAccAdress = async (
  connection,
  val: any,
  governedAccount?: PublicKey
) => {
  const pubKey = tryParseKey(val)
  if (pubKey) {
    const account = await connection.current.getParsedAccountInfo(pubKey)
    if (!account || !account.value) {
      throw 'Account not found'
    }
    if (
      !(
        'parsed' in account.value.data &&
        account.value.data.program === 'spl-token'
      )
    ) {
      throw 'Invalid spl token account'
    }
    try {
      const tokenAccount = create(
        account.value.data.parsed.info,
        TokenAccountInfo
      )
      if (governedAccount) {
        const sourceAccMint = await tryGetTokenAccount(
          connection.current,
          governedAccount
        )
        if (
          tokenAccount.mint.toBase58() !==
          sourceAccMint?.account.mint.toBase58()
        ) {
          throw "Account mint doesn't match source account"
        }
      } else {
        throw 'Source account not provided'
      }
    } catch {
      throw 'Invalid spl token account'
    }
  } else {
    throw 'Provided value is not a valid account address'
  }
}
