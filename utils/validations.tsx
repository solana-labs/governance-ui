import { PublicKey } from '@solana/web3.js'
import { TokenAccountInfo } from '@tools/validators/accounts/token'
import { ProgramBufferAccount } from '@tools/validators/accounts/upgradeable-program'
import { tryParseKey } from '@tools/validators/pubkey'
import { create } from 'superstruct'
import { tryGetTokenAccount } from './tokens'
import * as yup from 'yup'
import { getMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { BN } from '@project-serum/anchor'
import { ConnectionContext } from 'stores/useWalletStore'

const getValidateAccount = async (connection, pubKey: PublicKey) => {
  const account = await connection.current.getParsedAccountInfo(pubKey)
  if (!account || !account.value) {
    throw 'Account not found'
  }
  return account
}

const getValidatePublicKey = (val: string) => {
  const pubKey = tryParseKey(val)
  if (pubKey) {
    return pubKey
  } else {
    throw 'Provided value is not a public key'
  }
}

const isValidSplTokenAccount = (account) => {
  if (
    !(
      'parsed' in account.value.data &&
      account.value.data.program === 'spl-token'
    )
  ) {
    throw 'Invalid spl token account'
  }
  return true
}

const getValidateTokenAccount = (account) => {
  try {
    const tokenAccount = create(
      account.value.data.parsed.info,
      TokenAccountInfo
    )
    return tokenAccount
  } catch {
    throw 'Invalid spl token account'
  }
}

const validateIsTokenAccSameMintAsGovernedAcc = async (
  connection,
  tokenAccount: TokenAccountInfo,
  governedAccount: PublicKey
) => {
  const sourceAccMint = await tryGetTokenAccount(
    connection.current,
    governedAccount
  )
  if (
    sourceAccMint &&
    tokenAccount.mint.toBase58() !== sourceAccMint.account.mint.toBase58()
  ) {
    throw "Account mint doesn't match source account"
  } else {
    throw 'Invalid source account'
  }
}

const validateDoseTokenAccountMatchMint = (
  tokenAccount: TokenAccountInfo,
  mint: PublicKey
) => {
  if (tokenAccount.mint.toBase58() !== mint.toBase58()) {
    throw "Account mint doesn't match source account"
  }
}

export const validateDestinationAccAddress = async (
  connection: ConnectionContext,
  val: any,
  governedAccount?: PublicKey
) => {
  const pubKey = getValidatePublicKey(val)
  const account = await getValidateAccount(connection, pubKey)
  isValidSplTokenAccount(account)
  const tokenAccount = getValidateTokenAccount(account)
  if (governedAccount) {
    validateIsTokenAccSameMintAsGovernedAcc(
      connection,
      tokenAccount,
      governedAccount
    )
  } else {
    throw 'Source account not provided'
  }
  return true
}

export const validateDestinationAccAddressWithMint = async (
  connection,
  val: any,
  mintPubKey: PublicKey
) => {
  const pubKey = getValidatePublicKey(val)
  const account = await getValidateAccount(connection, pubKey)
  isValidSplTokenAccount(account)
  const tokenAccount = getValidateTokenAccount(account)
  if (mintPubKey) {
    validateDoseTokenAccountMatchMint(tokenAccount, mintPubKey)
  } else {
    throw 'Source account not provided'
  }
  return true
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

export const getTokenTransferSchema = ({ form, connection }) => {
  return yup.object().shape({
    amount: yup
      .number()
      .typeError('Amount is required')
      .test(
        'amount',
        'Transfer amount must be less than the source account available amount',
        async function (val: number) {
          if (val && !form.governedTokenAccount) {
            return this.createError({
              message: `Please select source account to validate the amount`,
            })
          }
          if (
            val &&
            form.governedTokenAccount &&
            form.governedTokenAccount?.mint
          ) {
            const mintValue = getMintNaturalAmountFromDecimal(
              val,
              form.governedTokenAccount?.mint.account.decimals
            )
            return !!(
              form.governedTokenAccount?.token?.publicKey &&
              form.governedTokenAccount.token.account.amount.gte(
                new BN(mintValue)
              )
            )
          }
          return this.createError({
            message: `Amount is required`,
          })
        }
      ),
    destinationAccount: yup
      .string()
      .test(
        'accountTests',
        'Account validation error',
        async function (val: string) {
          if (val) {
            try {
              if (
                form.governedTokenAccount?.token?.account.address.toBase58() ==
                val
              ) {
                return this.createError({
                  message: `Destination account address can't be same as source account`,
                })
              }
              await validateDestinationAccAddress(
                connection,
                val,
                form.governedTokenAccount?.token?.account.address
              )
              return true
            } catch (e) {
              return this.createError({
                message: `${e}`,
              })
            }
          } else {
            return this.createError({
              message: `Destination account is required`,
            })
          }
        }
      ),
    governedTokenAccount: yup
      .object()
      .nullable()
      .required('Source account is required'),
  })
}
