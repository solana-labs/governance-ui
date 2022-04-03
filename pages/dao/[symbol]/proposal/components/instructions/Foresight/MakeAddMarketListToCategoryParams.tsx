/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import * as yup from 'yup'
import { ForesightMakeAddMarketListToCategoryParams } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  governance as foresightGov,
  types as foresightTypes,
} from '@foresight-tmp/foresight-sdk'
import {
  commonAssets,
  ForesightCategoryIdInput,
  ForesightMarketListIdInput,
  getSchema,
} from './utils'

function MakeAddMarketListToCategoryParams({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const {
    inputProps,
    effector,
    governedAccountSelect,
  } = commonAssets<ForesightMakeAddMarketListToCategoryParams>(
    { categoryId: '', marketListId: '' },
    index,
    governance
  )
  const schema = getSchema({
    categoryId: yup.string().required(),
    marketListId: yup.string().required(),
  })
  async function ixCreator(
    form: ForesightMakeAddMarketListToCategoryParams,
    program: foresightTypes.PredictionMarketProgram
  ) {
    const { ix } = await foresightGov.genAddMarketListToCategoryIx(
      Buffer.from(form.categoryId.padEnd(20)),
      Buffer.from(form.marketListId.padEnd(20)),
      program,
      form.governedAccount.transferAddress!
    )
    return ix
  }
  effector(ixCreator, schema, index)

  return (
    <>
      {governedAccountSelect}
      <ForesightCategoryIdInput {...inputProps} />
      <ForesightMarketListIdInput {...inputProps} />
    </>
  )
}

export default MakeAddMarketListToCategoryParams
