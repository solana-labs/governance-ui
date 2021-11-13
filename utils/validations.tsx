import { PublicKey } from '@solana/web3.js'
import { TokenAccountInfo } from '@tools/validators/accounts/token'
import { ProgramBufferAccount } from '@tools/validators/accounts/upgradeable-program'
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

    let tokenAccount

    try {
      tokenAccount = create(account.value.data.parsed.info, TokenAccountInfo)
    } catch {
      throw 'Invalid spl token account'
    }

    if (governedAccount) {
      const sourceAccMint = await tryGetTokenAccount(
        connection.current,
        governedAccount
      )
      if (
        tokenAccount.mint.toBase58() !== sourceAccMint?.account.mint.toBase58()
      ) {
        throw "Account mint doesn't match source account"
      }
    } else {
      throw 'Source account not provided'
    }
  } else {
    throw 'Provided value is not a valid account address'
  }
}

export const validateBuffer = async (
  connection,
  val: string,
  governedAccount?: PublicKey
) => {
  const pubKey = tryParseKey(val)
  if (!governedAccount) {
    throw 'Program governed account not selected'
  }
  if (pubKey) {
    await connection.current.getParsedAccountInfo(pubKey).then((data) => {
      if (!data || !data.value) {
        throw 'Account not found'
      }
      const info = data.value
      if (
        !(
          'parsed' in info.data &&
          info.data.program === 'bpf-upgradeable-loader'
        )
      ) {
        throw 'Invalid program buffer account'
      }

      let buffer: ProgramBufferAccount

      try {
        buffer = create(info.data.parsed, ProgramBufferAccount)
      } catch {
        throw 'Invalid program buffer account'
      }

      if (buffer.info.authority?.toBase58() !== governedAccount.toBase58()) {
        throw `Buffer authority must be set to governance account 
              ${governedAccount.toBase58()}`
      }
    })
  } else {
    throw 'Provided value is not a valid account address'
  }
}
