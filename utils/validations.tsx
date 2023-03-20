import { PublicKey } from '@solana/web3.js'
import { ProgramBufferAccount } from '@tools/validators/accounts/upgradeable-program'
import { tryParseKey } from '@tools/validators/pubkey'
import { create } from 'superstruct'
import { tryGetTokenAccount } from './tokens'
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
  MintInfo,
} from '@solana/spl-token'
import { Connection } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import {
  nftPluginsPks,
  vsrPluginsPks,
  gatewayPluginsPks,
} from '@hooks/useVotingPlugins'
import { AssetAccount } from '@utils/uiTypes/assets'
import { validatePubkey } from './formValidation'

// Plugins supported by Realms
const supportedPlugins = [
  ...nftPluginsPks,
  ...vsrPluginsPks,
  ...gatewayPluginsPks,
]

export const getValidateAccount = async (
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

export const validateDoseTokenAccountMatchMint = (
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
    owner, // owner
    true
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
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source account is required'),
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
            governedTokenAccount &&
            governedTokenAccount.extensions.mint
          ) {
            const mintValue = getMintNaturalAmountFromDecimalAsBN(
              val,
              governedTokenAccount?.extensions.mint.account.decimals
            )
            return !!(governedTokenAccount?.extensions.token?.publicKey &&
            !governedTokenAccount.isSol
              ? governedTokenAccount.extensions.token.account.amount.gte(
                  mintValue
                )
              : new BN(
                  governedTokenAccount.extensions.solAccount!.lamports
                ).gte(mintValue))
          }
          return this.createError({
            message: `Amount is required`,
          })
        }
      ),
  })
}

export const getCastleDepositSchema = ({ form }) => {
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
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
          if (
            val &&
            governedTokenAccount &&
            governedTokenAccount?.extensions.mint
          ) {
            const mintValue = getMintNaturalAmountFromDecimalAsBN(
              val,
              governedTokenAccount?.extensions.mint.account.decimals
            )
            return !!(governedTokenAccount?.extensions.token?.publicKey &&
            !governedTokenAccount.isSol
              ? governedTokenAccount.extensions.token.account.amount.gte(
                  mintValue
                )
              : new BN(
                  governedTokenAccount.extensions.solAccount!.lamports
                ).gte(mintValue))
          }
          return this.createError({
            message: `Amount is required`,
          })
        }
      ),
  })
}

export const getCastleWithdrawSchema = () => {
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source account is required'),
    amount: yup.number().typeError('Amount is required'),
  })
}

export const getMeanCreateAccountSchema = ({ form }) => {
  const governedTokenAccount = form.governedTokenAccount as
    | AssetAccount
    | undefined

  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source of funds is required'),
    label: yup.string().required('Name is required'),
    amount: yup
      .number()
      .typeError('Amount is required')
      .test(
        'amount',
        'Transfer amount must be less than the source of funds available amount',
        async function (val: number) {
          if (val && !form.governedTokenAccount) {
            return this.createError({
              message: `Please select source of funds to validate the amount`,
            })
          }
          if (
            val &&
            governedTokenAccount &&
            governedTokenAccount.extensions.mint
          ) {
            const mintValue = getMintNaturalAmountFromDecimalAsBN(
              val,
              governedTokenAccount?.extensions.mint.account.decimals
            )
            return !!(governedTokenAccount?.extensions.token?.publicKey &&
            !governedTokenAccount.isSol
              ? governedTokenAccount.extensions.token.account.amount.gte(
                  mintValue
                )
              : new BN(
                  governedTokenAccount.extensions.solAccount!.lamports
                ).gte(mintValue))
          }
          return this.createError({
            message: `Amount is required`,
          })
        }
      ),
  })
}

