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
  GovernedMintInfoAccount,
  GovernedMultiTypeAccount,
  ProgramAccount,
  tryGetTokenAccount,
} from '@utils/tokens'
import { UiInstruction, MintForm } from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { TOKEN_PROGRAM_ID } from '@utils/tokens'
import { debounce } from '@utils/debounce'
import { NewProposalContext } from '../../new'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import useInstructions from '@hooks/useInstructions'
import { validateDestinationAccAddressWithMint } from '@utils/validations'
import GovernedAccountSelect from '../GovernedAccountSelect'

const Mint = ({
  index,
  governance,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()
  const { getMintWithGovernances } = useInstructions()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MintForm>({
    destinationAccount: '',
    // No default mint amount
    amount: undefined,
    mintAccount: undefined,
    programId: programId?.toString(),
  })
  const [governedAccount, setGovernedAccount] = useState<
    ParsedAccount<Governance> | undefined
  >(undefined)
  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<ProgramAccount<AccountInfo> | null>(null)
  const [formErrors, setFormErrors] = useState({})
  const [
    mintGovernancesWithMintInfo,
    setMintGovernancesWithMintInfo,
  ] = useState<GovernedMintInfoAccount[]>([])
  const mintMinAmount = form.mintAccount
    ? getMintMinAmountAsDecimal(form.mintAccount.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
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
    if (isValid && programId && form.mintAccount?.governance?.pubkey) {
      const mintAmount = parseMintNaturalAmountFromDecimal(
        form.amount!,
        form.mintAccount.mintInfo?.decimals
      )
      const transferIx = Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        form.mintAccount.governance.info.governedAccount,
        new PublicKey(form.destinationAccount),
        form.mintAccount.governance!.pubkey,
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
  }, [form, governedAccount])
  useEffect(() => {
    setGovernedAccount(form?.mintAccount?.governance)
  }, [form.mintAccount])
  useEffect(() => {
    async function getMintWithGovernancesFcn() {
      const resp = await getMintWithGovernances()
      setMintGovernancesWithMintInfo(resp)
    }
    getMintWithGovernancesFcn()
  }, [])
  useEffect(() => {
    if (mintGovernancesWithMintInfo.length === 1) {
      handleSetForm({
        value: mintGovernancesWithMintInfo[0],
        propertyName: 'mintAccount',
      })
    }
  }, [mintGovernancesWithMintInfo.length])
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const schema = yup.object().shape({
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
            form.mintAccount.governance?.info.governedAccount && mintValue
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
                  form.mintAccount.governance.info.governedAccount
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

  return (
    <>
      <GovernedAccountSelect
        label="Mint"
        governedAccounts={
          mintGovernancesWithMintInfo as GovernedMultiTypeAccount[]
        }
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'mintAccount' })
        }}
        value={form.mintAccount}
        error={formErrors['mintAccount']}
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

export default Mint
