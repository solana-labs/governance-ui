import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useRealm from '@hooks/useRealm'
import { AccountInfo, Token } from '@solana/spl-token'
import {
  formatMintNaturalAmountAsDecimal,
  getMintMinAmountAsDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { serializeInstructionToBase64 } from '@models/serialisation'
import { precision } from '@utils/formatting'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { TokenAccountInfo } from '@tools/validators/accounts/token'
import { tryParseKey } from '@tools/validators/pubkey'
import useWalletStore from 'stores/useWalletStore'
import { ProgramAccount, tryGetTokenAccount } from '@utils/tokens'
import {
  SplTokenTransferForm,
  Instruction,
  SplTokenTransferRef,
} from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { TOKEN_PROGRAM_ID } from '@utils/tokens'
import DryRunInstructionBtn from '../DryRunInstructionBtn'
import { create } from 'superstruct'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { debounce } from '@utils/debounce'

const SplTokenTransfer = forwardRef<SplTokenTransferRef>((props, ref) => {
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo, governedTokenAccounts } = useRealm()
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SplTokenTransferForm>({
    destinationAccount: '',
    amount: 1,
    governance: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
  })
  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<ProgramAccount<AccountInfo> | null>(null)
  const [formErrors, setFormErrors] = useState({})
  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const schema = yup.object().shape({
    amount: yup
      .number()
      .required('Amount is required')
      .min(mintMinAmount, `Minimal value for amount is ${mintMinAmount}`)
      .test(
        'amount',
        'The quantity must be less than the available tokens in the source account',
        async (val) => {
          if (form.governance) {
            return !!(
              form.governance.token.publicKey &&
              val &&
              val <=
                parseFloat(
                  formatMintNaturalAmountAsDecimal(
                    form.governance.mintInfo.account,
                    form.governance.token.account.amount
                  )
                )
            )
          }
          return false
        }
      ),
    destinationAccount: yup
      .string()
      .required('Destination account is required')
      .test(
        'accountTests',
        'Account validation error',
        async function (val: string) {
          if (val) {
            const pubKey = tryParseKey(val)
            if (pubKey) {
              const account = await connection.current.getParsedAccountInfo(
                pubKey
              )
              if (!account || !account.value) {
                return this.createError({
                  message: 'Account not found',
                })
              }
              if (
                !(
                  'parsed' in account.value.data &&
                  account.value.data.program === 'spl-token'
                )
              ) {
                return this.createError({
                  message: 'Invalid spl token account',
                })
              }
              try {
                const governedAccount = form.governance?.token?.account.address
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
                    return this.createError({
                      message: "Account mint doesn't match source account",
                    })
                  }
                } else {
                  return this.createError({
                    message: 'Source account not provided',
                  })
                }
              } catch {
                return this.createError({
                  message: 'Invalid spl token account',
                })
              }
            } else {
              return this.createError({
                message: 'Provided value is not a valid account address',
              })
            }
            return true
          }
          return false
        }
      ),
    governance: yup.object().nullable().required('Source account is required'),
  })
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setMintInfo = (value) => {
    setForm({ ...form, mintInfo: value })
  }
  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }
  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }
  const validateInstruction = async () => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getSerializedInstruction() {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governance?.token?.publicKey &&
      form.mintInfo
    ) {
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount,
        form.mintInfo?.decimals
      )
      const transferIx = Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        form.governance.token?.account.address,
        new PublicKey(form.destinationAccount),
        form.governance.token?.publicKey,
        [],
        mintAmount
      )
      serializedInstruction = serializeInstructionToBase64(transferIx)
    }
    const obj: Instruction = {
      serializedInstruction,
      isValid,
      governance: form.governance,
    }
    return obj
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])
  useEffect(() => {
    setMintInfo(form.governance?.mintInfo?.account)
  }, [form.governance?.token?.publicKey])
  useImperativeHandle(ref, () => ({
    getSerializedInstruction,
  }))
  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount)
        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey)
          setDestinationAccount(account ? account : null)
        } else {
          setDestinationAccount(null)
        }
      })
    } else {
      setDestinationAccount(null)
    }
  }, [form.destinationAccount])
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  return (
    <div className="mt-5">
      <Select
        prefix="Source Account"
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'governance' })
        }
        value={form.governance?.token.account?.address?.toString()}
        error={formErrors['governance']}
      >
        {governedTokenAccounts.map((acc) => {
          const govAccount = acc.token.publicKey.toString()
          const adressAsString = acc.token.account.address.toString()
          const tokenName = getMintMetadata(acc.token.account.mint)?.name
          const accName = getAccountName(acc.token.publicKey)
          const label = accName
            ? `${accName}: ${adressAsString}`
            : adressAsString
          return (
            <Select.Option key={govAccount} value={acc}>
              <span>{label}</span>
              {tokenName && <div>Token Name: {tokenName}</div>}
              <div>
                Amount:
                {parseFloat(
                  formatMintNaturalAmountAsDecimal(
                    acc.mintInfo.account,
                    acc.token?.account.amount
                  )
                )}
              </div>
            </Select.Option>
          )
        })}
      </Select>
      <Input
        prefix="Destination account"
        value={form.destinationAccount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationAccount',
          })
        }
        error={formErrors['destinationAccount']}
      />
      {destinationAccount && (
        <div>Token owner: {destinationAccount.account.owner.toString()}</div>
      )}
      {destinationAccountName && (
        <div>Account name: {destinationAccountName}</div>
      )}
      <Input
        min={mintMinAmount}
        prefix="Amount"
        value={form.amount}
        type="number"
        onChange={setAmount}
        step={mintMinAmount}
        error={formErrors['amount']}
        onBlur={validateAmountOnBlur}
      />
      <div className="text-right">
        {/* TODO move to parent container */}
        <DryRunInstructionBtn
          btnClassNames="mt-5 "
          isValid={!Object.keys(formErrors).length}
          getInstructionDataFcn={getSerializedInstruction}
        />
      </div>
    </div>
  )
})

export default SplTokenTransfer