export const getMeanFundAccountSchema = ({ form }) => {
  const governedTokenAccount = form.governedTokenAccount as
    | AssetAccount
    | undefined

  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source of funds is required'),
    treasury: yup
      .object()
      .required('Streaming account destination is required'),
    amount: yup
      .number()
      .typeError('Amount is required')
      .test(
        'amount',
        'Transfer amount must be less than the source of funds available amount',
        async function (val: number) {
          if (val && !form.governedTokenAccount) {
            return this.createError({
              message: `Please select source of funds to validate the amount`,
            })
          }
          if (
            val &&
            governedTokenAccount &&
            governedTokenAccount.extensions.mint
          ) {
            const mintValue = getMintNaturalAmountFromDecimalAsBN(
              val,
              governedTokenAccount?.extensions.mint.account.decimals
            )
            return !!(governedTokenAccount?.extensions.token?.publicKey &&
            !governedTokenAccount.isSol
              ? governedTokenAccount.extensions.token.account.amount.gte(
                  mintValue
                )
              : new BN(
                  governedTokenAccount.extensions.solAccount!.lamports
                ).gte(mintValue))
          }
          return this.createError({
            message: `Amount is required`,
          })
        }
      ),
  })
}
export const getMeanWithdrawFromAccountSchema = ({
  form,
  connection,
  mintInfo,
}: {
  form: any
  connection: ConnectionContext
  mintInfo?: MintInfo
}) => {
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Governance is required'),
    treasury: yup.object().required('Streaming account source is required'),

    destination: yup
      .string()
      .test(
        'destination',
        'Account validation error',
        async function (val: string) {
          if (val) {
            try {
              if (form.treasury?.id.toString() == val) {
                return this.createError({
                  message: `Destination account address can't be same as source account`,
                })
              }
              await validateDestinationAccAddress(
                connection,
                val,
                new PublicKey(form.treasury?.id)
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
    amount: yup
      .number()
      .typeError('Amount is required')
      .test(
        'amount',
        'Transfer amount must be less than the source of funds available amount',
        async function (val: number) {
          if (val && !form.treasury) {
            return this.createError({
              message: `Please select source of funds to validate the amount`,
            })
          }
          if (val && form.treasury && mintInfo) {
            const mintValue = getMintNaturalAmountFromDecimalAsBN(
              val,
              mintInfo.decimals
            )
            return new BN(form.treasury.balance).gte(mintValue)
          }
          return this.createError({
            message: `Amount is required`,
          })
        }
      ),
  })
}

export const getMeanCreateStreamSchema = ({
  form,
  connection,
  mintInfo,
}: {
  form: any
  connection: ConnectionContext
  mintInfo?: MintInfo
}) => {
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Governance is required'),
    treasury: yup.object().required('Streaming account source is required'),
    streamName: yup.string().required('Stream name is required'),
    destination: yup
      .string()
      .test(
        'destination',
        'Account validation error',
        async function (val: string) {
          if (val) {
            try {
              if (form.treasury?.id.toString() == val) {
                return this.createError({
                  message: `Destination account address can't be same as source account`,
                })
              }
              await validateDestinationAccAddress(
                connection,
                val,
                new PublicKey(form.treasury?.id)
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
    allocationAssigned: yup
      .number()
      .typeError('Amount is required')
      .test(
        'amount',
        'Transfer amount must be less than the source of funds available amount',
        async function (val: number) {
          if (val && !form.treasury) {
            return this.createError({
              message: `Please select source of funds to validate the amount`,
            })
          }
          if (val && form.treasury && mintInfo) {
            const mintValue = getMintNaturalAmountFromDecimalAsBN(
              val,
              mintInfo.decimals
            )
            return new BN(form.treasury.balance).gte(mintValue)
          }
          return this.createError({
            message: `Amount is required`,
          })
        }
      ),
    rateAmount: yup.number().required('Rate amount is required'),
  })
}

export const getMeanTransferStreamSchema = () => {
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Governance is required'),
    stream: yup.object().required('Stream source is required'),
    destination: yup.string().required('New stream owner is required'),
  })
}

export const getFriktionWithdrawSchema = () => {
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source account is required'),
    amount: yup.number().typeError('Amount is required'),
  })
}

export const getDualFinanceGovernanceAirdropSchema = () => {
  return yup.object().shape({
    amountPerVoter: yup.number().typeError('Amount per voter is required'),
    eligibilityStart: yup.number().typeError('Eligibility start is required'),
    eligibilityEnd: yup.number().typeError('Eligibility end is required'),
    treasury: yup.object().typeError('Treasury is required'),
    amount: yup.number().typeError('Amount is required'),
  })
}

export const getDualFinanceMerkleAirdropSchema = () => {
  return yup.object().shape({
    root: yup
      .string()
      .required('Root is required')
      .test(
        'destination',
        'Account validation error',
        async function (val: string) {
          if (val) {
            try {
              const arr = Uint8Array.from(Buffer.from(val, 'hex'))
              if (arr.length !== 32) {
                return this.createError({
                  message: 'Expected 32 bytes',
                })
              }
              return true
            } catch (e) {
              console.log(e)
            }
            try {
              const root = val.split(',').map(function (item) {
                return parseInt(item, 10)
              })
              if (root.length !== 32) {
                return this.createError({
                  message: 'Expected 32 bytes',
                })
              }
              for (const byte of root) {
                if (byte < 0 || byte >= 256) {
                  return this.createError({
                    message: 'Invalid byte',
                  })
                }
              }
              return true
            } catch (e) {
              console.log(e)
            }
            return this.createError({
              message: `Could not parse`,
            })
          } else {
            return this.createError({
              message: `Root is required`,
            })
          }
        }
      ),
    treasury: yup.object().typeError('Treasury is required'),
    amount: yup.number().typeError('Amount is required'),
  })
}

export const getDualFinanceLiquidityStakingOptionSchema = () => {
  return yup.object().shape({
    userPk: yup.string().required('User pk is required'),
    optionExpirationUnixSeconds: yup
      .number()
      .typeError('Expiration is required'),
    numTokens: yup.number().typeError('Num tokens is required'),
    strikes: yup.string().typeError('Strikes is required'),
    lotSize: yup.number().typeError('lotSize is required'),
    baseTreasury: yup.object().typeError('baseTreasury is required'),
    quoteTreasury: yup.object().typeError('quoteTreasury is required'),
    payer: yup.object().typeError('payer is required'),
  })
}

export const getDualFinanceStakingOptionSchema = () => {
  return yup.object().shape({
    soName: yup.string().required('Staking option name is required'),
    userPk: yup.string().required('User pk is required'),
    optionExpirationUnixSeconds: yup
      .number()
      .typeError('Expiration is required'),
    numTokens: yup.number().typeError('Num tokens is required'),
    strike: yup.number().typeError('Strike is required'),
    lotSize: yup.number().typeError('lotSize is required'),
    baseTreasury: yup.object().typeError('baseTreasury is required'),
    quoteTreasury: yup.object().typeError('quoteTreasury is required'),
    payer: yup.object().typeError('payer is required'),
  })
}

export const getDualFinanceExerciseSchema = () => {
  return yup.object().shape({
    soName: yup.string().required('Staking option name is required'),
    optionAccount: yup.object().required('Option account is required'),
    numTokens: yup.number().typeError('Num tokens is required'),
    baseTreasury: yup.object().typeError('baseTreasury is required'),
    quoteTreasury: yup.object().typeError('quoteTreasury is required'),
  })
}

export const getDualFinanceWithdrawSchema = () => {
  return yup.object().shape({
    soName: yup.string().required('Staking option name is required'),
    baseTreasury: yup.object().typeError('baseTreasury is required'),
    mintPk: yup
      .string()
      .test('is-valid-address1', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
  })
}

export const getGoblinGoldDepositSchema = ({ form }) => {
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source account is required'),
    goblinGoldVaultId: yup.string().required('Vault ID is required'),
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
            governedTokenAccount &&
            governedTokenAccount.extensions.mint
          ) {
            const mintValue = getMintNaturalAmountFromDecimalAsBN(
              val,
              governedTokenAccount?.extensions.mint.account.decimals
            )
            return !!(governedTokenAccount?.extensions.token?.publicKey &&
            !governedTokenAccount.isSol
              ? governedTokenAccount.extensions.token.account.amount.gte(
                  mintValue
                )
              : new BN(
                  governedTokenAccount.extensions.solAccount!.lamports
                ).gte(mintValue))
          }
          return this.createError({
            message: `Amount is required`,
          })
        }
      ),
  })
}

