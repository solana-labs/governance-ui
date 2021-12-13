import { PublicKey } from '@solana/web3.js'
import { ProgramBufferAccount } from '@tools/validators/accounts/upgradeable-program'
import { tryParseKey } from '@tools/validators/pubkey'
import { create } from 'superstruct'
import { tryGetTokenAccount } from './tokens'
import * as yup from 'yup'
import { getMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { BN } from '@project-serum/anchor'
import { ConnectionContext } from 'stores/useWalletStore'
import {
  AccountInfo,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection } from '@solana/web3.js'

const getValidateAccount = async (
  connection: Connection,
  pubKey: PublicKey
) => {
  const account = await connection.getParsedAccountInfo(pubKey)
  if (!account || !account.value) {
    throw "Account doesn't exist or has no SOLs"
  }
  return account
}

const getValidatedPublickKey = (val: string) => {
  const pubKey = tryParseKey(val)
  if (pubKey) {
    return pubKey
  } else {
    throw 'Provided value is not a public key'
  }
}

const validateDoseTokenAccountMatchMint = (
  tokenAccount: AccountInfo,
  mint: PublicKey
) => {
  if (tokenAccount.mint.toBase58() !== mint.toBase58()) {
    throw "Account mint doesn't match source account"
  }
}

export const tryGetAta = async (
  connection: ConnectionContext,
  mint: PublicKey,
  owner: PublicKey
) => {
  //we do ATA validation
  const ata = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
    TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
    mint, // mint
    owner // owner
  )
  const tokenAccount = await tryGetTokenAccount(connection.current, ata)
  return tokenAccount
}

export const isExistingTokenAccount = async (
  connection: ConnectionContext,
  val: PublicKey
) => {
  const account = await getValidateAccount(connection.current, val)
  const isExistingTokenAccount =
    account.value !== null &&
    (await tryGetTokenAccount(connection.current, val))
  return isExistingTokenAccount
}

export const validateDestinationAccAddress = async (
  connection: ConnectionContext,
  val: any,
  governedAccount?: PublicKey
) => {
  const currentConnection = connection.current
  const pubKey = getValidatedPublickKey(val)
  const account = await getValidateAccount(currentConnection, pubKey)
  if (account?.value !== null) {
    if (!governedAccount) {
      throw 'Source account not provided'
    }
    const tokenAccount = await tryGetTokenAccount(currentConnection, pubKey)
    const governedTokenAccount = await tryGetTokenAccount(
      currentConnection,
      governedAccount
    )
    if (tokenAccount && governedTokenAccount) {
      await validateDoseTokenAccountMatchMint(
        tokenAccount.account,
        governedTokenAccount?.account.mint
      )
    }
  }

  return true
}

export const validateDestinationAccAddressWithMint = async (
  connection,
  val: any,
  mintPubKey: PublicKey
) => {
  const currentConnection = connection.current
  const pubKey = getValidatedPublickKey(val)
  const account = await getValidateAccount(currentConnection, pubKey)
  if (account?.value !== null) {
    if (!mintPubKey) {
      throw 'Source account not provided'
    }
    const tokenAccount = await tryGetTokenAccount(currentConnection, pubKey)
    if (tokenAccount && mintPubKey) {
      await validateDoseTokenAccountMatchMint(tokenAccount.account, mintPubKey)
    }
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
        throw "account doesn't exist or has no SOLs"
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
              console.log(e)
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
