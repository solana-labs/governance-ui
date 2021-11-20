/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { AccountInfo, Token } from '@solana/spl-token'
import {
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
import {
  GovernedMultiTypeAccount,
  ProgramAccount,
  tryGetTokenAccount,
} from '@utils/tokens'
import {
  SplTokenTransferForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { TOKEN_PROGRAM_ID } from '@utils/tokens'
import { debounce } from '@utils/debounce'
import { NewProposalContext } from '../../new'
import { validateDestinationAccAddress } from '@utils/validations'
import useInstructions from '@hooks/useInstructions'
import BN from 'bn.js'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import GovernedAccountSelect from '../GovernedAccountSelect'

const SplTokenTransfer = ({
  index,
  governance,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()
  const { governedTokenAccounts } = useInstructions()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SplTokenTransferForm>({
    destinationAccount: '',
    // No default transfer amount
    amount: undefined,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
  })
  const [governedAccount, setGovernedAccount] = useState<
    ParsedAccount<Governance> | undefined
  >(undefined)
  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<ProgramAccount<AccountInfo> | null>(null)
  const [formErrors, setFormErrors] = useState({})
  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const { handleSetInstructions } = useContext(NewProposalContext)
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
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedTokenAccount?.token?.publicKey &&
      form.governedTokenAccount?.token &&
      form.mintInfo
    ) {
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount!,
        form.mintInfo?.decimals
      )
      const transferIx = Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        form.governedTokenAccount.token?.account.address,
        new PublicKey(form.destinationAccount),
        form.governedTokenAccount.governance!.pubkey,
        [],
        mintAmount
      )
      serializedInstruction = serializeInstructionToBase64(transferIx)
    }

    const obj: UiInstruction = {
      serializedInstruction,
      isValid,
      governedAccount: governedAccount,
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
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form])
  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    setMintInfo(form.governedTokenAccount?.mint?.account)
  }, [form.governedTokenAccount])
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const schema = yup.object().shape({
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

  return (
    <>
      <GovernedAccountSelect
        label="Source account"
        governedAccounts={governedTokenAccounts as GovernedMultiTypeAccount[]}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        label="Destination account"
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
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account owner</div>
          <div className="text-xs">
            {destinationAccount.account.owner.toString()}
          </div>
        </div>
      )}
      {destinationAccountName && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account name</div>
          <div className="text-xs">{destinationAccountName}</div>
        </div>
      )}
      <Input
        min={mintMinAmount}
        label="Amount"
        value={form.amount}
        type="number"
        onChange={setAmount}
        step={mintMinAmount}
        error={formErrors['amount']}
        onBlur={validateAmountOnBlur}
      />
    </>
  )
}

export default SplTokenTransfer
