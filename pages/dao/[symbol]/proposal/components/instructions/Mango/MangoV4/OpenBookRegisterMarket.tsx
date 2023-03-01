/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import { OPENBOOK_PROGRAM_ID } from '@blockworks-foundation/mango-v4'

interface OpenBookRegisterMarketForm {
  governedAccount: AssetAccount | null
  openBookMarketExternalPk: string
  baseBankMintPk: string
  quoteBankMintPk: string
  name: string
}

const OpenBookRegisterMarket = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { mangoClient, mangoGroup } = UseMangoV4()
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      mangoGroup?.admin &&
      x.extensions.transferAddress?.equals(mangoGroup.admin)
  )
  const { connection } = useWalletStore()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<OpenBookRegisterMarketForm>({
    governedAccount: null,
    openBookMarketExternalPk: '',
    baseBankMintPk: '',
    quoteBankMintPk: '',
    name: '',
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
      const marketIndex = mangoGroup!.serum3ExternalMarketsMap.size

      const ix = await mangoClient!.program.methods
        .serum3RegisterMarket(marketIndex, form.name)
        .accounts({
          group: mangoGroup!.publicKey,
          admin: form.governedAccount.extensions.transferAddress,
          serumProgram:
            OPENBOOK_PROGRAM_ID[
              connection.cluster === 'mainnet' ? 'mainnet-beta' : 'devnet'
            ],
          serumMarketExternal: new PublicKey(form.openBookMarketExternalPk),
          baseBank: mangoGroup!.getFirstBankByMint(
            new PublicKey(form.baseBankMintPk)
          ).publicKey,
          quoteBank: mangoGroup!.getFirstBankByMint(
            new PublicKey(form.quoteBankMintPk)
          ).publicKey,
          payer: form.governedAccount.extensions.transferAddress,
        })
        .instruction()

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realmInfo?.programId])
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
  })
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
      label: 'Name',
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
    },
    {
      label: 'Openbook Market External',
      initialValue: form.openBookMarketExternalPk,
      type: InstructionInputType.INPUT,
      name: 'openBookMarketExternalPk',
    },
    {
      label: 'Base Bank Mint',
      initialValue: form.baseBankMintPk,
      type: InstructionInputType.INPUT,
      name: 'baseBankMintPk',
    },
    {
      label: 'Quote Bank Mint',
      initialValue: form.quoteBankMintPk,
      type: InstructionInputType.INPUT,
      name: 'quoteBankMintPk',
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
