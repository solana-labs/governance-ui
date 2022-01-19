/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  AddLiquidityRaydiumForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletStore from 'stores/useWalletStore'
import Input from '@components/inputs/Input'
import { debounce } from '@utils/debounce'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import Select from '@components/inputs/Select'
import {
  getGovernanceMintKey,
  getGovernanceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
  GovernanceAccountType,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { createAddLiquidityInstruction } from '@tools/sdk/raydium/createAddLiquidityInstruction'
import { getAmountOut } from '@tools/sdk/raydium/helpers'
import { UXP_USDC_POOL_KEYS } from '@tools/sdk/raydium/poolKeys'

const AddLiquidityRaydium = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { getGovernancesByAccountType } = useGovernanceAssets()
  const governedProgramAccounts = getGovernancesByAccountType(
    GovernanceAccountType.ProgramGovernance
  ).map((x) => {
    return {
      governance: x,
    }
  })
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<AddLiquidityRaydiumForm>({
    governedAccount: undefined,
    baseTokenName: '',
    quoteTokenName: '',
    baseAmountIn: 0,
    quoteAmountIn: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
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
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const createIx = createAddLiquidityInstruction(
        getGovernanceMintKey(connection.cluster, form.baseTokenName),
        getGovernanceMintKey(connection.cluster, form.quoteTokenName),
        form.baseAmountIn,
        form.quoteAmountIn,
        form.governedAccount.governance.pubkey,
        new PublicKey(wallet.publicKey.toBase58())
      )
      serializedInstruction = serializeInstructionToBase64(createIx)
    }
    const obj: UiInstruction = {
      serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
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
    if (form.baseTokenName) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
      // We are assuming for now that we only have one Liquidity Pool (UXP/USDC)
      handleSetForm({
        value: getGovernanceMintSymbols(connection.cluster).filter(
          (s) => s !== form.baseTokenName
        )[0],
        propertyName: 'quoteTokenName',
      })
    }
  }, [form.baseTokenName])

  useEffect(() => {
    if (form.quoteTokenName) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.quoteTokenName])

  useEffect(() => {
    if (form.baseAmountIn) {
      debounce.debounceFcn(async () => {
        handleSetForm({
          value: await getAmountOut(
            UXP_USDC_POOL_KEYS,
            form.baseTokenName,
            form.baseAmountIn,
            form.quoteTokenName,
            connection
          ),
          propertyName: 'quoteAmountIn',
        })
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.baseAmountIn])

  useEffect(() => {
    if (form.quoteAmountIn) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.quoteAmountIn])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    baseTokenName: yup.string().required('Base Token Name is required'),
    quoteTokenName: yup.string().required('Quote Token Name is required'),
    baseAmountIn: yup
      .number()
      .moreThan(0, 'Amount for base token should be more than 0')
      .required('Amount for base token is required'),
    quoteAmountIn: yup
      .number()
      .moreThan(0, 'Amount for quote token should be more than 0')
      .required('Amount for quote token is required'),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedProgramAccounts as GovernedMultiTypeAccount[]}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Select
        label="Base Token Name"
        value={form.baseTokenName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'baseTokenName' })
        }
        error={formErrors['baseTokenName']}
      >
        {getGovernanceMintSymbols(connection.cluster).map((value, i) => (
          <Select.Option key={value + i} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>

      <Select
        label="Quote Token Name"
        value={form.quoteTokenName}
        placeholder="Please select..."
        disabled={true}
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'quoteTokenName' })
        }
        error={formErrors['quoteTokenName']}
      >
        {getGovernanceMintSymbols(connection.cluster).map((value, i) => (
          <Select.Option key={value + i} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>

      <Input
        label="Base Token Amount to deposit"
        value={form.baseAmountIn}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'baseAmountIn',
          })
        }
        error={formErrors['baseAmountIn']}
      />

      <Input
        label="Quote Token Amount to deposit"
        value={form.quoteAmountIn}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'quoteAmountIn',
          })
        }
        disabled={true}
        error={formErrors['quoteAmountIn']}
      />
    </>
  )
}

export default AddLiquidityRaydium
