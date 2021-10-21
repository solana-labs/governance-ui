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
import { validateDestinationAccAdress } from '@utils/validations'
import BN from 'bn.js'

const SplTokenTransfer = ({ index }) => {
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo, governedTokenAccounts } = useRealm()
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SplTokenTransferForm>({
    destinationAccount: '',
    // No default transfer amount
    amount: undefined,
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
      form.governance?.token?.publicKey &&
      form.mintInfo
    ) {
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount!,
        form.mintInfo?.decimals
      )
      const transferIx = Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        form.governance.token?.account.address,
        new PublicKey(form.destinationAccount),
        // TODO: using owner fixes instruction but TokenAccountWithMintInfo should be GovernedTokenAccount and store the governance
        form.governance.token?.account.owner,
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
      { governance: form.governance, getSerializedInstruction },
      index
    )
  }, [form])

  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const schema = yup.object().shape({
    amount: yup
      .number()
      .required('Amount is required')
      .min(mintMinAmount, `Minimal value for amount is ${mintMinAmount}`)
      .test(
        'amount',
        'The quantity must be less than the available tokens in the source account',
        async (val) => {
          if (val && form.governance) {
            const mintValue = getMintNaturalAmountFromDecimal(
              val,
              form.governance.mintInfo.account.decimals
            )
            return !!(
              form.governance.token.publicKey &&
              form.governance.token.account.amount.gte(new BN(mintValue))
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
            try {
              await validateDestinationAccAdress(
                connection,
                val,
                form.governance?.token?.account.address
              )
              return true
            } catch (e) {
              console.log(e)
              return this.createError({
                message: `${e}`,
              })
            }
          } else {
            return false
          }
        }
      ),
    governance: yup.object().nullable().required('Source account is required'),
  })

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
                {formatMintNaturalAmountAsDecimal(
                  acc.mintInfo.account,
                  acc.token?.account.amount
                )}
              </div>
              <div>{`mint: ${acc.mintInfo.account.decimals}`}</div>
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
