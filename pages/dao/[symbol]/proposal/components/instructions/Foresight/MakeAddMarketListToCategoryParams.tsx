/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  ForesightMakeAddMarketListToCategoryParams,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import {
  governance as foresightGov,
  consts as foresightConsts,
} from '@foresight-tmp/foresight-sdk'
import {
  ForesightGovernedAccountSelect,
  getFilteredTokenAccounts,
} from './utils'

function MakeAddMarketListToCategoryParams({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const filteredTokenAccounts = getFilteredTokenAccounts()
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<ForesightMakeAddMarketListToCategoryParams>({
    governedAccount: filteredTokenAccounts[0],
    categoryId: '',
    marketListId: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  function handleSetForm({
    propertyName,
    value,
  }: {
    propertyName: string
    value: any
  }) {
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
    if (isValid && programId && wallet?.publicKey) {
      const program = foresightGov.readonlyProgram(
        new PublicKey(foresightConsts.DEVNET_PID)
      )
      const {
        ix: initMarketListIx,
      } = await foresightGov.genAddMarketListToCategoryIx(
        Buffer.from(form.categoryId.padEnd(20)),
        Buffer.from(form.marketListId.padEnd(20)),
        program,
        form.governedAccount.transferAddress!
      )

      serializedInstruction = serializeInstructionToBase64(initMarketListIx)
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
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
    categoryId: yup.string().required(),
    marketListId: yup.string().required(),
  })
  let x = formErrors['categoryId']
  return (
    <>
      <ForesightGovernedAccountSelect<ForesightMakeAddMarketListToCategoryParams>
        filteredTokenAccounts={filteredTokenAccounts}
        form={form}
        setForm={setForm}
        index={index}
        governance={governance}
      ></ForesightGovernedAccountSelect>
      <Input
        label="Category ID"
        value={form.categoryId}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'categoryId',
          })
        }
        error={formErrors['categoryId']}
      />
      <Input
        label="Market List ID"
        value={form.marketListId}
        type="text"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'marketListId',
          })
        }
        error={formErrors['marketListID']}
      />
    </>
  )
}

export default MakeAddMarketListToCategoryParams
