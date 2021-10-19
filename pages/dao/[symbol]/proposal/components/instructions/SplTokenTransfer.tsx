import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useRealm from '@hooks/useRealm'
import { GovernanceAccountType } from '@models/accounts'
import { AccountInfo, Token } from '@solana/spl-token'
import {
  getMintMinAmountAsDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { serializeInstructionToBase64 } from '@models/serialisation'
import { precision } from '@utils/formatting'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { validateTokenAccountMint } from '@tools/validators/accounts/token'
import { tryParseKey } from '@tools/validators/pubkey'
import useWalletStore from 'stores/useWalletStore'
import {
  ProgramAccount,
  tryGetTokenAccount,
  tryGetTokenMint,
} from '@utils/tokens'
import {
  SplTokenTransferForm,
  Instruction,
  SplTokenTransferRef,
} from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { TOKEN_PROGRAM_ID } from '@utils/tokens'
import useInstructions from '@hooks/useInstructions'

const SplTokenTransfer = forwardRef<SplTokenTransferRef>((props, ref) => {
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()
  const { getGovernancesByAccountType } = useInstructions()
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SplTokenTransferForm>({
    destinationAccount: '',
    amount: 1,
    governance: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
  })
  const [formErrors, setFormErrors] = useState({})
  const governancesFiltred = getGovernancesByAccountType(
    GovernanceAccountType.TokenGovernance
  ).map((x) => x)
  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)

  const schema = yup.object().shape({
    destinationAccount: yup
      .string()
      .required('Destination account is required')
      .test(
        'destinationAccount',
        "Account mint doesn't match source account",
        async (val: string) => {
          const pubkey = tryParseKey(val)
          const governedAccount = form.governance?.info?.governedAccount
          try {
            if (pubkey && governedAccount) {
              const [destAccMint, sourceAccMint]: [
                ProgramAccount<AccountInfo> | undefined,
                ProgramAccount<AccountInfo> | undefined
              ] = await Promise.all([
                tryGetTokenAccount(connection.current, pubkey),
                tryGetTokenAccount(connection.current, governedAccount),
              ])
              if (destAccMint && sourceAccMint) {
                validateTokenAccountMint(
                  destAccMint,
                  sourceAccMint?.account.mint
                )
                return true
              } else {
                return false
              }
            }
          } catch (e) {
            return false
          }
          return false
        }
      ),
    amount: yup.string().required('Amount is required'),
    governance: yup.object().nullable().required('Source account is required'),
  })
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setMintInfo = (value) => {
    setForm({ ...form, mintInfo: value })
  }
  const setamount = (event) => {
    const { min, max } = event.target
    let value = event.target.value
    value = !value
      ? ''
      : Math.max(Number(min), Math.min(Number(max), Number(value))).toFixed(
          currentPrecision
        )
    handleSetForm({
      value: value,
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
    if (isValid && programId && form.governance?.pubkey) {
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount,
        mintMinAmount
      )
      const transferIx = Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        form.governance.info.governedAccount,
        new PublicKey(form.destinationAccount),
        form.governance.pubkey,
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
    async function tryGetTokenAccount() {
      if (form.governance?.info.governedAccount) {
        const mintResponse = await tryGetTokenMint(
          connection.current,
          form.governance?.info.governedAccount
        )
        setMintInfo(mintResponse?.account)
      }
    }
    if (form.governance?.info.governedAccount) {
      tryGetTokenAccount()
    }
  }, [form.governance?.pubkey])
  useImperativeHandle(ref, () => ({
    getSerializedInstruction,
  }))

  return (
    <div className="mt-5">
      <Select
        prefix="Source Account"
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'governance' })
        }
        value={form.governance?.info?.governedAccount?.toString()}
        error={formErrors['governance']}
      >
        {governancesFiltred.map((acc) => {
          const govAccount = acc.pubkey.toString()
          const accName = getAccountName(acc.pubkey)
          const label = accName
            ? `${accName}: ${acc.info.governedAccount.toString()}`
            : acc.info.governedAccount.toString()
          return (
            <Select.Option key={govAccount} value={acc}>
              <span>{label}</span>
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
      <Input
        min={mintMinAmount}
        prefix="Amount"
        value={form.amount}
        type="number"
        onChange={setamount}
        step={mintMinAmount}
        error={formErrors['amount']}
      />
    </div>
  )
})

export default SplTokenTransfer