export const getGoblinGoldWithdrawSchema = () => {
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source account is required'),
    goblinGoldVaultId: yup.string().required('Vault ID is required'),
    amount: yup.number().typeError('Amount is required'),
  })
}

export const getFriktionClaimPendingDepositSchema = () => {
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source account is required'),
  })
}

export const getFriktionClaimPendingWithdrawSchema = () => {
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source account is required'),
  })
}

export const getTokenTransferSchema = ({
  form,
  connection,
  tokenAmount,
  mintDecimals,
  nftMode,
}: {
  form: any
  connection: ConnectionContext
  tokenAmount?: BN
  mintDecimals?: number
  nftMode?: boolean
}) => {
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  return yup.object().shape({
    governedTokenAccount: yup.object().required('Source account is required'),
    amount: yup
      .number()
      .typeError('Amount is required')
      .test(
        'amount',
        'Transfer amount must be less than the source account available amount',
        async function (val: number) {
          const isNft = nftMode || governedTokenAccount?.isNft
          if (isNft) {
            return true
          }
          if (val && !form.governedTokenAccount) {
            return this.createError({
              message: `Please select source account to validate the amount`,
            })
          }
          if (
            val &&
            governedTokenAccount &&
            governedTokenAccount?.extensions.mint
          ) {
            const mintValue = getMintNaturalAmountFromDecimalAsBN(
              val,
              typeof mintDecimals !== 'undefined'
                ? mintDecimals
                : governedTokenAccount?.extensions.mint.account.decimals
            )
            if (tokenAmount) {
              return tokenAmount.gte(mintValue)
            }
            return !!(governedTokenAccount?.extensions.token?.publicKey &&
            !governedTokenAccount.isSol
              ? governedTokenAccount.extensions.token.account.amount.gte(
                  mintValue
                )
              : new BN(
                  governedTokenAccount.extensions.solAccount!.lamports
                ).gte(mintValue))
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
                governedTokenAccount?.extensions?.transferAddress?.toBase58() ==
                val
              ) {
                return this.createError({
                  message: `Destination account address can't be same as source account`,
                })
              }
              await validateDestinationAccAddress(
                connection,
                val,
                governedTokenAccount?.extensions.transferAddress
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
        if (val && form.mintAccount && form.mintAccount?.extensions.mint) {
          const mintValue = getMintNaturalAmountFromDecimal(
            val,
            form.mintAccount?.extensions.mint.account.decimals
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
              message: `Invalid destination account`,
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
          form.governedTokenAccount?.extensions.mint &&
          form.governedTokenAccount?.extensions.solAccount
        ) {
          const mintValue = getMintNaturalAmountFromDecimal(
            val,
            form.governedTokenAccount?.extensions.mint.account.decimals
          )
          return !!(
            form.governedTokenAccount.extensions.solAccount.owner &&
            form.governedTokenAccount.extensions.solAccount.lamports >=
              new BN(mintValue)
          )
        }
        return this.createError({ message: 'Amount is required' })
      }),
    governedTokenAccount: yup
      .object()
      .nullable()
      .required('Source account is required'),
  })
}

// @asktree: It's odd that `form` would be an input both to the schema factory and the schema itself.
export const getRealmCfgSchema = ({
  form,
  programVersion,
}: {
  form: any
  programVersion: number
}) => {
  return programVersion >= 3
    ? yup.object().shape({
        governedAccount: yup
          .object()
          .nullable()
          .required('Governed account is required'),
        minCommunityTokensToCreateGovernance: yup
          .number()
          .required('Min community tokens to create governance is required'),
        communityVoterWeightAddin: yup
          .string()
          .test(
            'communityVoterWeightAddinTest',
            'communityVoterWeightAddin validation error',
            function (val: string) {
              if (!form?.communityVoterWeightAddin) {
                return true
              }
              if (val) {
                try {
                  getValidatedPublickKey(val)
                  if (supportedPlugins.includes(val)) {
                    return true
                  } else {
                    return this.createError({
                      message: `Provided pubkey is not a known plugin pubkey`,
                    })
                  }
                } catch (e) {
                  console.log(e)
                  return this.createError({
                    message: `${e}`,
                  })
                }
              } else {
                return this.createError({
                  message: `communityVoterWeightAddin is required`,
                })
              }
            }
          ),
        maxCommunityVoterWeightAddin: yup
          .string()
          .test(
            'maxCommunityVoterWeightAddin',
            'maxCommunityVoterWeightAddin validation error',
            function (val: string) {
              if (!form?.maxCommunityVoterWeightAddin) {
                return true
              }
              if (val) {
                try {
                  getValidatedPublickKey(val)
                  if ([...nftPluginsPks].includes(val)) {
                    return true
                  } else {
                    return this.createError({
                      message: `Provided pubkey is not a known plugin pubkey`,
                    })
                  }
                } catch (e) {
                  console.log(e)
                  return this.createError({
                    message: `${e}`,
                  })
                }
              } else {
                return this.createError({
                  message: `maxCommunityVoterWeightAddin is required`,
                })
              }
            }
          ),
        councilVoterWeightAddin: yup
          .string()
          .test(
            'councilVoterWeightAddinTest',
            'councilVoterWeightAddin validation error',
            function (val: string) {
              if (!form?.councilVoterWeightAddin) {
                return true
              }
              if (val) {
                try {
                  getValidatedPublickKey(val)
                  if (supportedPlugins.includes(val)) {
                    return true
                  } else {
                    return this.createError({
                      message: `Provided pubkey is not a known plugin pubkey`,
                    })
                  }
                } catch (e) {
                  console.log(e)
                  return this.createError({
                    message: `${e}`,
                  })
                }
              } else {
                return this.createError({
                  message: `councilVoterWeightAddin is required`,
                })
              }
            }
          ),
        maxCouncilVoterWeightAddin: yup
          .string()
          .test(
            'maxCouncilVoterWeightAddin',
            'maxCouncilVoterWeightAddin validation error',
            function (val: string) {
              if (!form?.maxCouncilVoterWeightAddin) {
                return true
              }
              if (val) {
                try {
                  getValidatedPublickKey(val)
                  if ([...nftPluginsPks].includes(val)) {
                    return true
                  } else {
                    return this.createError({
                      message: `Provided pubkey is not a known plugin pubkey`,
                    })
                  }
                } catch (e) {
                  console.log(e)
                  return this.createError({
                    message: `${e}`,
                  })
                }
              } else {
                return this.createError({
                  message: `maxCouncilVoterWeightAddin is required`,
                })
              }
            }
          ),
      })
    : yup.object().shape({
        governedAccount: yup
          .object()
          .nullable()
          .required('Governed account is required'),
        minCommunityTokensToCreateGovernance: yup
          .number()
          .required('Min community tokens to create governance is required'),
        communityVoterWeightAddin: yup
          .string()
          .test(
            'communityVoterWeightAddinTest',
            'communityVoterWeightAddin validation error',
            function (val: string) {
              if (!form?.communityVoterWeightAddin) {
                return true
              }
              if (val) {
                try {
                  getValidatedPublickKey(val)
                  if (supportedPlugins.includes(val)) {
                    return true
                  } else {
                    return this.createError({
                      message: `Provided pubkey is not a known plugin pubkey`,
                    })
                  }
                } catch (e) {
                  console.log(e)
                  return this.createError({
                    message: `${e}`,
                  })
                }
              } else {
                return this.createError({
                  message: `communityVoterWeightAddin is required`,
                })
              }
            }
          ),
        maxCommunityVoterWeightAddin: yup
          .string()
          .test(
            'maxCommunityVoterWeightAddin',
            'maxCommunityVoterWeightAddin validation error',
            function (val: string) {
              if (!form?.maxCommunityVoterWeightAddin) {
                return true
              }
              if (val) {
                try {
                  getValidatedPublickKey(val)
                  if ([...nftPluginsPks].includes(val)) {
                    return true
                  } else {
                    return this.createError({
                      message: `Provided pubkey is not a known plugin pubkey`,
                    })
                  }
                } catch (e) {
                  console.log(e)
                  return this.createError({
                    message: `${e}`,
                  })
                }
              } else {
                return this.createError({
                  message: `maxCommunityVoterWeightAddin is required`,
                })
              }
            }
          ),
      })
}

export const getCreateTokenMetadataSchema = () => {
  return yup.object().shape({
    name: yup.string().required('Name is required'),
    symbol: yup.string().required('Symbol is required'),
    uri: yup.string().required('URI is required'),
    mintAccount: yup.object().nullable().required('Mint is required'),
  })
}

export const getUpdateTokenMetadataSchema = () => {
  return yup.object().shape({
    name: yup.string().required('Name is required'),
    symbol: yup.string().required('Symbol is required'),
    uri: yup.string().required('URI is required'),
    mintAccount: yup.object().nullable().required('Mint is required'),
  })
}
