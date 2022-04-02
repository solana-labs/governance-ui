/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { ForesightMakeAddMarketListToCategoryParams } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { governance as foresightGov } from '@foresight-tmp/foresight-sdk'
import {
  ForesightCategoryIdInput,
  ForesightGovernedAccountSelect,
  ForesightMarketListIdInput,
  getFilteredTokenAccounts,
  makeGetInstruction,
  makeHandleSetFormWithErrors,
} from './utils'
import { PredictionMarketProgram } from '@foresight-tmp/foresight-sdk/dist/types'

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
  const handleSetForm = makeHandleSetFormWithErrors(
    form,
    setForm,
    setFormErrors
  )
  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function ixCreator(
    form: ForesightMakeAddMarketListToCategoryParams,
    program: PredictionMarketProgram
  ) {
    const { ix } = await foresightGov.genAddMarketListToCategoryIx(
      Buffer.from(form.categoryId.padEnd(20)),
      Buffer.from(form.marketListId.padEnd(20)),
      program,
      form.governedAccount.transferAddress!
    )
    return ix
  }
  const getInstruction = makeGetInstruction(
    ixCreator,
    form,
    validateInstruction,
    programId,
    wallet
  )
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
  return (
    <>
      <ForesightGovernedAccountSelect<ForesightMakeAddMarketListToCategoryParams>
        filteredTokenAccounts={filteredTokenAccounts}
        form={form}
        handleSetForm={handleSetForm}
        index={index}
        governance={governance}
      ></ForesightGovernedAccountSelect>
      <ForesightCategoryIdInput
        form={form}
        handleSetForm={handleSetForm}
        formErrors={formErrors}
      />
      <ForesightMarketListIdInput
        form={form}
        handleSetForm={handleSetForm}
        formErrors={formErrors}
      />
    </>
  )
}

export default MakeAddMarketListToCategoryParams
