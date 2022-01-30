/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletStore from 'stores/useWalletStore'
import Input from '@components/inputs/Input'
import { debounce } from '@utils/debounce'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import Select from '@components/inputs/Select'
import { getGovernanceMintSymbols } from '@tools/sdk/uxdProtocol/uxdClient'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { getLPMintInfo } from '@tools/sdk/raydium/helpers'
import { UXP_USDC_POOL_KEYS } from '@tools/sdk/raydium/poolKeys'
import { createRemoveLiquidityInstruction } from '@tools/sdk/raydium/createRemoveLiquidityInstruction'
import BigNumber from 'bignumber.js'

const RemoveLiquidityRaydium = ({
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
  const [form, setForm] = useState<any>({
    governedAccount: undefined,
    amountIn: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const [maxLPAmount, setMaxLPAmount] = useState(0)
  const [LPDecimals, setLPDecimals] = useState(9)
  useEffect(() => {
    const fetchLpData = async () => {
      if (!form.governedAccount?.governance.pubkey) return
      const { maxBalance, decimals } = await getLPMintInfo(
        connection,
        UXP_USDC_POOL_KEYS.lpMint,
        form.governedAccount.governance.pubkey
      )
      setMaxLPAmount(maxBalance)
      setLPDecimals(decimals)
    }
    fetchLpData()
  }, [form.governedAccount?.governance.pubkey])

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
      const createIx = createRemoveLiquidityInstruction(
        new PublicKey(form.governedAccount.governance.pubkey),
        new BigNumber(form.amountIn).shiftedBy(LPDecimals).toString()
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
    if (form.baseAmountIn) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.baseAmountIn])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    baseTokenName: yup.string().required('Base Token Name is required'),
    quoteTokenName: yup.string().required('Quote Token Name is required'),
    amountIn: yup
      .number()
      .moreThan(0, 'Amount for LP token should be more than 0')
      .required('Amount for LP token is required'),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
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
        label={`LP Token Amount to withdraw - max: ${maxLPAmount}`}
        value={form.amountIn}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'amountIn',
          })
        }
        error={formErrors['amountIn']}
      />
    </>
  )
}

export default RemoveLiquidityRaydium
