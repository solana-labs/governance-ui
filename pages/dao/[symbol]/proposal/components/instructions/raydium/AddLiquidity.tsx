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
  getGovernanceMintSymbols,
  getGovernanceToken,
} from '@tools/sdk/uxdProtocol/uxdClient'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { createAddLiquidityInstruction } from '@tools/sdk/raydium/createAddLiquidityInstruction'
import { getAmountOut } from '@tools/sdk/raydium/helpers'
import {
  liquidityPoolList,
  UXP_USDC_POOL_KEYS,
} from '@tools/sdk/raydium/poolKeys'
import { BN } from '@project-serum/anchor'

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
  // const { getGovernancesByAccountType } = useGovernanceAssets()
  const [governedAccounts, setGovernedAccounts] = useState<
    GovernedMultiTypeAccount[]
  >([])
  const {
    governancesArray,
    governedTokenAccounts,
    getMintWithGovernances,
  } = useGovernanceAssets()

  useEffect(() => {
    async function prepGovernances() {
      const mintWithGovernances = await getMintWithGovernances()
      const matchedGovernances = governancesArray.map((gov) => {
        const governedTokenAccount = governedTokenAccounts.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )
        const mintGovernance = mintWithGovernances.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )
        if (governedTokenAccount) {
          return governedTokenAccount as GovernedMultiTypeAccount
        }
        if (mintGovernance) {
          return mintGovernance as GovernedMultiTypeAccount
        }
        return {
          governance: gov,
        }
      })
      setGovernedAccounts(matchedGovernances)
    }
    prepGovernances()
  }, [])
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<AddLiquidityRaydiumForm>({
    governedAccount: undefined,
    liquidityPool: '',
    tokenAName: '',
    tokenBName: '',
    tokenAAmountIn: 0,
    tokenBAmountIn: 0,
    fixedSide: 'base',
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
      const tokenA = getGovernanceToken(connection.cluster, form.tokenAName)
      const tokenB = getGovernanceToken(connection.cluster, form.tokenBName)

      const createIx = createAddLiquidityInstruction(
        new PublicKey(tokenA.address),
        new PublicKey(tokenB.address),
        new BN(
          (
            Number(Number(form.tokenAAmountIn).toFixed(tokenA.decimals)) *
            10 ** tokenA.decimals
          ).toString()
        ),
        new BN(
          (
            Number(Number(form.tokenBAmountIn).toFixed(tokenB.decimals)) *
            10 ** tokenB.decimals
          ).toString()
        ),
        form.fixedSide,
        form.governedAccount.governance.pubkey
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
    if (form.tokenAName) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
      // We are assuming for now that we only have one Liquidity Pool (UXP/USDC)
      handleSetForm({
        value: getGovernanceMintSymbols(connection.cluster).filter(
          (s) => s !== form.tokenAName
        )[0],
        propertyName: 'tokenBName',
      })
    }
  }, [form.tokenAName])

  useEffect(() => {
    if (form.tokenAAmountIn) {
      debounce.debounceFcn(async () => {
        handleSetForm({
          value: await getAmountOut(
            UXP_USDC_POOL_KEYS,
            form.tokenAName,
            Number(form.tokenAAmountIn),
            form.tokenBName,
            connection
          ),
          propertyName: 'tokenBAmountIn',
        })
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.tokenAAmountIn])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    tokenAName: yup.string().required('Token A Name is required'),
    tokenBName: yup.string().required('Token B Name is required'),
    tokenAAmountIn: yup
      .number()
      .moreThan(0, 'Amount for A token should be more than 0')
      .required('Amount for A token is required'),
    tokenBAmountIn: yup
      .number()
      .moreThan(0, 'Amount for B token should be more than 0')
      .required('Amount for B token is required'),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
    fixedSide: yup
      .string()
      .equals(['base', 'quote'])
      .required('Fixed Side is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedAccounts as GovernedMultiTypeAccount[]}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>

      <Select
        label="Raydium Liquidity Pool"
        value={form.liquidityPool}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'liquidityPool' })
        }
        error={formErrors['liquidityPoolId']}
      >
        {liquidityPoolList.map((pool, i) => (
          <Select.Option key={pool.label + i} value={pool.label}>
            {pool.label}
          </Select.Option>
        ))}
      </Select>
      <Select
        label="Token A Name"
        value={form.tokenAName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'tokenAName' })
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
        label="Token B Name"
        value={form.tokenBName}
        placeholder="Please select..."
        disabled={true}
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'tokenBName' })
        }
        error={formErrors['tokenBName']}
      >
        {getGovernanceMintSymbols(connection.cluster).map((value, i) => (
          <Select.Option key={value + i} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>

      <Input
        label="Token A Amount to deposit"
        value={form.tokenAAmountIn}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'tokenAAmountIn',
          })
        }
        error={formErrors['tokenAAmountIn']}
      />

      <Input
        label="Token B Amount to deposit"
        value={form.tokenBAmountIn}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: Number(evt.target.value),
            propertyName: 'tokenBAmountIn',
          })
        }
        disabled={true}
        error={formErrors['tokenBAmountIn']}
      />
      <Select
        label="Fixed Side"
        value={form.fixedSide}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'fixedSide' })
        }
        error={formErrors['fixedSide']}
      >
        {['base', 'quote'].map((value, i) => (
          <Select.Option key={value + i} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>
    </>
  )
}

export default AddLiquidityRaydium
