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

interface Serum3RegisterMarketForm {
  governedAccount: AssetAccount | null
  serum3MarketExternalPk: string
  baseBankTokenName: string
  quoteBankTokenName: string
  marketIndex: number
  name: string
}

const EditToken = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { getClient, ADMIN_PK, GROUP_NUM } = UseMangoV4()
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.PROGRAM
  )
  const { connection } = useWalletStore()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<Serum3RegisterMarketForm>({
    governedAccount: null,
    serum3MarketExternalPk: '',
    baseBankTokenName: '',
    quoteBankTokenName: '',
    marketIndex: 0,
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
      const client = await getClient(connection, wallet)
      const group = await client.getGroupForCreator(ADMIN_PK, GROUP_NUM)
      const marketIndex = group.serum3ExternalMarketsMap.size
      //TODO dao sol account as payer
      //Mango instruction call and serialize
      const ix = await client.program.methods
        .serum3RegisterMarket(marketIndex, form.name)
        .accounts({
          group: group.publicKey,
          admin: ADMIN_PK,
          serumProgram: OPENBOOK_PROGRAM_ID[connection.cluster],
          serumMarketExternal: new PublicKey(form.serum3MarketExternalPk),
          //todo fix by getFirstBankByMint
          baseBank: group.banksMapByName.get(
            form.baseBankTokenName.toUpperCase()
          )![0]!.publicKey,
          quoteBank: group.banksMapByName.get(
            form.quoteBankTokenName.toUpperCase()
          )![0]!.publicKey,
          payer: wallet.publicKey,
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
      options: governedProgramAccounts,
    },
    {
      label: 'Name',
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
    },
    {
      label: 'Serum 3 Market External Pk',
      initialValue: form.serum3MarketExternalPk,
      type: InstructionInputType.INPUT,
      name: 'serum3MarketExternalPk',
    },
    {
      label: 'Base Bank Token Name',
      initialValue: form.baseBankTokenName,
      type: InstructionInputType.INPUT,
      name: 'baseBankTokenName',
    },
    {
      label: 'Quote Bank Token Name',
      initialValue: form.quoteBankTokenName,
      type: InstructionInputType.INPUT,
      name: 'quoteBankTokenName',
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

export default EditToken
