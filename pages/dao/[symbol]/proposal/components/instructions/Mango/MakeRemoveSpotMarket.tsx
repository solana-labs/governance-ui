/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoRemoveSpotMarketForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import {
  IDS,
  Config,
  MangoClient,
  makeRemoveSpotMarketInstruction,
} from '@blockworks-foundation/mango-client'
import { AccountType } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'
import { usePrevious } from '@hooks/usePrevious'
import { emptyPk } from '../../../../../../../VoteStakeRegistry/sdk/accounts'

const MakeRemoveSpotMarket = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.PROGRAM
  )
  const connection = useWalletStore((s) => s.connection)
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MangoRemoveSpotMarketForm>({
    governedAccount: null,
    mangoGroup: null,
    marketIndex: null,
    adminPk: '',
    adminVaultPk: '',
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
      const groupConfig = Config.ids().groups.find((c) =>
        c.publicKey.equals(new PublicKey(form.mangoGroup!.value))
      )!
      const client = new MangoClient(
        connection.current,
        groupConfig.mangoProgramId
      )
      const group = await client.getMangoGroup(groupConfig.publicKey)
      const [dustAccountPk] = await PublicKey.findProgramAddress(
        [group.publicKey.toBytes(), Buffer.from('DustAccount', 'utf-8')],
        groupConfig.mangoProgramId
      )
      const marketIndex = Number(form.marketIndex!.value)
      const rootBanks = await group.loadRootBanks(connection.current)
      //Mango instruction call and serialize
      const removePerpMarketIx = makeRemoveSpotMarketInstruction(
        groupConfig.mangoProgramId,
        groupConfig.publicKey,
        new PublicKey(form.adminPk),
        dustAccountPk,
        rootBanks[marketIndex]!.publicKey,
        new PublicKey(form.adminVaultPk),
        group.signerKey,
        rootBanks[marketIndex]!.nodeBanks.filter(
          (x) => x.toBase58() !== emptyPk
        ),
        rootBanks[marketIndex]!.nodeBankAccounts.map((x) => x.vault)
      )

      serializedInstruction = serializeInstructionToBase64(removePerpMarketIx)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  const previousProgramGov = usePrevious(
    form.governedAccount?.governance.pubkey.toBase58()
  )
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    if (
      form.governedAccount?.governance.pubkey.toBase58() !== form.adminPk &&
      previousProgramGov !== form.governedAccount?.governance.pubkey.toBase58()
    ) {
      handleSetForm({
        propertyName: 'adminPk',
        value: form.governedAccount?.governance.pubkey.toBase58(),
      })
    }
  }, [JSON.stringify(form)])
  const schema = yup.object().shape({
    mangoGroup: yup.object().nullable().required('Mango group is required'),
    marketIndex: yup.object().nullable().required('Market index is required'),
    adminPk: yup.string().required('Admin Pk is required'),
    adminVaultPk: yup.string().required('Admin vault pk is required'),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  const getOptionsForMarketIndex = () => {
    const currentMangoGroup = IDS.groups.find(
      (x) => x.publicKey === form.mangoGroup?.value
    )!
    return form.mangoGroup
      ? currentMangoGroup['spotMarkets'].map((x) => {
          return {
            name: x.name,
            value: x.marketIndex,
          }
        })
      : []
  }
  const inputs: InstructionInput[] = [
    {
      label: 'Program',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: governedProgramAccounts,
    },
    {
      label: 'Mango group',
      initialValue: form.mangoGroup,
      type: InstructionInputType.SELECT,
      name: 'mangoGroup',
      options: IDS.groups.map((x) => {
        return { name: x.name, value: x.publicKey }
      }),
    },
    {
      label: 'Market',
      initialValue: form.marketIndex,
      type: InstructionInputType.SELECT,
      name: 'marketIndex',
      options: getOptionsForMarketIndex(),
    },
    {
      label: 'Admin PublicKey',
      initialValue: form.adminPk,
      type: InstructionInputType.INPUT,
      name: 'adminPk',
    },
    {
      label: 'Mango DAO token account (ATA with same mint as removed market)',
      initialValue: form.adminVaultPk,
      type: InstructionInputType.INPUT,
      name: 'adminVaultPk',
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

export default MakeRemoveSpotMarket
