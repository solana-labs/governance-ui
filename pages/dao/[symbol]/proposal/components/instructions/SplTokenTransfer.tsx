/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useRealm from '@hooks/useRealm'
import { AccountInfo, Token } from '@solana/spl-token'
import {
  formatMintNaturalAmountAsDecimal,
  getMintMinAmountAsDecimal,
  getMintNaturalAmountFromDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { serializeInstructionToBase64 } from '@models/serialisation'
import { precision } from '@utils/formatting'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { tryParseKey } from '@tools/validators/pubkey'
import useWalletStore from 'stores/useWalletStore'
import { ProgramAccount, tryGetTokenAccount } from '@utils/tokens'
import {
  SplTokenTransferForm,
  Instruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { TOKEN_PROGRAM_ID } from '@utils/tokens'
import DryRunInstructionBtn from '../DryRunInstructionBtn'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { debounce } from '@utils/debounce'
import { MainGovernanceContext } from '../../new'
import { validateDestinationAccAddress } from '@utils/validations'
import useInstructions from '@hooks/useInstructions'
import BN from 'bn.js'

const SplTokenTransfer = ({ index, mainGovernance }) => {
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()
  const { governedTokenAccounts } = useInstructions()
  const shouldBeGoverned = index !== 0 && mainGovernance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SplTokenTransferForm>({
    destinationAccount: '',
    // No default transfer amount
    amount: undefined,
    governedAccount: undefined,
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
  const { handleSetInstructionData } = useContext(MainGovernanceContext)
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
      form.governedAccount?.token?.publicKey &&
      form.mintInfo
    ) {
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount!,
        form.mintInfo?.decimals
      )

      const transferIx = Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        form.governedAccount.token?.account.address,
        new PublicKey(form.destinationAccount),
        form.governedAccount.governance!.pubkey,
        [],
        mintAmount
      )
      serializedInstruction = serializeInstructionToBase64(transferIx)
    }
    const obj: Instruction = {
      serializedInstruction,
      isValid,
      governedAccount: form.governedAccount,
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
    setMintInfo(form.governedAccount?.mint?.account)
  }, [form.governedAccount?.token?.publicKey])
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
  useEffect(() => {
    handleSetInstructionData(
      { governedAccount: form.governedAccount, getSerializedInstruction },
      index
    )
  }, [form])

  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const schema = yup.object().shape({
    amount: yup
      .number()
      .test(
        'amount',
        'transfer amount must be less than the source account amount',
        async function (val: number) {
          if (val && form.governedAccount && form.governedAccount?.mint) {
            const mintValue = getMintNaturalAmountFromDecimal(
              val,
              form.governedAccount?.mint.account.decimals
            )
            return !!(
              form.governedAccount?.token?.publicKey &&
              form.governedAccount.token.account.amount.gte(new BN(mintValue))
            )
          }
          return this.createError({
            message: `amount is required`,
          })
        }
      ),
    destinationAccount: yup
      .string()
      .test(
        'accountTests',
        'account validation error',
        async function (val: string) {
          if (val) {
            try {
              await validateDestinationAccAddress(
                connection,
                val,
                form.governedAccount?.token?.account.address
              )
              return true
            } catch (e) {
              return this.createError({
                message: `${e}`,
              })
            }
          } else {
            return this.createError({
              message: `destination account is required`,
            })
          }
        }
      ),
    governedAccount: yup
      .object()
      .nullable()
      .required('source account is required'),
  })
  const returnGovernanceTokenAccountLabelInfo = (acc) => {
    const govAccount = acc.token.publicKey.toString()
    const adressAsString = acc.token.account.address.toString()
    const tokenName = getMintMetadata(acc.token.account.mint)?.name
    const accName = getAccountName(acc.token.publicKey)
    const label = accName ? `${accName}: ${adressAsString}` : adressAsString
    const amout = formatMintNaturalAmountAsDecimal(
      acc.mint?.account,
      acc.token?.account.amount
    )
    return {
      govAccount,
      adressAsString,
      tokenName,
      label,
      amout,
    }
  }
  const returnGovernanceTokenAccountLabel = () => {
    if (form.governedAccount) {
      const { label, tokenName, amout } = returnGovernanceTokenAccountLabelInfo(
        form.governedAccount
      )
      return (
        <div>
          <span>{label}</span>
          {tokenName && <div>Token Name: {tokenName}</div>}
          <div>Amount: {amout}</div>
        </div>
      )
    } else {
      return null
    }
  }
  return (
    <div className="mt-5">
      <Select
        className="h-24"
        prefix="Source Account"
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'governedAccount' })
        }
        componentLabelFcn={returnGovernanceTokenAccountLabel}
        value={form.governedAccount?.token?.account?.address?.toString()}
        error={formErrors['governedAccount']}
      >
        {governedTokenAccounts
          .filter((x) =>
            !shouldBeGoverned
              ? !shouldBeGoverned
              : x.governance?.pubkey.toBase58() ===
                mainGovernance.governance?.pubkey?.toBase58()
          )
          .map((acc) => {
            const {
              govAccount,
              label,
              tokenName,
              amout,
            } = returnGovernanceTokenAccountLabelInfo(acc)
            return (
              <Select.Option key={govAccount} value={acc}>
                <span>{label}</span>
                {tokenName && <div>Token Name: {tokenName}</div>}
                <div>Amount: {amout}</div>
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
        <div>account owner: {destinationAccount.account.owner.toString()}</div>
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
}

export default SplTokenTransfer
