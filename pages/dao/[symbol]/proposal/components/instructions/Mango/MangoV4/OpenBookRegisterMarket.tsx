/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import { OPENBOOK_PROGRAM_ID } from '@blockworks-foundation/mango-v4'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

interface OpenBookRegisterMarketForm {
  governedAccount: AssetAccount | null
  openBookMarketExternalPk: string
  baseBankPk: string
  quoteBankPk: string
  openBookProgram: string
  marketIndex: number
  name: string
  holdupTime: number
}

const OpenBookRegisterMarket = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const { mangoClient, mangoGroup } = UseMangoV4()
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      mangoGroup?.admin &&
      x.extensions.transferAddress?.equals(mangoGroup.admin)
  )
  const connection = useLegacyConnectionContext()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<OpenBookRegisterMarketForm>({
    governedAccount: null,
    openBookMarketExternalPk: '',
    baseBankPk: '',
    quoteBankPk: '',
    marketIndex: 0,
    openBookProgram: OPENBOOK_PROGRAM_ID[
      connection.cluster === 'mainnet' ? 'mainnet-beta' : 'devnet'
    ].toBase58(),
    name: '',
    holdupTime: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

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
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const ix = await mangoClient!.program.methods
        .serum3RegisterMarket(Number(form.marketIndex), form.name)
        .accounts({
          group: mangoGroup!.publicKey,
          admin: form.governedAccount.extensions.transferAddress,
          serumProgram: new PublicKey(form.openBookProgram),
          serumMarketExternal: new PublicKey(form.openBookMarketExternalPk),
          baseBank: new PublicKey(form.baseBankPk),
          quoteBank: new PublicKey(form.quoteBankPk),
          payer: form.governedAccount.extensions.transferAddress,
        })
        .instruction()

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdupTime,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
    name: yup.string().required(),
    marketIndex: yup.string().required(),
    openBookMarketExternalPk: yup
      .string()
      .required()
      .test('is-valid-address', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    baseBankPk: yup
      .string()
      .required()
      .test('is-valid-address1', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    quoteBankPk: yup
      .string()
      .required()
      .test('is-valid-address2', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    openBookProgram: yup
      .string()
      .required()
      .test('is-valid-address3', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
  })

  useEffect(() => {
    const marketIndex =
      !mangoGroup || mangoGroup?.serum3MarketsMapByMarketIndex.size === 0
        ? 0
        : Math.max(...[...mangoGroup!.serum3MarketsMapByMarketIndex.keys()]) + 1
    setForm({
      ...form,
      marketIndex: marketIndex,
    })
  }, [mangoGroup?.serum3MarketsMapByMarketIndex.size])

  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: solAccounts,
    },
    {
      label: 'Instruction hold up time (days)',
      initialValue: form.holdupTime,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'holdupTime',
    },
    {
      label: 'Name',
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
    },
    {
      label: `Market Index`,
      initialValue: form.marketIndex,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'marketIndex',
    },
    {
      label: 'Openbook Market External',
      initialValue: form.openBookMarketExternalPk,
      type: InstructionInputType.INPUT,
      name: 'openBookMarketExternalPk',
    },
    {
      label: 'Base Bank ',
      initialValue: form.baseBankPk,
      type: InstructionInputType.INPUT,
      name: 'baseBankPk',
    },
    {
      label: 'Quote Bank',
      initialValue: form.quoteBankPk,
      type: InstructionInputType.INPUT,
      name: 'quoteBankPk',
    },
    {
      label: 'Openbook Program',
      initialValue: form.openBookProgram,
      type: InstructionInputType.INPUT,
      name: 'openBookProgram',
    },
  ]

  return (
    <>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
        ></InstructionForm>
      )}
    </>
  )
}

export default OpenBookRegisterMarket
