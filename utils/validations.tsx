import { PublicKey } from '@solana/web3.js'
import { ProgramBufferAccount } from '@tools/validators/accounts/upgradeable-program'
import { tryParseKey } from '@tools/validators/pubkey'
import { create } from 'superstruct'
import { GovernedTokenAccount, tryGetTokenAccount } from './tokens'
import * as yup from 'yup'
import {
  getMintNaturalAmountFromDecimal,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'

import type { ConnectionContext } from 'utils/connection'
import {
  AccountInfo,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection } from '@solana/web3.js'
import { BN } from '@project-serum/anchor'

const getValidateAccount = async (
  connection: Connection,
  pubKey: PublicKey
) => {
  const account = await connection.getParsedAccountInfo(pubKey)
  //TODO find way to validate account without sols
  if (!account) {
    throw "Account doesn't exist or has no SOLs"
  }
  return account
}

export const getValidatedPublickKey = (val: string) => {
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
  connection: Connection,
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
  const tokenAccount = await tryGetTokenAccount(connection, ata)
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
  connection: ConnectionContext,
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

export const validateAccount = async (
  connection: ConnectionContext,
  val: string
) => {
  const accountPk = tryParseKey(val)

  if (!accountPk) {
    throw 'Provided value is not a valid account address'
  }

  try {
    const accountInfo = await connection.current.getAccountInfo(accountPk)

    if (!accountInfo) {
      throw "account doesn't exist or has no SOLs"
    }
  } catch (ex) {
    console.error("Can't validate account", ex)
    throw "Can't validate account"
  }
}

export const validateBuffer = async (
  connection: ConnectionContext,
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

export const getFriktionDepositSchema = ({ form }) => {
  const governedTokenAccount = form.governedTokenAccount as GovernedTokenAccount
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source account is required'),
    amount: yup
      .number()
      .typeError('Amount is required')
      .test(
        'amount',
        'Transfer amount must be less than the source account available amount',
        async function (val: number) {
          const isNft = governedTokenAccount?.isNft
          if (isNft) {
            return true
          }
          if (val && !form.governedTokenAccount) {
            return this.createError({
              message: `Please select source account to validate the amount`,
            })
          }
          if (val && governedTokenAccount && governedTokenAccount?.mint) {
            const mintValue = getMintNaturalAmountFromDecimalAsBN(
              val,
              governedTokenAccount?.mint.account.decimals
            )
            return !!(governedTokenAccount?.token?.publicKey &&
            !governedTokenAccount.isSol
              ? governedTokenAccount.token.account.amount.gte(mintValue)
              : new BN(governedTokenAccount.solAccount!.lamports).gte(
                  mintValue
                ))
          }
          return this.createError({
            message: `Amount is required`,
          })
        }
      ),
  })
}

export const getTokenTransferSchema = ({ form, connection }) => {
  const governedTokenAccount = form.governedTokenAccount as GovernedTokenAccount
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source account is required'),
    amount: yup
      .number()
      .typeError('Amount is required')
      .test(
        'amount',
        'Transfer amount must be less than the source account available amount',
        async function (val: number) {
          const isNft = governedTokenAccount?.isNft
          if (isNft) {
            return true
          }
          if (val && !form.governedTokenAccount) {
            return this.createError({
              message: `Please select source account to validate the amount`,
            })
          }
          if (val && governedTokenAccount && governedTokenAccount?.mint) {
            const mintValue = getMintNaturalAmountFromDecimalAsBN(
              val,
              governedTokenAccount?.mint.account.decimals
            )
            return !!(governedTokenAccount?.token?.publicKey &&
            !governedTokenAccount.isSol
              ? governedTokenAccount.token.account.amount.gte(mintValue)
              : new BN(governedTokenAccount.solAccount!.lamports).gte(
                  mintValue
                ))
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
                governedTokenAccount?.token?.account.address.toBase58() == val
              ) {
                return this.createError({
                  message: `Destination account address can't be same as source account`,
                })
              }
              await validateDestinationAccAddress(
                connection,
                val,
                governedTokenAccount?.token?.account.address
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
  })
}

export const getMintSchema = ({ form, connection }) => {
  return yup.object().shape({
    amount: yup
      .number()
      .typeError('Amount is required')
      .test('amount', 'Invalid amount', async function (val: number) {
        if (val && !form.mintAccount) {
          return this.createError({
            message: `Please select mint to validate the amount`,
          })
        }
        if (val && form.mintAccount && form.mintAccount?.mintInfo) {
          const mintValue = getMintNaturalAmountFromDecimal(
            val,
            form.mintAccount?.mintInfo.decimals
          )
          return !!(
            form.mintAccount.governance?.account.governedAccount && mintValue
          )
        }
        return this.createError({
          message: `Amount is required`,
        })
      }),
    destinationAccount: yup
      .string()
      .test(
        'accountTests',
        'Account validation error',
        async function (val: string) {
          if (val) {
            try {
              if (form.mintAccount?.governance) {
                await validateDestinationAccAddressWithMint(
                  connection,
                  val,
                  form.mintAccount.governance.account.governedAccount
                )
              } else {
                return this.createError({
                  message: `Please select mint`,
                })
              }

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
    mintAccount: yup.object().nullable().required('Mint is required'),
  })
}

export const getStakeSchema = ({ form }) => {
  return yup.object().shape({
    amount: yup
      .number()
      .typeError('Amount is required')
      .test('amount', 'Insufficient funds', async function (val: number) {
        if (val && val > 9 * 10 ** 6) {
          return this.createError({
            message: 'Amount is too large',
          })
        }
        if (val && !form.governedTokenAccount) {
          return this.createError({
            message: 'Please pass in a source account to validate the amount',
          })
        }
        if (
          val &&
          form.governedTokenAccount &&
          form.governedTokenAccount?.isSol &&
          form.governedTokenAccount?.mint &&
          form.governedTokenAccount?.solAccount
        ) {
          const mintValue = getMintNaturalAmountFromDecimal(
            val,
            form.governedTokenAccount?.mint.account.decimals
          )
          return !!(
            form.governedTokenAccount.solAccount.owner &&
            form.governedTokenAccount.solAccount.lamports >= new BN(mintValue)
          )
        }
        return this.createError({ message: 'Amount is required' })
      }),
    destinationAccount: yup
      .object()
      .nullable()
      .required('Destination account is required'),
    governedTokenAccount: yup
      .object()
      .nullable()
      .required('Source account is required'),
  })
}
